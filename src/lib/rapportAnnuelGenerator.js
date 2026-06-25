import { jsPDF } from 'jspdf';

// ── Équipe RASED réelle ──────────────────────────────────────────────────────
const EQUIPE = [
  { civilite: 'Mme', prenom: 'Isabelle', nom: 'GENTY', profession: 'Psy EN EDA' },
  { civilite: 'Mme', prenom: 'Laurence', nom: 'PETIT', profession: 'MaDR' },
  { civilite: 'Mme', prenom: 'Véronique', nom: 'CARO', profession: 'MaDP' },
];

const COLORS = { 'Psy EN EDA': '#1A3353', 'MaDR': '#1E7A52', 'MaDP': '#B85C1A' };
const TITRES = {
  'Psy EN EDA': "Psychologue de l'Éducation Nationale · EDA",
  'MaDR': 'Maître à Dominante Relationnelle (MaDR)',
  'MaDP': 'Maître à Dominante Pédagogique (MaDP)',
};
const TYPE_COLORS = { 'Apprentissage': '#3B82C4', 'Comportement': '#1E7A52', 'Handicap': '#B85C1A' };
const DIFFICULTE_COLORS = {
  'Anxiété / Inhibition': '#1E7A52',
  'Difficultés relationnelles': '#3B82C4',
  'Comportement oppositionnel': '#B85C1A',
  'Impulsivité': '#D4A574',
  'Autre': '#94A3B8',
};
const DOMAINE_COLORS = {
  'Lecture / Décodage': '#B85C1A',
  'Écriture / Graphisme': '#D4A574',
  'Maths / Numération': '#3B82C4',
  'Méthodes de travail': '#5B4FA4',
  'Production écrite': '#1E7A52',
  'Autre': '#94A3B8',
};

const CYCLES = ['Cycle 1', 'Cycle 2', 'Cycle 3'];
const TYPES = ['Apprentissage', 'Comportement', 'Handicap'];

// ── Helpers géométrie / couleur ──────────────────────────────────────────────
function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0, 0, 0];
}
function setFill(doc, hex) { doc.setFillColor(...hexToRgb(hex)); }
function setText(doc, hex) { doc.setTextColor(...hexToRgb(hex)); }
function setDraw(doc, hex) { doc.setDrawColor(...hexToRgb(hex)); }
function polar(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}
function pct(n, total) { return total > 0 ? Math.round((n / total) * 1000) / 10 : 0; }
function norm(s) { return (s || '').toString().toLowerCase(); }

// ── Helpers données ──────────────────────────────────────────────────────────
function getCycle(classe) {
  const c = norm(classe);
  if (/^(tps|ps|ms|gs)\b/.test(c)) return 'Cycle 1';
  if (/^(cp|ce1|ce2)\b/.test(c)) return 'Cycle 2';
  if (/^(cm1|cm2)\b/.test(c)) return 'Cycle 3';
  return null;
}

const MOTS_HANDICAP = ['mdph', 'handicap', 'aeeh', 'pps ', 'avs', 'ash', 'ulis'];

function ficheTexte(f) {
  return [f.observations, f.notes, f.rapport, ...(f.recommandations || []), ...(f.hypotheses || []),
    ...((f.interventions || []).flatMap(i => [i.description, i.commentaire]))]
    .filter(Boolean).join(' ').toLowerCase();
}

function getTypeFiche(f) {
  const txt = ficheTexte(f);
  if (MOTS_HANDICAP.some(m => txt.includes(m))) return 'Handicap';
  return (f.score_comportement || 0) > (f.score_apprentissages || 0) ? 'Comportement' : 'Apprentissage';
}

function getCategorieDemande(f) {
  if (f.createdByProfession === 'Psy EN EDA') return 'Psy-EN';
  if (f.createdByProfession === 'MaDR') return 'MaDR';
  if (f.createdByProfession === 'MaDP') return 'MaDP';
  return 'Aménagements';
}

