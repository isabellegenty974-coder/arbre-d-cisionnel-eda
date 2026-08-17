import JSZip from 'jszip';

// Schémas d'entités Base44 versionnés dans le dépôt (base44/entities/*.jsonc).
// On les lit ici plutôt que de lister les noms d'entités en dur : ajouter ou
// retirer une entité dans base44/entities/ suffit pour que la sauvegarde la
// prenne en compte automatiquement. Le SDK @base44/sdk n'expose lui-même
// aucun endpoint pour énumérer les entités d'une app à l'exécution (son
// module `entities` est un Proxy générique) — ces fichiers de schéma sont
// donc la seule source fiable pour la découverte dynamique.
const entitySchemaModules = import.meta.glob('/base44/entities/*.jsonc', {
  eager: true,
  query: '?raw',
  import: 'default',
});

function discoverEntityNames() {
  const names = [];
  for (const [path, raw] of Object.entries(entitySchemaModules)) {
    const fallback = path.split('/').pop().replace(/\.jsonc$/, '');
    try {
      const schema = JSON.parse(raw);
      names.push(schema?.name || fallback);
    } catch {
      names.push(fallback);
    }
  }
  return names.sort((a, b) => a.localeCompare(b));
}

// Une URL est considérée comme pointant vers le stockage de fichiers Base44
// si son hôte contient "base44" (ex: base44.app ou un sous-domaine de
// stockage/CDN Base44). C'est la seule heuristique fiable disponible : le SDK
// ne documente pas de domaine de stockage fixe, et les URLs sont produites
// dynamiquement par le serveur lors de l'upload (base44.integrations.Core.UploadFile).
function isBase44FileUrl(value) {
  if (typeof value !== 'string') return false;
  const s = value.trim();
  if (!/^https?:\/\//i.test(s)) return false;
  try {
    return new URL(s).hostname.toLowerCase().includes('base44');
  } catch {
    return false;
  }
}

// Parcourt récursivement un enregistrement (objets/tableaux imbriqués) à la
// recherche de chaînes qui sont des URLs de stockage Base44. Quand une URL
// est trouvée dans un objet qui porte aussi un champ `name`/`file_name`
// voisin (ex: { name, url } dans FicheEleve.documents), ce nom est capturé
// comme nom de fichier suggéré.
function collectFileRefs(node, acc) {
  if (node == null) return;
  if (Array.isArray(node)) {
    node.forEach((item) => collectFileRefs(item, acc));
    return;
  }
  if (typeof node === 'object') {
    const siblingName =
      (typeof node.name === 'string' && node.name.trim()) ||
      (typeof node.file_name === 'string' && node.file_name.trim()) ||
      null;
    for (const val of Object.values(node)) {
      if (typeof val === 'string') {
        if (isBase44FileUrl(val)) acc.push({ url: val, suggestedName: siblingName });
      } else {
        collectFileRefs(val, acc);
      }
    }
  }
}

// Retire les caractères interdits dans un nom de fichier/dossier (Windows et
// ZIP), puis réduit les espaces en underscore pour obtenir des segments du
// type "Nom_Prenom".
function sanitizeSegment(str) {
  const forbidden = ['\\', '/', ':', '*', '?', '"', '<', '>', '|'];
  let cleaned = (str || '').toString();
  for (const ch of forbidden) cleaned = cleaned.split(ch).join('');
  cleaned = cleaned.trim().replace(/\s+/g, '_');
  return cleaned.slice(0, 80) || 'sans_nom';
}

// Dérive un libellé de dossier "Nom_Prenom" à partir des champs les plus
// courants selon l'entité (nom/prenom, eleve_nom/eleve_prenom, user_name…),
// avec repli sur l'identifiant si aucun champ nominatif n'est trouvé.
function labelForRecord(record) {
  const candidates = [
    [record.nom, record.prenom],
    [record.eleve_nom, record.eleve_prenom],
    [record.user_name],
    [record.membre_nom],
    [record.nom_ecole],
    [record.titre],
    [record.libelle],
    [record.name],
  ];
  for (const parts of candidates) {
    const joined = parts.filter(Boolean).join('_');
    if (joined) return sanitizeSegment(joined);
  }
  return sanitizeSegment(record.id);
}

// Évite que deux enregistrements différents portant le même libellé (ex :
// deux élèves "Dupont Jean" dans des écoles différentes) n'écrasent le même
// dossier — désambiguïsation par les 6 derniers caractères de l'id.
function folderLabelFor(usedLabels, entityName, record) {
  const base = labelForRecord(record);
  const map = usedLabels.get(entityName) || new Map();
  usedLabels.set(entityName, map);
  const existingId = map.get(base);
  if (existingId === undefined) {
    map.set(base, record.id);
    return base;
  }
  if (existingId === record.id) return base;
  return `${base}-${String(record.id).slice(-6)}`;
}

function filenameFromUrl(url) {
  try {
    const last = decodeURIComponent(new URL(url).pathname.split('/').filter(Boolean).pop() || '');
    return sanitizeSegment(last) || null;
  } catch {
    return null;
  }
}

const EXT_BY_MIME = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/heic': '.heic',
};