function actesDe(fiches, profession) {
  return fiches.flatMap(f => (f.interventions || [])
    .filter(iv => iv.profession === profession)
    .map(iv => ({ ...iv, fiche: f })));
}
function compte(actes, ...mots) {
  return actes.filter(a => mots.some(m => norm(a.description).includes(m))).length;
}
function compteRegex(actes, regex) {
  return actes.filter(a => regex.test(a.description || '')).length;
}
function compteTexteFiches(fiches, ...mots) {
  return fiches.filter(f => mots.some(m => ficheTexte(f).includes(m))).length;
}
function bucketDifficulte(sousDomaine) {
  const s = norm(sousDomaine);
  if (s.includes('anxi') || s.includes('inhibition')) return 'Anxiété / Inhibition';
  if (s.includes('interaction') || s.includes('relation')) return 'Difficultés relationnelles';
  if (s.includes('opposition')) return 'Comportement oppositionnel';
  if (s.includes('impulsiv')) return 'Impulsivité';
  return 'Autre';
}
function bucketDomaine(sousDomaine) {
  const s = norm(sousDomaine);
  if (s.includes('lecture') || s.includes('codage')) return 'Lecture / Décodage';
  if (s.includes('criture') || s.includes('graphisme')) return 'Écriture / Graphisme';
  if (s.includes('math') || s.includes('num') || s.includes('calcul')) return 'Maths / Numération';
  if (s.includes('thode')) return 'Méthodes de travail';
  if (s.includes('production')) return 'Production écrite';
  return 'Autre';
}
function anneeSuivante(libelle) {
  const m = /^(\d{4})-(\d{4})$/.exec(libelle || '');
  return m ? `${Number(m[1]) + 1}-${Number(m[2]) + 1}` : '';
}
function moisScolaires(libelle) {
  const m = /^(\d{4})-(\d{4})$/.exec(libelle || '');
  const y1 = m ? Number(m[1]) : new Date().getFullYear();
  const noms = ['Sept', 'Oct', 'Nov', 'Déc', 'Janv', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août'];
  return noms.map((label, i) => ({
    label,
    month: (8 + i) % 12,
    year: y1 + Math.floor((8 + i) / 12),
  }));
}

// ── Calcul de l'ensemble des indicateurs réels ──────────────────────────────
function computeStats({ fiches, historique, eleves, libelle }) {
  const fichesAnnee = fiches.filter(f => f.annee_scolaire === libelle);
  const ficheById = new Map(fichesAnnee.map(f => [f.id, f]));
  const histAnnee = historique.filter(h => ficheById.has(h.eleve_id));

  const effectifSecteur = eleves.length;
  const totalDemandes = fichesAnnee.length;

  // Répartition par intervenant
  const parCategorie = { 'Psy-EN': 0, 'MaDR': 0, 'MaDP': 0, 'Aménagements': 0 };
  fichesAnnee.forEach(f => { parCategorie[getCategorieDemande(f)]++; });

  // Répartition cycle x type
  const matrice = {};
  CYCLES.forEach(c => { matrice[c] = { Apprentissage: 0, Comportement: 0, Handicap: 0 }; });
  fichesAnnee.forEach(f => {
    const cy = getCycle(f.classe);
    if (cy) matrice[cy][getTypeFiche(f)]++;
  });

  // ── PSY-EN EDA ──
  const fichesPsy = fichesAnnee.filter(f => f.createdByProfession === 'Psy EN EDA');
  const actesPsy = actesDe(fichesAnnee, 'Psy EN EDA');
  const histPsy = histAnnee.filter(h => ficheById.get(h.eleve_id)?.createdByProfession === 'Psy EN EDA');
  const parCyclePsy = {};
  CYCLES.forEach(c => { parCyclePsy[c] = 0; });
  fichesPsy.forEach(f => { const c = getCycle(f.classe); if (c) parCyclePsy[c]++; });

  const psy = {
    entretiensEleves: compte(actesPsy, "entretien avec l'élève"),
    passationsPsycho: compte(actesPsy, 'passation psychométrique'),
    observationsClasse: compte(actesPsy, 'observation en classe'),
    analysesSituation: histPsy.length,
    comptesRendus: fichesPsy.filter(f => (f.hypotheses || []).length > 0).length,
    entretiensFamilles: compte(actesPsy, 'entretien avec la famille'),
    participationsESS: compteRegex(actesPsy, /\bess\b/i),
    participationsEE: compteRegex(actesPsy, /\bee\b/i),
    orientationsExternes: compteTexteFiches(fichesPsy, 'orientation'),
    dossiersMDPH: compteTexteFiches(fichesPsy, 'mdph'),
    liaisonsEnseignants: compte(actesPsy, "liaison avec l'enseignant"),
    parCycle: parCyclePsy,
    total: fichesPsy.length,
    clotures: fichesPsy.filter(f => f.statut === 'Clôturé').length,
  };

  // ── MaDR ──
  const actesMadr = actesDe(fichesAnnee, 'MaDR');
  const idsActeMadr = new Set(actesMadr.map(a => a.fiche.id));
  const fichesMadr = fichesAnnee.filter(f => f.createdByProfession === 'MaDR' || idsActeMadr.has(f.id));
  const seancesMadr = actesMadr.filter(a => norm(a.description).includes('séance de rééducation'));
  const suivisGroupeMadr = seancesMadr.filter(a => norm(a.commentaire).includes('groupe')).length;
  const parCycleMadr = {};
  CYCLES.forEach(c => { parCycleMadr[c] = 0; });
  fichesMadr.forEach(f => { const c = getCycle(f.classe); if (c) parCycleMadr[c]++; });

  const difficultesMadr = {};
  Object.keys(DIFFICULTE_COLORS).forEach(k => { difficultesMadr[k] = 0; });
  histAnnee
    .filter(h => norm(h.domaine).includes('comport') &&
      (ficheById.get(h.eleve_id)?.createdByProfession === 'MaDR' || idsActeMadr.has(h.eleve_id)))
    .forEach(h => { difficultesMadr[bucketDifficulte(h.sous_domaine)]++; });

  const madr = {
    elevesEnCharge: fichesMadr.length,
    seancesReeducation: seancesMadr.length,
    suivisIndividuels: seancesMadr.length - suivisGroupeMadr,
    suivisGroupe: suivisGroupeMadr,
    clotureees: fichesMadr.filter(f => f.statut === 'Clôturé').length,
    entretiensFamilles: compte(actesMadr, 'entretien avec la famille'),
    liaisonsEnseignants: compte(actesMadr, "liaison avec l'enseignant"),
    participationsEE: compteRegex(actesMadr, /\bee\b/i),
    parCycle: parCycleMadr,
    difficultes: difficultesMadr,
    total: fichesMadr.length,
    actesTotal: actesMadr.length,
  };

  // ── MaDP ──
  const actesMadp = actesDe(fichesAnnee, 'MaDP');
  const idsActeMadp = new Set(actesMadp.map(a => a.fiche.id));
  const fichesMadp = fichesAnnee.filter(f => f.createdByProfession === 'MaDP' || idsActeMadp.has(f.id));
  const seancesMadp = actesMadp.filter(a => norm(a.description).includes("séance d'aide pédagogique"));
  const suivisGroupeMadp = seancesMadp.filter(a => norm(a.commentaire).includes('groupe')).length;
  const parCycleMadp = {};
  CYCLES.forEach(c => { parCycleMadp[c] = 0; });
  fichesMadp.forEach(f => { const c = getCycle(f.classe); if (c) parCycleMadp[c]++; });

  const domainesMadp = {};
  Object.keys(DOMAINE_COLORS).forEach(k => { domainesMadp[k] = 0; });
  histAnnee
    .filter(h => norm(h.domaine).includes('apprentissage') &&
      (ficheById.get(h.eleve_id)?.createdByProfession === 'MaDP' || idsActeMadp.has(h.eleve_id)))
    .forEach(h => { domainesMadp[bucketDomaine(h.sous_domaine)]++; });

  const madp = {
    elevesAccompagnes: fichesMadp.length,
    seancesAide: seancesMadp.length,
    suivisIndividuels: seancesMadp.length - suivisGroupeMadp,
    suivisGroupe: suivisGroupeMadp,
    clotureees: fichesMadp.filter(f => f.statut === 'Clôturé').length,
    liaisonsEnseignants: compte(actesMadp, "liaison avec l'enseignant"),
    entretiensFamilles: compte(actesMadp, 'entretien avec la famille'),
    participationsEE: compteRegex(actesMadp, /\bee\b/i),
    parCycle: parCycleMadp,
    domaines: domainesMadp,
    total: fichesMadp.length,
    actesTotal: actesMadp.length,
  };

  // ── Évolution mensuelle (toutes professions) ──
  const mois = moisScolaires(libelle);
  const evolution = { 'Psy EN EDA': mois.map(() => 0), 'MaDR': mois.map(() => 0), 'MaDP': mois.map(() => 0) };
  fichesAnnee.forEach(f => {
    (f.interventions || []).forEach(iv => {
      if (!iv.date || !evolution[iv.profession]) return;
      const d = new Date(iv.date);
      const idx = mois.findIndex(m => m.month === d.getMonth() && m.year === d.getFullYear());
      if (idx >= 0) evolution[iv.profession][idx]++;
    });
  });

  return {
    libelle, effectifSecteur, totalDemandes, parCategorie, matrice,
    psy, madr, madp, evolution, moisLabels: mois.map(m => m.label),
  };
}

// ── Génération des analyses qualitatives automatiques ───────────────────────
function analyseVueEnsemble(s) {
  const cycleDom = Object.entries(s.matrice)
    .map(([c, t]) => [c, t.Apprentissage + t.Comportement + t.Handicap])
    .sort((a, b) => b[1] - a[1])[0];
  const totauxType = TYPES.map(t => [t, CYCLES.reduce((sum, c) => sum + s.matrice[c][t], 0)]);
  const typeDom = totauxType.sort((a, b) => b[1] - a[1])[0];
  const partCycle1 = pct(s.matrice['Cycle 1'].Apprentissage + s.matrice['Cycle 1'].Comportement + s.matrice['Cycle 1'].Handicap, s.totalDemandes);

  const lignes = [];
  if (cycleDom && cycleDom[1] > 0) {
    lignes.push(`Le ${cycleDom[0]} concentre la majorité des demandes traitées par l'équipe RASED, avec ${cycleDom[1]} signalement${cycleDom[1] > 1 ? 's' : ''} sur ${s.totalDemandes} (${pct(cycleDom[1], s.totalDemandes)} % du total).`);
  } else {
    lignes.push("Aucune demande n'a pu être rattachée à un cycle précis sur la période (classes non renseignées).");
  }
  if (typeDom && typeDom[1] > 0) {
    lignes.push(`Le motif dominant des sollicitations relève du domaine « ${typeDom[0]} », représentant ${typeDom[1]} dossier${typeDom[1] > 1 ? 's' : ''} (${pct(typeDom[1], s.totalDemandes)} % des demandes).`);
  }
  lignes.push(partCycle1 >= 25
    ? `La part des demandes émises en Cycle 1 (${partCycle1} %) témoigne d'un repérage précoce actif, conforme aux priorités de prévention du dispositif RASED.`
    : `La part des demandes en Cycle 1 reste modérée (${partCycle1} %) : un renforcement du repérage précoce en maternelle pourrait être une piste pour l'année suivante.`);
  return lignes;
}

function analysePsy(s) {
  const p = s.psy;
  const cycleDom = Object.entries(p.parCycle).sort((a, b) => b[1] - a[1])[0];
  return [
    `Mme GENTY Isabelle a réalisé ${p.entretiensEleves} entretien${p.entretiensEleves > 1 ? 's' : ''} avec des élèves, ${p.passationsPsycho} passation${p.passationsPsycho > 1 ? 's' : ''} psychométrique${p.passationsPsycho > 1 ? 's' : ''} et ${p.observationsClasse} observation${p.observationsClasse > 1 ? 's' : ''} en classe, pour un total de ${p.analysesSituation} analyse${p.analysesSituation > 1 ? 's' : ''} de situation menée${p.analysesSituation > 1 ? 's' : ''} via l'arbre décisionnel EDA.`,
    cycleDom && cycleDom[1] > 0
      ? `Les situations suivies concernent prioritairement le ${cycleDom[0]} (${pct(cycleDom[1], p.total)} % des dossiers).`
      : `Aucune tendance de cycle significative ne se dégage sur la période.`,
    (p.orientationsExternes > 0 || p.dossiersMDPH > 0)
      ? `${p.orientationsExternes} orientation${p.orientationsExternes > 1 ? 's' : ''} externe${p.orientationsExternes > 1 ? 's' : ''} et ${p.dossiersMDPH} dossier${p.dossiersMDPH > 1 ? 's' : ''} MDPH ont été instruits, illustrant le travail de liaison avec les partenaires extérieurs au secteur.`
      : `Aucune orientation externe ni dossier MDPH n'a été enregistré sur la période.`,
  ];
}

function analyseMadr(s) {
  const m = s.madr;
  const diffDom = Object.entries(m.difficultes).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])[0];
  const tauxCloture = pct(m.clotureees, m.elevesEnCharge);
  return [
    `Mme PETIT Laurence a pris en charge ${m.elevesEnCharge} élève${m.elevesEnCharge > 1 ? 's' : ''} sur l'année, pour ${m.seancesReeducation} séance${m.seancesReeducation > 1 ? 's' : ''} de rééducation (${m.suivisIndividuels} en individuel, ${m.suivisGroupe} en groupe).`,
    diffDom
      ? `La difficulté la plus fréquemment traitée est « ${diffDom[0]} », concernant ${diffDom[1]} situation${diffDom[1] > 1 ? 's' : ''}.`
      : `Aucune difficulté n'a pu être catégorisée précisément sur la période.`,
    `${m.clotureees} prise${m.clotureees > 1 ? 's' : ''} en charge sur ${m.elevesEnCharge} a${m.elevesEnCharge > 1 ? 'ont' : ''} été clôturée${m.clotureees > 1 ? 's' : ''} (${tauxCloture} %), pour ${m.liaisonsEnseignants} liaison${m.liaisonsEnseignants > 1 ? 's' : ''} avec les enseignant·es.`,
  ];
}

function analyseMadp(s) {
  const m = s.madp;
  const domDom = Object.entries(m.domaines).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])[0];
  const tauxCloture = pct(m.clotureees, m.elevesAccompagnes);
  return [
    `Mme CARO Véronique a accompagné ${m.elevesAccompagnes} élève${m.elevesAccompagnes > 1 ? 's' : ''} sur l'année, pour ${m.seancesAide} séance${m.seancesAide > 1 ? 's' : ''} d'aide pédagogique (${m.suivisIndividuels} en individuel, ${m.suivisGroupe} en groupe).`,
    domDom
      ? `Le domaine le plus travaillé est « ${domDom[0]} », concernant ${domDom[1]} situation${domDom[1] > 1 ? 's' : ''}.`
      : `Aucun domaine n'a pu être catégorisé précisément sur la période.`,
    `${m.clotureees} prise${m.clotureees > 1 ? 's' : ''} en charge sur ${m.elevesAccompagnes} a${m.elevesAccompagnes > 1 ? 'ont' : ''} été clôturée${m.clotureees > 1 ? 's' : ''} (${tauxCloture} %), pour ${m.liaisonsEnseignants} liaison${m.liaisonsEnseignants > 1 ? 's' : ''} avec les enseignant·es.`,
  ];
}

function perspectivesPsy(s, anneeN1) {
  const p = s.psy;
  const items = [];
  items.push(p.dossiersMDPH > 0
    ? `Poursuivre le suivi des ${p.dossiersMDPH} dossier${p.dossiersMDPH > 1 ? 's' : ''} MDPH en cours et anticiper les renouvellements.`
    : 'Maintenir la vigilance sur les situations susceptibles de nécessiter une orientation MDPH.');
  items.push(`Poursuivre les analyses de situation via l'arbre EDA et renforcer la liaison avec les ${p.liaisonsEnseignants} enseignant·es déjà mobilisé·es.`);
  items.push(`Consolider le lien avec les familles (${p.entretiensFamilles} entretien${p.entretiensFamilles > 1 ? 's' : ''} mené${p.entretiensFamilles > 1 ? 's' : ''} cette année).`);
  return { titre: `Perspectives ${anneeN1}`, items };
}
function perspectivesMadr(s, anneeN1) {
  const m = s.madr;
  const items = [];
  items.push(m.suivisGroupe < m.suivisIndividuels
    ? "Étudier la possibilité de développer des suivis en petit groupe pour les difficultés relationnelles les plus fréquentes."
    : "Poursuivre l'équilibre actuel entre suivis individuels et suivis de groupe.");
  items.push(`Maintenir le rythme des ${m.seancesReeducation} séances de rééducation et le lien avec les ${m.liaisonsEnseignants} liaisons enseignant·es établies.`);
  items.push('Poursuivre la coordination avec la Psy-EN EDA pour les situations à double composante relationnelle et cognitive.');
  return { titre: `Perspectives ${anneeN1}`, items };
}
function perspectivesMadp(s, anneeN1) {
  const m = s.madp;
  const domDom = Object.entries(m.domaines).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])[0];
  const items = [];
  items.push(domDom
    ? `Continuer à prioriser le domaine « ${domDom[0]} », identifié comme le plus sollicité cette année.`
    : "Affiner le repérage des domaines d'apprentissage à prioriser pour l'année suivante.");
  items.push(`Maintenir le lien école-RASED via les ${m.liaisonsEnseignants} liaisons enseignant·es réalisées.`);
  items.push('Poursuivre le développement des suivis de groupe lorsque les besoins des élèves convergent.');
  return { titre: `Perspectives ${anneeN1}`, items };
}
function pointsAppuiCommuns(s) {
  const clotureTotal = s.psy.clotures + s.madr.clotureees + s.madp.clotureees;
  return [
    `${s.totalDemandes} demande${s.totalDemandes > 1 ? 's' : ''} traitée${s.totalDemandes > 1 ? 's' : ''} cette année pour un effectif de secteur de ${s.effectifSecteur} élève${s.effectifSecteur > 1 ? 's' : ''} suivi${s.effectifSecteur > 1 ? 's' : ''}.`,
    `${clotureTotal} prise${clotureTotal > 1 ? 's' : ''} en charge clôturée${clotureTotal > 1 ? 's' : ''} sur l'ensemble de l'équipe, signe d'un suivi mené à son terme pour une partie significative des situations.`,
    "Poursuivre la coordination pluriprofessionnelle (réunions d'équipe RASED, ESS/EE) comme levier principal de cohérence des parcours.",
  ];
}