function uniqueFilename(usedFilenames, entityName, label, desired) {
  const key = `${entityName}/${label}`;
  const set = usedFilenames.get(key) || new Set();
  usedFilenames.set(key, set);
  let name = desired;
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';
  let i = 2;
  while (set.has(name)) {
    name = `${base} (${i})${ext}`;
    i++;
  }
  set.add(name);
  return name;
}

// Récupère la totalité des enregistrements d'une entité, page par page (la
// limite de l'API est de 5000 par requête, on reste prudent avec 500). Ne
// jette jamais : une erreur en cours de pagination conserve les pages déjà
// récupérées et remonte le message d'erreur séparément, pour que l'appelant
// puisse consigner l'échec sans interrompre la sauvegarde des autres tables.
async function fetchAllRecords(base44, entityName) {
  const pageSize = 500;
  let skip = 0;
  let all = [];
  let error = null;
  // Garde-fou anti-boucle infinie (500 pages = 250 000 enregistrements max).
  for (let page = 0; page < 500; page++) {
    try {
      const batch = await base44.entities[entityName].list('-created_date', pageSize, skip);
      all = all.concat(batch || []);
      if (!batch || batch.length < pageSize) break;
      skip += pageSize;
    } catch (err) {
      error = err?.message || String(err);
      break;
    }
  }
  return { records: all, error };
}