// ── Composants graphiques jsPDF (dessin manuel, sans librairie de charts) ───
function drawTable(doc, { x, y, colWidths, headers, rows, headerColor = '#1A3353', fontSize = 8.5, rowHeight = 7 }) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  let cy = y;
  setFill(doc, headerColor);
  doc.rect(x, cy, totalWidth, rowHeight, 'F');
  setText(doc, '#FFFFFF'); doc.setFont('helvetica', 'bold'); doc.setFontSize(fontSize);
  let cx = x;
  headers.forEach((h, i) => { doc.text(String(h), cx + 2, cy + rowHeight - 2.3, { maxWidth: colWidths[i] - 3 }); cx += colWidths[i]; });
  cy += rowHeight;
  doc.setFont('helvetica', 'normal');
  rows.forEach((row, ri) => {
    if (ri % 2 === 1) { setFill(doc, '#F8FAFD'); doc.rect(x, cy, totalWidth, rowHeight, 'F'); }
    setText(doc, '#182840'); cx = x;
    row.forEach((cell, ci) => { doc.text(String(cell), cx + 2, cy + rowHeight - 2.3, { maxWidth: colWidths[ci] - 3 }); cx += colWidths[ci]; });
    cy += rowHeight;
  });
  setDraw(doc, '#D8E1EE'); doc.rect(x, y, totalWidth, cy - y, 'S');
  return cy;
}

function drawGroupedBarChart(doc, { x, y, width, height, groups, series }) {
  setDraw(doc, '#C8D2E2'); doc.line(x, y + height, x + width, y + height);
  const max = Math.max(1, ...series.flatMap(s => s.values));
  const groupWidth = width / groups.length;
  const gap = 1.4;
  const barWidth = (groupWidth - gap * (series.length + 1)) / series.length;
  groups.forEach((g, gi) => {
    const gx = x + gi * groupWidth;
    series.forEach((s, si) => {
      const v = s.values[gi] || 0;
      const h = (v / max) * (height - 8);
      const bx = gx + gap + si * (barWidth + gap);
      const by = y + height - h;
      setFill(doc, s.color);
      doc.rect(bx, by, barWidth, h, 'F');
      if (v > 0) { doc.setFontSize(6.5); setText(doc, '#566880'); doc.text(String(v), bx + barWidth / 2, by - 1, { align: 'center' }); }
    });
    doc.setFontSize(7.5); setText(doc, '#182840');
    doc.text(g, gx + groupWidth / 2, y + height + 5, { align: 'center' });
  });
  let lx = x; const ly = y + height + 11;
  doc.setFontSize(7.5);
  series.forEach(s => {
    setFill(doc, s.color); doc.rect(lx, ly - 2.6, 3, 3, 'F');
    setText(doc, '#566880'); doc.text(s.label, lx + 4.5, ly);
    lx += doc.getTextWidth(s.label) + 14;
  });
}

function drawPieChart(doc, { cx, cy, radius, slices }) {
  const total = slices.reduce((s, d) => s + d.value, 0) || 1;
  let startAngle = -90;
  slices.forEach(slice => {
    const sweep = (slice.value / total) * 360;
    if (sweep <= 0) return;
    setFill(doc, slice.color);
    const steps = Math.max(1, Math.ceil(sweep / 3));
    for (let i = 0; i < steps; i++) {
      const a0 = startAngle + (sweep * i) / steps;
      const a1 = startAngle + (sweep * (i + 1)) / steps;
      const p0 = polar(cx, cy, radius, a0);
      const p1 = polar(cx, cy, radius, a1);
      doc.triangle(cx, cy, p0[0], p0[1], p1[0], p1[1], 'F');
    }
    startAngle += sweep;
  });
  setDraw(doc, '#FFFFFF'); doc.setLineWidth(0.6); doc.circle(cx, cy, radius, 'S');

  let ly = cy - radius;
  slices.forEach(slice => {
    setFill(doc, slice.color); doc.rect(cx + radius + 10, ly - 2.6, 3, 3, 'F');
    setText(doc, '#182840'); doc.setFontSize(7.5);
    doc.text(`${slice.label} — ${slice.value} (${pct(slice.value, total)} %)`, cx + radius + 15, ly);
    ly += 6;
  });
}

function drawClosedPolyline(doc, pts) {
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    doc.line(a[0], a[1], b[0], b[1]);
  }
}

function drawRadarChart(doc, { cx, cy, radius, axes, datasets }) {
  const angleFor = i => -90 + i * (360 / axes.length);
  setDraw(doc, '#E1E7F0'); doc.setLineWidth(0.3);
  [0.25, 0.5, 0.75, 1].forEach(f => drawClosedPolyline(doc, axes.map((_, i) => polar(cx, cy, radius * f, angleFor(i)))));
  axes.forEach((label, i) => {
    const p = polar(cx, cy, radius, angleFor(i));
    doc.line(cx, cy, p[0], p[1]);
    const lp = polar(cx, cy, radius + 9, angleFor(i));
    doc.setFontSize(6.8); setText(doc, '#566880');
    doc.text(label, lp[0], lp[1], { align: 'center', maxWidth: 26 });
  });
  datasets.forEach(ds => {
    const pts = axes.map((_, i) => polar(cx, cy, radius * Math.max(0, Math.min(1, ds.values[i])), angleFor(i)));
    setDraw(doc, ds.color); doc.setLineWidth(1);
    drawClosedPolyline(doc, pts);
    pts.forEach(p => { setFill(doc, ds.color); doc.circle(p[0], p[1], 0.9, 'F'); });
  });
  let lx = cx - radius; const ly = cy + radius + 16;
  doc.setFontSize(7.5);
  datasets.forEach(ds => {
    setFill(doc, ds.color); doc.rect(lx, ly - 2.6, 3, 3, 'F');
    setText(doc, '#566880'); doc.text(ds.label, lx + 4.5, ly);
    lx += doc.getTextWidth(ds.label) + 16;
  });
}

function drawLineChart(doc, { x, y, width, height, labels, series }) {
  const max = Math.max(1, ...series.flatMap(s => s.values));
  setDraw(doc, '#C8D2E2'); doc.setLineWidth(0.3);
  doc.line(x, y + height, x + width, y + height);
  doc.line(x, y, x, y + height);
  const stepX = width / Math.max(1, labels.length - 1);
  for (let g = 1; g <= 4; g++) {
    const gy = y + height - (height * g) / 4;
    setDraw(doc, '#F0F3F8'); doc.line(x, gy, x + width, gy);
    doc.setFontSize(6); setText(doc, '#94A3B8');
    doc.text(String(Math.round((max * g) / 4)), x - 2, gy + 1, { align: 'right' });
  }
  series.forEach(s => {
    const pts = s.values.map((v, i) => [x + i * stepX, y + height - (v / max) * height]);
    setDraw(doc, s.color); doc.setLineWidth(1.1);
    for (let i = 0; i < pts.length - 1; i++) doc.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
    pts.forEach(p => { setFill(doc, s.color); doc.circle(p[0], p[1], 0.8, 'F'); });
  });
  doc.setFontSize(6.5); setText(doc, '#566880');
  labels.forEach((lbl, i) => doc.text(lbl, x + i * stepX, y + height + 5, { align: 'center' }));
  let lx = x; const ly = y - 4;
  doc.setFontSize(7.5);
  series.forEach(s => {
    setFill(doc, s.color); doc.rect(lx, ly - 2.4, 3, 3, 'F');
    setText(doc, '#566880'); doc.text(s.label, lx + 4.5, ly);
    lx += doc.getTextWidth(s.label) + 16;
  });
}

function kpiGrid(doc, { x, y, width, items, color, perRow = 4 }) {
  const gap = 4;
  const cardW = (width - gap * (perRow - 1)) / perRow;
  const cardH = 22;
  items.forEach((it, i) => {
    const col = i % perRow, row = Math.floor(i / perRow);
    const cx = x + col * (cardW + gap);
    const cy = y + row * (cardH + gap);
    setFill(doc, '#F8FAFD'); setDraw(doc, '#D8E1EE');
    doc.rect(cx, cy, cardW, cardH, 'FD');
    setText(doc, color); doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
    doc.text(String(it.value), cx + cardW / 2, cy + 11, { align: 'center' });
    setText(doc, '#566880'); doc.setFont('helvetica', 'normal'); doc.setFontSize(6.8);
    doc.text(it.label, cx + cardW / 2, cy + 17, { align: 'center', maxWidth: cardW - 4 });
  });
  return y + Math.ceil(items.length / perRow) * (cardH + gap);
}