async function mapWithConcurrency(items, limit, worker) {
  let idx = 0;
  async function run() {
    while (idx < items.length) {
      const current = idx++;
      await worker(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
}

const PHASE_WEIGHTS = { entities: 25, files: 45, dossiers: 15, zip: 15 };
const PHASE_ORDER = ['entities', 'files', 'dossiers', 'zip'];

function makeEmitter(onProgress) {
  return (phase, message, current, total) => {
    if (!onProgress) return;
    let base = 0;
    for (const p of PHASE_ORDER) {
      if (p === phase) break;
      base += PHASE_WEIGHTS[p];
    }
    const frac = total > 0 ? Math.min(1, current / total) : 0;
    const percent = Math.round(base + frac * PHASE_WEIGHTS[phase]);
    onProgress({ phase, message, current, total, percent });
  };
}

// Le brouillon de diagnostic en cours (DiagnosticContext.jsx) est persistant
// en localStorage sur CET appareil, et sauvegardé côté Base44 à chaque
// changement — sauf si l'appareil était hors connexion au moment de la
// saisie, auquel cas seul le brouillon local existe encore. On le détecte
// pour l'inclure à part dans l'archive : ce n'est pas une donnée d'équipe
// (elle vit dans Base44), c'est une donnée d'appareil.
function collectLocalDraft() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const rawSelections = localStorage.getItem('diagnostic_selections');
    const rawEleve = localStorage.getItem('current_eleve');
    const currentDiagnosticId = localStorage.getItem('current_diagnostic_id');
    const selections = rawSelections ? JSON.parse(rawSelections) : null;
    const eleve = rawEleve ? JSON.parse(rawEleve) : null;
    const hasSelections = selections && Object.values(selections).some((arr) => Array.isArray(arr) && arr.length > 0);
    if (!hasSelections && !eleve) return null;
    return {
      avertissement:
        "Brouillon de diagnostic propre à cet appareil (navigateur), capturé au moment de la sauvegarde. " +
        "S'il a été rempli hors connexion, il peut ne correspondre à aucun enregistrement Diagnostic dans donnees.json. " +
        'Vérifiez current_diagnostic_id avant de le considérer comme une donnée à part entière.',
      capture_le: new Date().toISOString(),
      current_diagnostic_id: currentDiagnosticId || null,
      eleve,
      selections,
    };
  } catch {
    return null;
  }
}

// ── Reconstitution des dossiers élèves ──────────────────────────────────────
//
// FicheEleve est le seul pivot fiable : les autres tables s'y relient par un
// vrai identifiant (eleve_id, fiche_id, fiche_eleve_id). Diagnostic n'a AUCUN
// champ id vers FicheEleve (seulement eleve_nom/eleve_prenom en texte) — le
// rapprocher par nom serait un risque de confusion entre deux élèves
// homonymes de sang-froid, donc on ne le fait pas : Diagnostic reste
// uniquement dans donnees.json, et le dossier documente ce choix.
// FicheEleve.annee_scolaire est un libellé texte ("2025-2026"), pas un id :
// la résolution se fait par égalité de texte avec AnneeScolaire.libelle.
// FicheEleve.ecole/.classe sont du texte libre ; la seule résolution fiable
// vers EcoleRased/ClasseEcole passe par l'EleveRased lié (via classe_id/ecole_id),
// s'il existe.
function buildIndexes(donnees) {
  const byId = {};
  for (const [entityName, records] of Object.entries(donnees)) {
    const map = new Map();
    for (const r of records || []) if (r?.id) map.set(r.id, r);
    byId[entityName] = map;
  }

  const indexBy = (records, field) => {
    const map = new Map();
    for (const r of records || []) {
      const key = r?.[field];
      if (!key) continue;
      const arr = map.get(key) || [];
      arr.push(r);
      map.set(key, arr);
    }
    return map;
  };

  const anneeScolaireByLibelle = new Map();
  for (const a of donnees.AnneeScolaire || []) {
    if (a.libelle) anneeScolaireByLibelle.set(a.libelle, a);
  }

  return {
    byId,
    eleveRasedByFicheId: indexBy(donnees.EleveRased, 'fiche_eleve_id'),
    historiqueByFicheId: indexBy(donnees.HistoriqueEDA, 'eleve_id'),
    notesByFicheId: indexBy(donnees.NotesMembre, 'fiche_id'),
    presenceByFicheId: indexBy(donnees.Presence, 'fiche_id'),
    anneeScolaireByLibelle,
  };
}

// Les quatre catégories demandées : EleveRased pointant vers une FicheEleve
// inexistante, FicheEleve visées par plusieurs EleveRased (doublons
// potentiels), FicheEleve sans aucun EleveRased (orphelines), et EleveRased
// dont l'école ou la classe ne résout vers aucun id existant.
function buildAnomalies(donnees, idx) {
  const fichesById = idx.byId.FicheEleve || new Map();
  const ecolesById = idx.byId.EcoleRased || new Map();
  const classesById = idx.byId.ClasseEcole || new Map();

  const eleveRasedSansFiche = (donnees.EleveRased || [])
    .filter((er) => er.fiche_eleve_id && !fichesById.has(er.fiche_eleve_id))
    .map((er) => ({ id: er.id, nom: er.nom, prenom: er.prenom, fiche_eleve_id: er.fiche_eleve_id }));

  const fichesAvecPlusieursEleveRased = [];
  for (const [ficheId, list] of idx.eleveRasedByFicheId.entries()) {
    if (list.length > 1) {
      const fiche = fichesById.get(ficheId);
      fichesAvecPlusieursEleveRased.push({
        fiche_eleve_id: ficheId,
        eleve: fiche ? `${fiche.nom} ${fiche.prenom}` : '(fiche introuvable)',
        eleve_rased_ids: list.map((e) => e.id),
      });
    }
  }

  const fichesOrphelines = (donnees.FicheEleve || [])
    .filter((f) => !idx.eleveRasedByFicheId.has(f.id))
    .map((f) => ({ id: f.id, nom: f.nom, prenom: f.prenom }));

  const eleveRasedSansLienResolu = (donnees.EleveRased || [])
    .filter((er) => !er.ecole_id || !ecolesById.has(er.ecole_id) || !er.classe_id || !classesById.has(er.classe_id))
    .map((er) => ({
      id: er.id,
      nom: er.nom,
      prenom: er.prenom,
      ecole_id: er.ecole_id || null,
      ecole_resolue: Boolean(er.ecole_id && ecolesById.has(er.ecole_id)),
      classe_id: er.classe_id || null,
      classe_resolue: Boolean(er.classe_id && classesById.has(er.classe_id)),
    }));

  return { eleveRasedSansFiche, fichesAvecPlusieursEleveRased, fichesOrphelines, eleveRasedSansLienResolu };
}

// Un FicheEleve peut avoir 0, 1 (cas normal) ou plusieurs (anomalie) EleveRased
// liés. On documente ce choix explicitement dans le dossier plutôt que de le
// masquer : quand il y en a plusieurs, on résout l'école/classe via le premier
// et on liste les autres dans `eleve_rased_supplementaires`.
function resolveEcoleClasseAnnee(fiche, eleveRasedList, idx) {
  const ecolesById = idx.byId.EcoleRased || new Map();
  const classesById = idx.byId.ClasseEcole || new Map();
  const principal = eleveRasedList[0] || null;
  const ecole = principal?.ecole_id ? ecolesById.get(principal.ecole_id) || null : null;
  const classe = principal?.classe_id ? classesById.get(principal.classe_id) || null : null;
  const annee = fiche.annee_scolaire ? idx.anneeScolaireByLibelle.get(fiche.annee_scolaire) || null : null;
  return {
    ecole,
    ecole_resolue: Boolean(ecole),
    ecole_texte_libre: fiche.ecole || null,
    classe,
    classe_resolue: Boolean(classe),
    classe_texte_libre: fiche.classe || null,
    annee_scolaire: annee,
    annee_scolaire_resolue: Boolean(annee),
    annee_scolaire_libelle: fiche.annee_scolaire || null,
  };
}

function documentsForFiche(fiche, fileIndex) {
  const refs = [];
  collectFileRefs(fiche, refs);
  return refs.map((ref) => {
    const entry = fileIndex.get(ref.url);
    return {
      url: ref.url,
      nom_suggere: ref.suggestedName || null,
      recupere: entry?.status === 'ok',
      chemin_relatif_zip: entry?.status === 'ok' ? `fichiers/${entry.entityName}/${entry.label}/${entry.filename}` : null,
      erreur: entry?.status === 'error' ? entry.error : null,
    };
  });
}

// Fusionne interventions, évaluations EDA, notes et ajouts de documents dans
// une seule chronologie triée par date.
function buildTimeline(fiche, historique, notes) {
  const events = [];
  (fiche.interventions || []).forEach((iv) => {
    events.push({
      date: iv.date || null,
      type: 'intervention',
      titre: `Intervention${iv.profession ? ' — ' + iv.profession : ''}`,
      detail: iv.description || '',
    });
  });
  historique.forEach((h) => {
    events.push({
      date: h.date || null,
      type: 'historique_eda',
      titre: `Évaluation EDA${h.domaine ? ' — ' + h.domaine : ''}${h.sous_domaine ? ' / ' + h.sous_domaine : ''}`,
      detail: [
        h.hypotheses?.length ? `Hypothèses : ${h.hypotheses.join('; ')}` : '',
        h.recommandations?.length ? `Recommandations : ${h.recommandations.join('; ')}` : '',
      ].filter(Boolean).join(' — '),
    });
  });
  notes.forEach((n) => {
    events.push({
      date: n.updated_at || null,
      type: 'note',
      titre: `Note — ${n.membre_nom || n.membre_profession || 'membre'}`,
      detail: n.contenu || '',
    });
  });
  (fiche.documents || []).forEach((d) => {
    events.push({
      date: d.uploadedAt || null,
      type: 'document',
      titre: `Document ajouté — ${d.name || 'sans nom'}`,
      detail: '',
    });
  });
  events.sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return da - db;
  });
  return events;
}