function addHeader(doc, pageWidth, margin, libelle) {
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); setText(doc, '#646464');
  doc.text("Suivis RASED · Circonscription de La Possession · La Réunion", margin, 12);
  doc.text(`Rapport annuel ${libelle}`, pageWidth - margin, 12, { align: 'right' });
  setDraw(doc, '#DCE1EB'); doc.line(margin, 15, pageWidth - margin, 15);
}
function addFooter(doc, pageWidth, pageHeight, margin, pageNum, totalPages) {
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); setText(doc, '#969696');
  doc.text(`Page ${pageNum} / ${totalPages}`, margin, pageHeight - 8);
  doc.text(new Date().toLocaleDateString('fr-FR'), pageWidth - margin, pageHeight - 8, { align: 'right' });
}
function sectionBanner(doc, { x, y, width, num, title, color }) {
  setFill(doc, color); doc.rect(x, y, width, 12, 'F');
  setText(doc, '#FFFFFF'); doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
  doc.text(`SECTION ${num} — ${title}`, x + 4, y + 8.3);
}
function addTextBlock(doc, { x, y, width, lines, fontSize = 10, lineHeight = 5.2, color = '#182840' }) {
  doc.setFont('helvetica', 'normal'); doc.setFontSize(fontSize); setText(doc, color);
  let cy = y;
  lines.forEach(line => {
    doc.splitTextToSize(line, width).forEach(l => { doc.text(l, x, cy); cy += lineHeight; });
    cy += 1.5;
  });
  return cy;
}

// ── Génération du PDF complet ───────────────────────────────────────────────
export async function generateRapportAnnuel({ anneeScolaire, fiches, historique, eleves, ecoles }) {
  const libelle = anneeScolaire?.libelle || anneeScolaire;
  const anneeN1 = anneeSuivante(libelle);
  const s = computeStats({ fiches, historique: historique || [], eleves: eleves || [], libelle });

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // PAGE 1 — COUVERTURE
  setFill(doc, '#1A3353'); doc.rect(0, 0, pageWidth, pageHeight, 'F');
  setText(doc, '#FFFFFF'); doc.setFont('helvetica', 'bold'); doc.setFontSize(34);
  doc.text('Suivis RASED', pageWidth / 2, 55, { align: 'center' });
  doc.setFontSize(18); doc.setFont('helvetica', 'normal');
  doc.text("Rapport annuel d'activité", pageWidth / 2, 70, { align: 'center' });
  doc.setFontSize(13); setText(doc, '#C8D2E2');
  doc.text(libelle, pageWidth / 2, 82, { align: 'center' });
  doc.text('Circonscription de La Possession · La Réunion', pageWidth / 2, 90, { align: 'center' });

  const yTeam = 115; const teamWidth = (pageWidth - 2 * margin - 20) / 3;
  EQUIPE.forEach((m, i) => {
    const xPos = margin + i * (teamWidth + 10);
    setFill(doc, COLORS[m.profession]);
    doc.rect(xPos, yTeam, teamWidth, 38, 'F');
    setText(doc, '#FFFFFF'); doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    doc.text(`${m.civilite} ${m.nom} ${m.prenom}`, xPos + 4, yTeam + 12, { maxWidth: teamWidth - 8 });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text(TITRES[m.profession], xPos + 4, yTeam + 22, { maxWidth: teamWidth - 8 });
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10); setText(doc, '#FFFFFF');
  doc.text("Ce rapport contient :", margin, 175);
  doc.setFontSize(9); setText(doc, '#C8D2E2');
  [
    "1. Vue d'ensemble du dispositif RASED",
    "2. Psychologue de l'Éducation Nationale · EDA",
    '3. Maître à Dominante Relationnelle (MaDR)',
    '4. Maître à Dominante Pédagogique (MaDP)',
    '5. Synthèse comparative et signatures',
  ].forEach((t, i) => doc.text(t, margin, 183 + i * 6));

  doc.setFontSize(10); setText(doc, '#C8D2E2');
  const genDate = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.text(`Document généré le ${genDate}`, pageWidth / 2, pageHeight - 16, { align: 'center' });

  // ───────────────────────── SECTION 1 (pages 2-3) ─────────────────────────
  doc.addPage();
  sectionBanner(doc, { x: margin, y: 22, width: contentWidth, num: 1, title: "VUE D'ENSEMBLE DU DISPOSITIF RASED", color: '#1A3353' });

  let y = kpiGrid(doc, {
    x: margin, y: 40, width: contentWidth, color: '#1A3353', perRow: 4,
    items: [
      { label: "Demandes d'aide", value: s.totalDemandes },
      { label: 'Élèves du secteur', value: s.effectifSecteur },
      { label: '% effectif concerné', value: `${pct(s.totalDemandes, s.effectifSecteur)} %` },
      { label: 'Écoles du secteur', value: (ecoles || []).length },
    ],
  });
  y += 6;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, '#1A3353');
  doc.text('Répartition des demandes par intervenant', margin, y); y += 4;
  y = drawTable(doc, {
    x: margin, y, colWidths: [contentWidth - 90, 45, 45],
    headers: ['Intervenant', 'Nb demandes', '%'],
    rows: [
      ['Psy-EN EDA', s.parCategorie['Psy-EN'], `${pct(s.parCategorie['Psy-EN'], s.totalDemandes)} %`],
      ['MaDR', s.parCategorie['MaDR'], `${pct(s.parCategorie['MaDR'], s.totalDemandes)} %`],
      ['MaDP', s.parCategorie['MaDP'], `${pct(s.parCategorie['MaDP'], s.totalDemandes)} %`],
      ['Aménagements', s.parCategorie['Aménagements'], `${pct(s.parCategorie['Aménagements'], s.totalDemandes)} %`],
      ['TOTAL', s.totalDemandes, '100 %'],
    ],
  });

  y += 10;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, '#1A3353');
  doc.text('Répartition par cycle et type d\'intervention', margin, y); y += 4;
  const totauxParType = t => CYCLES.reduce((sum, c) => sum + s.matrice[c][t], 0);
  y = drawTable(doc, {
    x: margin, y, colWidths: [contentWidth / 4, contentWidth / 4, contentWidth / 4, contentWidth / 4],
    headers: ['Cycle', 'Apprentissage', 'Comportement', 'Handicap'],
    rows: [
      ...CYCLES.map(c => [c, s.matrice[c].Apprentissage, s.matrice[c].Comportement, s.matrice[c].Handicap]),
      ['TOTAL', totauxParType('Apprentissage'), totauxParType('Comportement'), totauxParType('Handicap')],
    ],
  });

  addFooter(doc, pageWidth, pageHeight, margin, 2, 0);

  doc.addPage();
  addHeader(doc, pageWidth, margin, libelle);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, '#1A3353');
  doc.text("Répartition par cycle et type d'intervention (graphique)", margin, 26);
  drawGroupedBarChart(doc, {
    x: margin, y: 34, width: contentWidth, height: 60, groups: CYCLES,
    series: TYPES.map(t => ({ label: t, color: TYPE_COLORS[t], values: CYCLES.map(c => s.matrice[c][t]) })),
  });

  let y2 = 112;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, '#1A3353');
  doc.text('Analyse qualitative', margin, y2); y2 += 6;
  y2 = addTextBlock(doc, { x: margin, y: y2, width: contentWidth, lines: analyseVueEnsemble(s) });

  y2 += 4;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, '#1A3353');
  doc.text("Points d'appui et perspectives communes", margin, y2); y2 += 6;
  addTextBlock(doc, { x: margin, y: y2, width: contentWidth, lines: pointsAppuiCommuns(s).map(l => `• ${l}`) });

  addFooter(doc, pageWidth, pageHeight, margin, 3, 0);

  // ───────────────────────── SECTION 2 — PSY-EN (pages 4-5) ────────────────
  doc.addPage();
  sectionBanner(doc, { x: margin, y: 22, width: contentWidth, num: 2, title: 'PSY-EN EDA · MME GENTY ISABELLE', color: COLORS['Psy EN EDA'] });
  y = kpiGrid(doc, {
    x: margin, y: 40, width: contentWidth, color: COLORS['Psy EN EDA'], perRow: 4,
    items: [
      { label: 'Entretiens élèves', value: s.psy.entretiensEleves },
      { label: 'Passations psychométriques', value: s.psy.passationsPsycho },
      { label: 'Observations en classe', value: s.psy.observationsClasse },
      { label: 'Analyses de situation (arbre EDA)', value: s.psy.analysesSituation },
      { label: "Comptes-rendus d'hypothèses", value: s.psy.comptesRendus },
      { label: 'Entretiens familles', value: s.psy.entretiensFamilles },
      { label: 'Participations ESS', value: s.psy.participationsESS },
      { label: 'Participations EE', value: s.psy.participationsEE },
      { label: 'Orientations externes', value: s.psy.orientationsExternes },
      { label: 'Dossiers MDPH instruits', value: s.psy.dossiersMDPH },
      { label: 'Liaisons enseignant·es', value: s.psy.liaisonsEnseignants },
      { label: 'Élèves suivis (total)', value: s.psy.total },
    ],
  });
  addFooter(doc, pageWidth, pageHeight, margin, 4, 0);

  doc.addPage();
  addHeader(doc, pageWidth, margin, libelle);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, COLORS['Psy EN EDA']);
  doc.text('Répartition par cycle', margin, 26);
  drawGroupedBarChart(doc, {
    x: margin, y: 34, width: contentWidth, height: 55, groups: CYCLES,
    series: [{ label: 'Psy-EN EDA', color: COLORS['Psy EN EDA'], values: CYCLES.map(c => s.psy.parCycle[c]) }],
  });

  let y3 = 105;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, COLORS['Psy EN EDA']);
  doc.text('Analyse qualitative', margin, y3); y3 += 6;
  y3 = addTextBlock(doc, { x: margin, y: y3, width: contentWidth, lines: analysePsy(s) });

  const perspPsy = perspectivesPsy(s, anneeN1);
  y3 += 4;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, COLORS['Psy EN EDA']);
  doc.text(perspPsy.titre, margin, y3); y3 += 6;
  addTextBlock(doc, { x: margin, y: y3, width: contentWidth, lines: perspPsy.items.map(l => `• ${l}`) });

  addFooter(doc, pageWidth, pageHeight, margin, 5, 0);

  // ───────────────────────── SECTION 3 — MaDR (pages 6-7) ───────────────────
  doc.addPage();
  sectionBanner(doc, { x: margin, y: 22, width: contentWidth, num: 3, title: 'MADR · MME PETIT LAURENCE', color: COLORS['MaDR'] });
  y = kpiGrid(doc, {
    x: margin, y: 40, width: contentWidth, color: COLORS['MaDR'], perRow: 4,
    items: [
      { label: 'Élèves pris en charge', value: s.madr.elevesEnCharge },
      { label: 'Séances de rééducation', value: s.madr.seancesReeducation },
      { label: 'Suivis individuels', value: s.madr.suivisIndividuels },
      { label: 'Suivis en groupe', value: s.madr.suivisGroupe },
      { label: 'Prises en charge clôturées', value: s.madr.clotureees },
      { label: 'Entretiens familles', value: s.madr.entretiensFamilles },
      { label: 'Liaisons enseignant·es', value: s.madr.liaisonsEnseignants },
      { label: 'Participations EE', value: s.madr.participationsEE },
    ],
  });
  addFooter(doc, pageWidth, pageHeight, margin, 6, 0);

  doc.addPage();
  addHeader(doc, pageWidth, margin, libelle);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, COLORS['MaDR']);
  doc.text('Répartition des difficultés traitées', margin, 26); y = 30;
  y = drawTable(doc, {
    x: margin, y, colWidths: [contentWidth - 60, 60],
    headers: ['Difficulté', 'Nb situations'],
    rows: Object.entries(s.madr.difficultes).map(([k, v]) => [k, v]),
  });
  drawPieChart(doc, {
    cx: margin + 30, cy: y + 35, radius: 24,
    slices: Object.entries(s.madr.difficultes).map(([k, v]) => ({ label: k, value: v, color: DIFFICULTE_COLORS[k] })),
  });

  let y4 = y + 72;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, COLORS['MaDR']);
  doc.text('Analyse qualitative', margin, y4); y4 += 6;
  y4 = addTextBlock(doc, { x: margin, y: y4, width: contentWidth, lines: analyseMadr(s) });

  const perspMadr = perspectivesMadr(s, anneeN1);
  y4 += 4;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, COLORS['MaDR']);
  doc.text(perspMadr.titre, margin, y4); y4 += 6;
  addTextBlock(doc, { x: margin, y: y4, width: contentWidth, lines: perspMadr.items.map(l => `• ${l}`) });

  addFooter(doc, pageWidth, pageHeight, margin, 7, 0);

  // ───────────────────────── SECTION 4 — MaDP (pages 8-9) ───────────────────
  doc.addPage();
  sectionBanner(doc, { x: margin, y: 22, width: contentWidth, num: 4, title: 'MADP · MME CARO VÉRONIQUE', color: COLORS['MaDP'] });
  y = kpiGrid(doc, {
    x: margin, y: 40, width: contentWidth, color: COLORS['MaDP'], perRow: 4,
    items: [
      { label: 'Élèves accompagnés', value: s.madp.elevesAccompagnes },
      { label: "Séances d'aide pédagogique", value: s.madp.seancesAide },
      { label: 'Suivis individuels', value: s.madp.suivisIndividuels },
      { label: 'Suivis en groupe', value: s.madp.suivisGroupe },
      { label: 'Prises en charge clôturées', value: s.madp.clotureees },
      { label: 'Liaisons enseignant·es', value: s.madp.liaisonsEnseignants },
      { label: 'Entretiens familles', value: s.madp.entretiensFamilles },
      { label: 'Participations EE', value: s.madp.participationsEE },
    ],
  });
  addFooter(doc, pageWidth, pageHeight, margin, 8, 0);

  doc.addPage();
  addHeader(doc, pageWidth, margin, libelle);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, COLORS['MaDP']);
  doc.text('Répartition des domaines travaillés', margin, 26); y = 30;
  const domainesAffiches = Object.entries(s.madp.domaines).filter(([k, v]) => v > 0 || k !== 'Autre');
  y = drawTable(doc, {
    x: margin, y, colWidths: [contentWidth - 60, 60],
    headers: ['Domaine', 'Nb situations'],
    rows: domainesAffiches.map(([k, v]) => [k, v]),
  });
  drawGroupedBarChart(doc, {
    x: margin, y: y + 8, width: contentWidth, height: 45,
    groups: domainesAffiches.map(([k]) => k),
    series: [{ label: 'MaDP', color: COLORS['MaDP'], values: domainesAffiches.map(([, v]) => v) }],
  });

  let y5 = y + 65;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, COLORS['MaDP']);
  doc.text('Analyse qualitative', margin, y5); y5 += 6;
  y5 = addTextBlock(doc, { x: margin, y: y5, width: contentWidth, lines: analyseMadp(s) });

  const perspMadp = perspectivesMadp(s, anneeN1);
  y5 += 4;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, COLORS['MaDP']);
  doc.text(perspMadp.titre, margin, y5); y5 += 6;
  addTextBlock(doc, { x: margin, y: y5, width: contentWidth, lines: perspMadp.items.map(l => `• ${l}`) });

  addFooter(doc, pageWidth, pageHeight, margin, 9, 0);

  // ───────────────────────── SECTION 5 — SYNTHÈSE (pages 10-12) ────────────
  doc.addPage();
  sectionBanner(doc, { x: margin, y: 22, width: contentWidth, num: 5, title: 'SYNTHÈSE COMPARATIVE', color: '#1A3353' });

  const comparatif = [
    ['Élèves suivis', s.psy.total, s.madr.elevesEnCharge, s.madp.elevesAccompagnes],
    ['Actes / entretiens réalisés', s.psy.entretiensEleves + s.psy.observationsClasse + s.psy.passationsPsycho, s.madr.actesTotal, s.madp.actesTotal],
    ['Entretiens familles', s.psy.entretiensFamilles, s.madr.entretiensFamilles, s.madp.entretiensFamilles],
    ['Liaisons enseignant·es', s.psy.liaisonsEnseignants, s.madr.liaisonsEnseignants, s.madp.liaisonsEnseignants],
    ['Participations ESS/EE', s.psy.participationsESS + s.psy.participationsEE, s.madr.participationsEE, s.madp.participationsEE],
    ['Prises en charge clôturées', s.psy.clotures, s.madr.clotureees, s.madp.clotureees],
  ];
  y = drawTable(doc, {
    x: margin, y: 40, colWidths: [contentWidth - 120, 40, 40, 40],
    headers: ['Indicateur', 'Psy-EN EDA', 'MaDR', 'MaDP'],
    rows: comparatif,
  });
  addFooter(doc, pageWidth, pageHeight, margin, 10, 0);

  doc.addPage();
  addHeader(doc, pageWidth, margin, libelle);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, '#1A3353');
  doc.text("Comparaison de l'activité (graphique radar)", margin, 26);

  const axes = comparatif.map(r => r[0]);
  const radarDatasets = [
    { label: 'Psy-EN EDA', color: COLORS['Psy EN EDA'], idx: 1 },
    { label: 'MaDR', color: COLORS['MaDR'], idx: 2 },
    { label: 'MaDP', color: COLORS['MaDP'], idx: 3 },
  ].map(d => ({
    label: d.label, color: d.color,
    values: comparatif.map(row => {
      const max = Math.max(row[1], row[2], row[3], 1);
      return row[d.idx] / max;
    }),
  }));
  drawRadarChart(doc, { cx: pageWidth / 2, cy: 80, radius: 38, axes, datasets: radarDatasets });

  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, '#1A3353');
  doc.text("Évolution mensuelle de l'activité", margin, 145);
  drawLineChart(doc, {
    x: margin, y: 155, width: contentWidth, height: 50, labels: s.moisLabels,
    series: [
      { label: 'Psy-EN EDA', color: COLORS['Psy EN EDA'], values: s.evolution['Psy EN EDA'] },
      { label: 'MaDR', color: COLORS['MaDR'], values: s.evolution['MaDR'] },
      { label: 'MaDP', color: COLORS['MaDP'], values: s.evolution['MaDP'] },
    ],
  });
  addFooter(doc, pageWidth, pageHeight, margin, 11, 0);

  // PAGE — SIGNATURES
  doc.addPage();
  addHeader(doc, pageWidth, margin, libelle);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16); setText(doc, '#1A3353');
  doc.text('Validation du rapport annuel', margin, 32);

  const dateSignature = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11); setText(doc, '#182840');
  doc.text(`Fait à La Possession, le ${dateSignature}`, margin, 46);

  let ySig = 64;
  EQUIPE.forEach(m => {
    setText(doc, COLORS[m.profession]); doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    doc.text(`${m.civilite} ${m.nom} ${m.prenom}`, margin, ySig);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); setText(doc, '#566880');
    doc.text(TITRES[m.profession], margin, ySig + 6);
    setDraw(doc, '#94A3B8');
    doc.line(margin, ySig + 22, margin + 70, ySig + 22);
    setText(doc, '#94A3B8'); doc.setFontSize(8);
    doc.text('Signature', margin, ySig + 27);
    ySig += 40;
  });
  addFooter(doc, pageWidth, pageHeight, margin, 12, 0);

  // ── Numérotation finale (total réel des pages, hors couverture) ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, pageWidth, pageHeight, margin, i - 1, totalPages - 1);
  }

  return doc;
}