function buildDossierData(fiche, idx, fileIndex) {
  const eleveRasedList = idx.eleveRasedByFicheId.get(fiche.id) || [];
  const historique = idx.historiqueByFicheId.get(fiche.id) || [];
  const notes = idx.notesByFicheId.get(fiche.id) || [];
  const presences = idx.presenceByFicheId.get(fiche.id) || [];
  return {
    genere_le: new Date().toISOString(),
    fiche_eleve: fiche,
    eleve_rased: eleveRasedList,
    ecole: resolveEcoleClasseAnnee(fiche, eleveRasedList, idx),
    historique_eda: historique,
    notes_membres: notes,
    presences,
    documents: documentsForFiche(fiche, fileIndex),
    diagnostics: {
      resolu: false,
      note:
        "La table Diagnostic ne porte aucun identifiant fiable vers FicheEleve (seulement eleve_nom/eleve_prenom " +
        "en texte libre) — un rapprochement par nom risquerait de mélanger deux élèves homonymes. Elle n'est donc " +
        "pas fusionnée ici. L'historique de suivi fiable pour cet élève est dans historique_eda ci-dessus. La " +
        'table Diagnostic complète reste disponible telle quelle dans donnees.json.',
    },
    chronologie: buildTimeline(fiche, historique, notes),
  };
}

function esc(s) {
  return (s ?? '').toString()
    .split('&').join('&amp;')
    .split('<').join('&lt;')
    .split('>').join('&gt;')
    .split('"').join('&quot;');
}

function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return esc(d);
  return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

const TIMELINE_ICON = { intervention: '🩺', historique_eda: '📊', note: '📝', document: '📎' };

// Page HTML autonome (CSS inline, aucune dépendance externe) — doit rester
// lisible en ouvrant le fichier directement depuis le disque (protocole
// file://), donc aucun appel réseau, aucune police/script distants.
function renderDossierHtml(fiche, dossier, anomaliesForFiche) {
  const nomComplet = `${esc(fiche.nom || '')} ${esc(fiche.prenom || '')}`.trim();
  const responsables = [fiche.responsable1, fiche.responsable2].filter((r) => r && (r.prenom_nom || r.email));

  const anomaliesHtml = anomaliesForFiche.length === 0 ? '' : `
    <div class="alert">
      <strong>⚠️ Anomalies détectées pour cet élève</strong>
      <ul>${anomaliesForFiche.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
    </div>`;

  const identiteRows = [
    ['Date de naissance', fmtDate(fiche.date_naissance)],
    ['Statut du suivi', esc(fiche.statut || '—')],
    ['École', dossier.ecole.ecole ? esc(dossier.ecole.ecole.nom) + ' (résolue)' : esc(dossier.ecole.ecole_texte_libre || '—') + ' (texte libre, non résolue)'],
    ['Classe', dossier.ecole.classe ? esc(dossier.ecole.classe.nom) + ' (résolue)' : esc(dossier.ecole.classe_texte_libre || '—') + ' (texte libre, non résolue)'],
    ['Année scolaire', dossier.ecole.annee_scolaire_resolue ? esc(dossier.ecole.annee_scolaire_libelle) + ' (résolue)' : esc(dossier.ecole.annee_scolaire_libelle || '—')],
    ['Créée par', `${esc(fiche.createdByName || '—')}${fiche.createdByProfession ? ' · ' + esc(fiche.createdByProfession) : ''}`],
    ['Langue à la maison', esc(fiche.langue_maison || '—')],
    ['Autorisation parentale', fiche.autorisation_parentale ? `Oui${fiche.date_autorisation ? ' (' + fmtDate(fiche.date_autorisation) + ')' : ''}` : 'Non renseignée'],
  ];

  const responsablesHtml = responsables.length === 0 ? '<p class="muted">Aucun responsable légal renseigné.</p>' : responsables.map((r, i) => `
    <div class="card">
      <div class="card-title">Responsable ${i + 1}${r.lien ? ' — ' + esc(r.lien) : ''}</div>
      <div>${esc(r.prenom_nom || '—')}</div>
      <div class="muted">${[r.tel_portable, r.tel_fixe, r.email].filter(Boolean).map(esc).join(' · ') || 'Aucun contact renseigné'}</div>
    </div>`).join('');

  const timelineHtml = dossier.chronologie.length === 0 ? '<p class="muted">Aucun événement daté.</p>' : dossier.chronologie.map((e) => `
    <div class="tl-item">
      <div class="tl-date">${fmtDate(e.date)}</div>
      <div class="tl-body">
        <div class="tl-title">${TIMELINE_ICON[e.type] || '•'} ${esc(e.titre)}</div>
        ${e.detail ? `<div class="tl-detail">${esc(e.detail)}</div>` : ''}
      </div>
    </div>`).join('');

  const documentsHtml = dossier.documents.length === 0 ? '<p class="muted">Aucun document joint.</p>' : `<ul class="docs">${dossier.documents.map((d) => {
    const label = esc(d.nom_suggere || d.url.split('/').pop() || 'document');
    if (d.recupere) return `<li>✅ <a href="${esc(d.chemin_relatif_zip.split('/').map(encodeURIComponent).join('/'))}">${label}</a></li>`;
    return `<li>❌ ${label} — non récupéré (${esc(d.erreur || 'échec')})</li>`;
  }).join('')}</ul>`;

  const notesHtml = dossier.notes_membres.length === 0 ? '<p class="muted">Aucune note.</p>' : dossier.notes_membres.map((n) => `
    <div class="card">
      <div class="card-title">${esc(n.membre_nom || n.membre_profession || 'Membre')} — ${fmtDate(n.updated_at)}</div>
      <div>${esc(n.contenu || '')}</div>
    </div>`).join('');

  const presencesHtml = dossier.presences.length === 0 ? '<p class="muted">Aucune consultation enregistrée.</p>' : `<table><thead><tr><th>Membre</th><th>Dernière consultation</th></tr></thead><tbody>${
    dossier.presences.map((p) => `<tr><td>${esc(p.user_name || '—')}</td><td>${fmtDate(p.last_seen)}</td></tr>`).join('')
  }</tbody></table>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Dossier — ${nomComplet}</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; color: #182840; background: #F0F3F8; margin: 0; padding: 24px; }
  .sheet { max-width: 820px; margin: 0 auto; background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,.08); }
  header { background: #1A3353; color: #fff; padding: 24px 28px; }
  header h1 { margin: 0 0 4px; font-size: 22px; }
  header .sub { color: rgba(255,255,255,.6); font-size: 12.5px; }
  main { padding: 24px 28px; }
  h2 { font-size: 15px; color: #182840; border-bottom: 2px solid #EAF2FB; padding-bottom: 6px; margin: 28px 0 14px; }
  h2:first-of-type { margin-top: 0; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  td, th { padding: 7px 10px; border-bottom: 1px solid #F0F3F8; text-align: left; }
  td:first-child { color: #566880; width: 220px; }
  .muted { color: #94A3B8; font-size: 13px; }
  .card { background: #F8FAFD; border: 1px solid #E8EDF5; border-radius: 10px; padding: 12px 14px; margin-bottom: 10px; font-size: 13px; }
  .card-title { font-weight: 700; color: #254D7A; margin-bottom: 4px; }
  .tl-item { display: flex; gap: 14px; padding: 10px 0; border-bottom: 1px solid #F0F3F8; }
  .tl-date { width: 130px; flex-shrink: 0; font-size: 11.5px; color: #566880; padding-top: 2px; }
  .tl-title { font-weight: 600; font-size: 13px; }
  .tl-detail { font-size: 12.5px; color: #566880; margin-top: 3px; white-space: pre-wrap; }
  .docs { padding-left: 18px; font-size: 13px; }
  .docs a { color: #3B82C4; }
  .alert { background: #FEF0E4; border: 1px solid #B85C1A; color: #B85C1A; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; }
  .alert ul { margin: 6px 0 0; padding-left: 18px; }
  .badge { display: inline-block; background: #EAF2FB; color: #254D7A; font-size: 11px; font-weight: 700; padding: 2px 9px; border-radius: 10px; margin-left: 8px; }
  footer { padding: 14px 28px 22px; font-size: 11px; color: #94A3B8; }
</style>
</head>
<body>
  <div class="sheet">
    <header>
      <h1>${nomComplet}<span class="badge">${esc(fiche.statut || 'Statut inconnu')}</span></h1>
      <div class="sub">Dossier RASED · généré le ${fmtDate(dossier.genere_le)} · document hors ligne, à conserver sur support chiffré</div>
    </header>
    <main>
      ${anomaliesHtml}

      <h2>Identité</h2>
      <table>${identiteRows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${v}</td></tr>`).join('')}</table>

      <h2>Responsables légaux</h2>
      ${responsablesHtml}

      <h2>Chronologie</h2>
      ${timelineHtml}

      <h2>Documents joints</h2>
      ${documentsHtml}

      <h2>Notes des membres de l'équipe</h2>
      ${notesHtml}

      <h2>Dernières consultations de ce dossier (présence)</h2>
      ${presencesHtml}

      <h2>Diagnostics (arbre décisionnel EDA)</h2>
      <p class="muted">${esc(dossier.diagnostics.note)}</p>
    </main>
    <footer>fiche_eleve_id : ${esc(fiche.id)} — donnée nominative couverte par le secret professionnel.</footer>
  </div>
</body>
</html>`;
}

function buildJournal({ startedAt, entityStats, fileStats, failures, localDraftIncluded, anomalies, dossierCount }) {
  const nameWidth = entityStats.reduce((w, e) => Math.max(w, e.name.length), 5);
  const lines = [];
  lines.push(`Sauvegarde RASED — ${startedAt.toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}`);
  lines.push('='.repeat(50));
  lines.push('');
  lines.push('Enregistrements par table :');
  let totalRecords = 0;
  entityStats.forEach((e) => {
    totalRecords += e.count;
    lines.push(
      `  ${e.name.padEnd(nameWidth)} : ${e.count} enregistrement(s)` + (e.error ? `  [ERREUR: ${e.error}]` : '')
    );
  });
  lines.push(`  ${'TOTAL'.padEnd(nameWidth)} : ${totalRecords} enregistrement(s) sur ${entityStats.length} table(s)`);
  lines.push('');
  lines.push('Fichiers joints :');
  lines.push(`  Récupérés : ${fileStats.success} / ${fileStats.total} attendu(s)`);
  lines.push('');
  lines.push('Brouillon local (localStorage de cet appareil) :');
  lines.push(localDraftIncluded ? '  Détecté et inclus dans brouillon-local.json.' : '  Aucun brouillon en attente sur cet appareil.');
  lines.push('');
  lines.push('Dossiers élèves reconstitués :');
  lines.push(`  ${dossierCount} dossier(s) dans eleves/ (un par FicheEleve) — détail dans anomalies.json`);
  lines.push('');
  lines.push('Anomalies EleveRased / FicheEleve (voir anomalies.json pour le détail) :');
  lines.push(`  EleveRased pointant vers une FicheEleve inexistante : ${anomalies.eleveRasedSansFiche.length}`);
  lines.push(`  FicheEleve visées par plusieurs EleveRased (doublons potentiels) : ${anomalies.fichesAvecPlusieursEleveRased.length}`);
  lines.push(`  FicheEleve sans aucun EleveRased lié (orphelines) : ${anomalies.fichesOrphelines.length}`);
  lines.push(`  EleveRased avec école ou classe non résolue : ${anomalies.eleveRasedSansLienResolu.length}`);
  lines.push('');
  if (failures.length === 0) {
    lines.push('Aucun échec.');
  } else {
    lines.push(`Échecs (${failures.length}) :`);
    failures.forEach((f) => {
      if (f.context === 'table') {
        lines.push(`  - [Table] ${f.entity} : ${f.message}`);
      } else {
        lines.push(`  - [Fichier] ${f.entity} / ${f.label} : ${f.message}`);
        lines.push(`      ${f.url}`);
      }
    });
  }
  lines.push('');
  lines.push("Cette archive contient des données nominatives d'élèves couvertes par le");
  lines.push('secret professionnel. À conserver exclusivement sur un support chiffré.');
  return lines.join('\n');
}

function backupFilename(date) {
  const p = (n) => String(n).padStart(2, '0');
  return `sauvegarde-rased-${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}-${p(date.getHours())}${p(date.getMinutes())}.zip`;
}

// Orchestre la sauvegarde complète : découverte des entités, récupération de
// toutes les données, téléchargement des fichiers joints référencés (sans
// doublon), puis génération de l'archive ZIP. Aucune erreur individuelle
// (table ou fichier) n'interrompt le processus — tout est consigné dans
// `summary.failures` et dans journal.txt à l'intérieur de l'archive.
//
// Refuse de démarrer hors connexion : une sauvegarde lancée sans réseau ne
// pourrait interroger ni Base44 ni le stockage de fichiers, et produirait une
// archive vide ou tronquée sans que ce soit visible avant la fin.
export async function runSauvegarde({ base44, onProgress }) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new Error(
      "Aucune connexion réseau détectée. La sauvegarde a besoin d'accéder à Base44 pour récupérer les données et les fichiers joints — réessayez une fois reconnecté."
    );
  }

  const startedAt = new Date();
  const emit = makeEmitter(onProgress);
  const failures = [];

  const entityNames = discoverEntityNames();
  emit('entities', 'Découverte des entités…', 0, entityNames.length || 1);

  const donnees = {};
  const entityStats = [];
  for (let i = 0; i < entityNames.length; i++) {
    const name = entityNames[i];
    emit('entities', `Récupération de « ${name} »…`, i, entityNames.length);
    const { records, error } = await fetchAllRecords(base44, name);
    donnees[name] = records;
    entityStats.push({ name, count: records.length, error });
    if (error) failures.push({ context: 'table', entity: name, message: error });
  }
  emit('entities', 'Données récupérées', entityNames.length, entityNames.length);

  // Indexation des fichiers référencés par n'importe quel enregistrement,
  // dédoublonnée par URL : chaque fichier n'est téléchargé qu'une seule fois,
  // rattaché au premier enregistrement qui le référence.
  const usedLabels = new Map();
  const fileIndex = new Map();
  for (const name of entityNames) {
    for (const record of donnees[name] || []) {
      const label = folderLabelFor(usedLabels, name, record);
      const refs = [];
      collectFileRefs(record, refs);
      for (const ref of refs) {
        if (!fileIndex.has(ref.url)) {
          fileIndex.set(ref.url, { url: ref.url, suggestedName: ref.suggestedName, entityName: name, label });
        }
      }
    }
  }

  const fileEntries = Array.from(fileIndex.values());
  const usedFilenames = new Map();
  const zip = new JSZip();
  let filesDone = 0;
  emit('files', `Téléchargement des fichiers joints (0/${fileEntries.length})…`, 0, fileEntries.length || 1);

  await mapWithConcurrency(fileEntries, 4, async (entry) => {
    try {
      const res = await fetch(entry.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      let desired = entry.suggestedName || filenameFromUrl(entry.url) || 'fichier';
      if (!/\.[a-z0-9]{2,5}$/i.test(desired) && EXT_BY_MIME[blob.type]) {
        desired += EXT_BY_MIME[blob.type];
      }
      const filename = uniqueFilename(usedFilenames, entry.entityName, entry.label, sanitizeSegment(desired));
      zip.file(`fichiers/${entry.entityName}/${entry.label}/${filename}`, blob);
      entry.status = 'ok';
      entry.filename = filename;
    } catch (err) {
      const message = err?.message || String(err);
      entry.status = 'error';
      entry.error = message;
      failures.push({
        context: 'fichier',
        entity: entry.entityName,
        label: entry.label,
        url: entry.url,
        message,
      });
    } finally {
      filesDone++;
      emit('files', `Téléchargement des fichiers joints (${filesDone}/${fileEntries.length})…`, filesDone, fileEntries.length || 1);
    }
  });

  const fileFailureCount = failures.filter((f) => f.context === 'fichier').length;
  const fileStats = { total: fileEntries.length, success: fileEntries.length - fileFailureCount };

  // ── Reconstitution des dossiers élèves ──────────────────────────────────
  // Un dossier par FicheEleve (le seul pivot fiable — voir buildDossierData).
  // La table Eleve, elle, reste intégralement dans donnees.json ci-dessous :
  // elle n'est reliée à rien par un identifiant et n'est donc mêlée à aucun
  // dossier, mais on ne la retire pas de la sauvegarde brute pour autant.
  const idx = buildIndexes(donnees);
  const anomalies = buildAnomalies(donnees, idx);

  const ficheOrphelineIds = new Set(anomalies.fichesOrphelines.map((f) => f.id));
  const fichesEnDoublonById = new Map(anomalies.fichesAvecPlusieursEleveRased.map((a) => [a.fiche_eleve_id, a]));

  const fiches = donnees.FicheEleve || [];
  emit('dossiers', `Reconstitution des dossiers élèves (0/${fiches.length})…`, 0, fiches.length || 1);
  let dossiersDone = 0;
  for (const fiche of fiches) {
    const dossier = buildDossierData(fiche, idx, fileIndex);
    const anomaliesForFiche = [];
    if (ficheOrphelineIds.has(fiche.id)) {
      anomaliesForFiche.push("Aucun EleveRased ne pointe vers cette fiche (école/classe non vérifiables via un identifiant).");
    }
    const doublon = fichesEnDoublonById.get(fiche.id);
    if (doublon) {
      anomaliesForFiche.push(`${doublon.eleve_rased_ids.length} enregistrements EleveRased pointent vers cette même fiche (doublon potentiel) : ${doublon.eleve_rased_ids.join(', ')}.`);
    }
    dossier.anomalies = anomaliesForFiche;

    // Même libellé que le dossier de fichiers de cette FicheEleve
    // (fichiers/FicheEleve/<label>/) : les liens relatifs de dossier.html
    // pointent correctement vers ../../fichiers/FicheEleve/<label>/…
    const label = folderLabelFor(usedLabels, 'FicheEleve', fiche);
    zip.file(`eleves/${label}/dossier.json`, JSON.stringify(dossier, null, 2));
    zip.file(`eleves/${label}/dossier.html`, renderDossierHtml(fiche, dossier, anomaliesForFiche));

    dossiersDone++;
    emit('dossiers', `Reconstitution des dossiers élèves (${dossiersDone}/${fiches.length})…`, dossiersDone, fiches.length || 1);
  }

  const localDraft = collectLocalDraft();
  if (localDraft) {
    zip.file('brouillon-local.json', JSON.stringify(localDraft, null, 2));
  }

  zip.file('anomalies.json', JSON.stringify({ genere_le: startedAt.toISOString(), ...anomalies }, null, 2));

  zip.file(
    'donnees.json',
    JSON.stringify({ genere_le: startedAt.toISOString(), entites: donnees }, null, 2)
  );
  zip.file('journal.txt', buildJournal({
    startedAt,
    entityStats,
    fileStats,
    failures,
    localDraftIncluded: Boolean(localDraft),
    anomalies,
    dossierCount: fiches.length,
  }));

  emit('zip', "Compression de l'archive…", 0, 100);
  const blob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (meta) => emit('zip', "Compression de l'archive…", meta.percent, 100)
  );
  emit('zip', 'Archive prête', 100, 100);

  const summary = {
    startedAt,
    finishedAt: new Date(),
    entityStats,
    totalRecords: entityStats.reduce((s, e) => s + e.count, 0),
    fileStats,
    failures,
    localDraftIncluded: Boolean(localDraft),
    dossierCount: fiches.length,
    anomalies,
    anomalyCount:
      anomalies.eleveRasedSansFiche.length +
      anomalies.fichesAvecPlusieursEleveRased.length +
      anomalies.fichesOrphelines.length +
      anomalies.eleveRasedSansLienResolu.length,
  };

  return { blob, filename: backupFilename(startedAt), summary };
}
