import { jsPDF } from 'jspdf';
import { titleCase } from './utils';
import { computeIndicateursRased } from './indicateursRased';

const COLORS = { 'Psy EN EDA': '#1A3353', 'MaDR': '#1E7A52', 'MaDP': '#B85C1A' };
const TITRES = {
  'Psy EN EDA': "Psychologue de l'Éducation Nationale · EDA",
  'MaDR': 'Maître à Dominante Relationnelle (MaDR)',
  'MaDP': 'Maître à Dominante Pédagogique (MaDP)',
};

// ── Helpers équipe (lecture dynamique depuis MembreEquipe) ──────────────────
function nomAffiche(m) {
  return `${m.civilite || ''} ${(m.nom || '').toUpperCase()} ${m.prenom}`.replace(/\s+/g, ' ').trim();
}
function membresProfession(equipe, profession) {
  return (equipe || []).filter(m => m.profession === profession);
}
function listeNoms(membres, { maj = false } = {}) {
  const noms = membres.map(m => maj ? nomAffiche(m).toUpperCase() : nomAffiche(m));
  if (noms.length === 0) return null;
  if (noms.length === 1) return noms[0];
  return `${noms.slice(0, -1).join(', ')} et ${noms[noms.length - 1]}`;
}
const TYPE_COLORS = { 'Apprentissage': '#3B82C4', 'Comportement': '#1E7A52', 'Handicap': '#B85C1A', 'Non renseigné': '#94A3B8' };

const CYCLES = ['Cycle 1', 'Cycle 2', 'Cycle 3'];
// Cycles affichés dans le tableau et le graphique cycle × type : ajoute une
// ligne « Cycle non déterminé » pour que le total corresponde toujours au
// nombre de fiches, y compris celles dont la classe ne permet pas d'identifier
// un cycle (ex. « ULIS », classe non renseignée).
const CYCLES_TABLEAU = [...CYCLES, 'Cycle non déterminé'];
// Types utilisés pour le motif dominant de l'analyse qualitative : seuls les
// motifs réels, « Non renseigné » n'est jamais un motif à mettre en avant.
const TYPES = ['Apprentissage', 'Comportement', 'Handicap'];
// Types affichés dans le tableau et le graphique cycle × type : ajoute la
// colonne « Non renseigné » pour que le total corresponde toujours au nombre
// de fiches, y compris celles sans aucune problématique cochée.
const TYPES_TABLEAU = [...TYPES, 'Non renseigné'];

// ── Helpers géométrie / couleur ──────────────────────────────────────────────
function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0, 0, 0];
}
function setFill(doc, hex) { doc.setFillColor(...hexToRgb(hex)); }
function setText(doc, hex) { doc.setTextColor(...hexToRgb(hex)); }
function setDraw(doc, hex) { doc.setDrawColor(...hexToRgb(hex)); }
function pct(n, total) { return total > 0 ? Math.round((n / total) * 1000) / 10 : 0; }

// ── Helpers données ──────────────────────────────────────────────────────────
const CYCLE_PAR_NIVEAU = {
  tps: 'Cycle 1', ps: 'Cycle 1', ms: 'Cycle 1', gs: 'Cycle 1',
  cp: 'Cycle 2', ce1: 'Cycle 2', ce2: 'Cycle 2',
  cm1: 'Cycle 3', cm2: 'Cycle 3',
};
// Cherche un niveau connu n'importe où dans le libellé de classe (pas
// seulement en préfixe), pour tolérer les formats réels observés : « CE2-CM1 »,
// « CP-CE1 », « 01 - CP B », « TPS/PS », « MS GS »… Renvoie le premier niveau
// rencontré de gauche à droite ; renvoie null si aucun niveau connu n'apparaît
// (ex. « ULIS », classe vide) — l'appelant doit alors prévoir un repli explicite
// plutôt que d'écarter silencieusement la fiche.
const NIVEAU_REGEX = /\b(tps|ps|ms|gs|cp|ce1|ce2|cm1|cm2)\b/i;
function getCycle(classe) {
  const m = NIVEAU_REGEX.exec(classe || '');
  return m ? CYCLE_PAR_NIVEAU[m[1].toLowerCase()] : null;
}

// Classification lue directement sur les problématiques cochées (fiche élève),
// plutôt que sur des scores numériques ou une recherche de mots-clés.
function getTypeFiche(f) {
  const p = f.problematiques || {};
  if ((p.autre || []).includes('Situation de handicap')) return 'Handicap';
  const nbComportement = (p.comportement || []).length;
  const nbApprentissages = (p.apprentissages || []).length;
  if (nbComportement === 0 && nbApprentissages === 0) return 'Non renseigné';
  return nbComportement > nbApprentissages ? 'Comportement' : 'Apprentissage';
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

// Chaînes exactes du menu « Acte accompli » (DetailFiche.jsx) : chaque acte
// est une valeur figée de <select>, jamais du texte libre. On compte donc les
// actes par égalité stricte sur leur type réellement sélectionné, jamais par
// recherche de mots dans une description ou un commentaire.
const ACTES = {
  'Psy EN EDA': {
    entretienEleve: "Entretien avec l'élève (Psy-EN)",
    passationPsycho: 'Passation psychométrique (Psy-EN)',
    observationClasse: 'Observation en classe (Psy-EN)',
    entretienFamille: 'Entretien avec la famille',
    participationESS: 'Participation à une ESS',
    participationEE: 'Participation à une EE',
    liaisonEnseignant: "Liaison avec l'enseignant·e",
    orientationExterne: 'Orientation externe (Psy-EN)',
    dossierMDPH: 'Dossier MDPH (Psy-EN)',
    reunionEquipe: "Réunion d'équipe RASED",
    autre: 'Autre',
  },
  'MaDR': {
    entretienEleve: "Entretien avec l'élève (MaDR)",
    seance: 'Séance de rééducation (MaDR)',
    suiviIndividuel: 'Suivi individuel (MaDR)',
    suiviGroupe: 'Suivi en groupe (MaDR)',
    observationClasse: 'Observation en classe (MaDR)',
    entretienFamille: 'Entretien avec la famille (MaDR)',
    participationEE: 'Participation à une EE (MaDR)',
    liaisonEnseignant: "Liaison avec l'enseignant·e (MaDR)",
    orientationExterne: 'Orientation externe (MaDR)',
    reunionEquipe: "Réunion d'équipe RASED",
    autre: 'Autre',
  },
  'MaDP': {
    entretienEleve: "Entretien avec l'élève (MaDP)",
    seance: "Séance d'aide pédagogique (MaDP)",
    suiviIndividuel: 'Suivi individuel (MaDP)',
    suiviGroupe: 'Suivi en groupe (MaDP)',
    observationClasse: 'Observation en classe (MaDP)',
    entretienFamille: 'Entretien avec la famille (MaDP)',
    participationEE: 'Participation à une EE (MaDP)',
    liaisonEnseignant: "Liaison avec l'enseignant·e (MaDP)",
    orientationExterne: 'Orientation externe (MaDP)',
    reunionEquipe: "Réunion d'équipe RASED",
    autre: 'Autre',
  },
};
function compteActe(actes, description) {
  return actes.filter(a => a.description === description).length;
}
function anneeSuivante(libelle) {
  const m = /^(\d{4})-(\d{4})$/.exec(libelle || '');
  return m ? `${Number(m[1]) + 1}-${Number(m[2]) + 1}` : '';
}

// Ordre et libellés des 5 catégories de ProblematiquesSection.jsx (fiche élève).
const CATEGORIES_PROBLEMATIQUES = ['apprentissages', 'comportement', 'developpement', 'contexte', 'autre'];
const CATEGORIE_LABELS = {
  apprentissages: 'Apprentissages',
  comportement: 'Comportement',
  developpement: 'Développement',
  contexte: 'Contexte',
  autre: 'Autre',
};
const NOTE_PROBLEMATIQUES = "Un même élève peut relever de plusieurs problématiques : le total des items cochés est donc supérieur au nombre d'élèves suivis.";

// Lignes [Catégorie, Problématique, Élèves] pour drawTable, triées par
// catégorie puis par effectif décroissant, en ne gardant que les items cochés
// au moins une fois — aucune inférence, uniquement le comptage direct.
function lignesProblematiques(counts) {
  return CATEGORIES_PROBLEMATIQUES.flatMap(catKey =>
    Object.entries(counts?.[catKey] || {})
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([item, v]) => [CATEGORIE_LABELS[catKey], item, v])
  );
}

// ── Calcul de l'ensemble des indicateurs réels ──────────────────────────────
function computeStats({ fiches, eleves, libelle }) {
  const fichesAnnee = fiches.filter(f => f.annee_scolaire === libelle);
  const ficheById = new Map(fichesAnnee.map(f => [f.id, f]));

  const effectifSecteur = eleves.length;
  const totalDemandes = fichesAnnee.length;

  // Répartition par intervenant
  const parCategorie = { 'Psy-EN': 0, 'MaDR': 0, 'MaDP': 0, 'Aménagements': 0 };
  fichesAnnee.forEach(f => { parCategorie[getCategorieDemande(f)]++; });

  // Répartition cycle x type
  const matrice = {};
  CYCLES_TABLEAU.forEach(c => { matrice[c] = { Apprentissage: 0, Comportement: 0, Handicap: 0, 'Non renseigné': 0 }; });
  fichesAnnee.forEach(f => {
    const cy = getCycle(f.classe) || 'Cycle non déterminé';
    matrice[cy][getTypeFiche(f)]++;
  });

  // ── PSY-EN EDA ──
  const fichesPsy = fichesAnnee.filter(f => f.createdByProfession === 'Psy EN EDA');
  const actesPsy = actesDe(fichesAnnee, 'Psy EN EDA');
  const parCyclePsy = {};
  CYCLES_TABLEAU.forEach(c => { parCyclePsy[c] = 0; });
  fichesPsy.forEach(f => { parCyclePsy[getCycle(f.classe) || 'Cycle non déterminé']++; });

  const APsy = ACTES['Psy EN EDA'];
  const psy = {
    entretiensEleves: compteActe(actesPsy, APsy.entretienEleve),
    passationsPsycho: compteActe(actesPsy, APsy.passationPsycho),
    observationsClasse: compteActe(actesPsy, APsy.observationClasse),
    comptesRendus: actesPsy.filter(a => a.commentaire && a.commentaire.trim()).length,
    entretiensFamilles: compteActe(actesPsy, APsy.entretienFamille),
    participationsESS: compteActe(actesPsy, APsy.participationESS),
    participationsEE: compteActe(actesPsy, APsy.participationEE),
    orientationsExternes: compteActe(actesPsy, APsy.orientationExterne),
    dossiersMDPH: compteActe(actesPsy, APsy.dossierMDPH),
    reunionEquipe: compteActe(actesPsy, APsy.reunionEquipe),
    autre: compteActe(actesPsy, APsy.autre),
    liaisonsEnseignants: compteActe(actesPsy, APsy.liaisonEnseignant),
    parCycle: parCyclePsy,
    total: fichesPsy.length,
    clotures: fichesPsy.filter(f => f.statut === 'Clôturé').length,
  };

  // ── MaDR ──
  const actesMadr = actesDe(fichesAnnee, 'MaDR');
  const idsActeMadr = new Set(actesMadr.map(a => a.fiche.id));
  const fichesMadr = fichesAnnee.filter(f => f.createdByProfession === 'MaDR' || idsActeMadr.has(f.id));
  const parCycleMadr = {};
  CYCLES_TABLEAU.forEach(c => { parCycleMadr[c] = 0; });
  fichesMadr.forEach(f => { parCycleMadr[getCycle(f.classe) || 'Cycle non déterminé']++; });

  const AMadr = ACTES['MaDR'];
  const madr = {
    elevesEnCharge: fichesMadr.length,
    entretiensEleves: compteActe(actesMadr, AMadr.entretienEleve),
    seancesReeducation: compteActe(actesMadr, AMadr.seance),
    suivisIndividuels: compteActe(actesMadr, AMadr.suiviIndividuel),
    suivisGroupe: compteActe(actesMadr, AMadr.suiviGroupe),
    observationsClasse: compteActe(actesMadr, AMadr.observationClasse),
    comptesRendus: actesMadr.filter(a => a.commentaire && a.commentaire.trim()).length,
    clotureees: fichesMadr.filter(f => f.statut === 'Clôturé').length,
    entretiensFamilles: compteActe(actesMadr, AMadr.entretienFamille),
    liaisonsEnseignants: compteActe(actesMadr, AMadr.liaisonEnseignant),
    participationsEE: compteActe(actesMadr, AMadr.participationEE),
    orientationsExternes: compteActe(actesMadr, AMadr.orientationExterne),
    reunionEquipe: compteActe(actesMadr, AMadr.reunionEquipe),
    autre: compteActe(actesMadr, AMadr.autre),
    parCycle: parCycleMadr,
    total: fichesMadr.length,
  };

  // ── MaDP ──
  const actesMadp = actesDe(fichesAnnee, 'MaDP');
  const idsActeMadp = new Set(actesMadp.map(a => a.fiche.id));
  const fichesMadp = fichesAnnee.filter(f => f.createdByProfession === 'MaDP' || idsActeMadp.has(f.id));
  const parCycleMadp = {};
  CYCLES_TABLEAU.forEach(c => { parCycleMadp[c] = 0; });
  fichesMadp.forEach(f => { parCycleMadp[getCycle(f.classe) || 'Cycle non déterminé']++; });

  const AMadp = ACTES['MaDP'];
  const madp = {
    elevesAccompagnes: fichesMadp.length,
    entretiensEleves: compteActe(actesMadp, AMadp.entretienEleve),
    seancesAide: compteActe(actesMadp, AMadp.seance),
    suivisIndividuels: compteActe(actesMadp, AMadp.suiviIndividuel),
    suivisGroupe: compteActe(actesMadp, AMadp.suiviGroupe),
    observationsClasse: compteActe(actesMadp, AMadp.observationClasse),
    comptesRendus: actesMadp.filter(a => a.commentaire && a.commentaire.trim()).length,
    clotureees: fichesMadp.filter(f => f.statut === 'Clôturé').length,
    liaisonsEnseignants: compteActe(actesMadp, AMadp.liaisonEnseignant),
    entretiensFamilles: compteActe(actesMadp, AMadp.entretienFamille),
    participationsEE: compteActe(actesMadp, AMadp.participationEE),
    orientationsExternes: compteActe(actesMadp, AMadp.orientationExterne),
    reunionEquipe: compteActe(actesMadp, AMadp.reunionEquipe),
    autre: compteActe(actesMadp, AMadp.autre),
    parCycle: parCycleMadp,
    total: fichesMadp.length,
  };

  // Répartition par école et par classe
  const parEcoleClasse = {};
  fichesAnnee.forEach(f => {
    if (!f.ecole) return;
    if (!parEcoleClasse[f.ecole]) parEcoleClasse[f.ecole] = {};
    const cl = f.classe || 'Non renseignée';
    parEcoleClasse[f.ecole][cl] = (parEcoleClasse[f.ecole][cl] || 0) + 1;
  });
  const nbEcolesCouvertes = Object.keys(parEcoleClasse).length;
  const nbClotures = fichesAnnee.filter(f => f.statut === 'Clôturé').length;
  const nbNouvelles = fichesAnnee.filter(f => f.statut === 'Nouveau').length;
  const totalSeances = fichesAnnee.reduce((acc, f) => acc + (f.interventions || []).length, 0);

  // Problématiques cochées (fiche élève) : réutilise le socle partagé avec la
  // page Statistiques, sur les fiches déjà filtrées sur l'année.
  const { problematiquesGlobales, problematiquesParEcole } = computeIndicateursRased({ fiches: fichesAnnee });

  return {
    libelle, effectifSecteur, totalDemandes, parCategorie, matrice,
    psy, madr, madp,
    parEcoleClasse, nbEcolesCouvertes, nbClotures, nbNouvelles, totalSeances,
    problematiquesGlobales, problematiquesParEcole,
  };
}

// ── Génération des analyses qualitatives automatiques ───────────────────────
function analyseVueEnsemble(s) {
  const cycleDom = Object.entries(s.matrice)
    .map(([c, t]) => [c, t.Apprentissage + t.Comportement + t.Handicap + t['Non renseigné']])
    .sort((a, b) => b[1] - a[1])[0];
  const totauxType = TYPES.map(t => [t, CYCLES_TABLEAU.reduce((sum, c) => sum + s.matrice[c][t], 0)]);
  const typeDom = totauxType.sort((a, b) => b[1] - a[1])[0];
  const partCycle1 = pct(s.matrice['Cycle 1'].Apprentissage + s.matrice['Cycle 1'].Comportement + s.matrice['Cycle 1'].Handicap + s.matrice['Cycle 1']['Non renseigné'], s.totalDemandes);

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

function analysePsy(s, membres) {
  const p = s.psy;
  const cycleDom = Object.entries(p.parCycle).sort((a, b) => b[1] - a[1])[0];
  const lignes = [];
  if (membres.length > 0) {
    const sujet = listeNoms(membres);
    const verbe = membres.length > 1 ? 'ont réalisé' : 'a réalisé';
    lignes.push(`${sujet} ${verbe} ${p.entretiensEleves} entretien${p.entretiensEleves > 1 ? 's' : ''} avec des élèves, ${p.passationsPsycho} passation${p.passationsPsycho > 1 ? 's' : ''} psychométrique${p.passationsPsycho > 1 ? 's' : ''} et ${p.observationsClasse} observation${p.observationsClasse > 1 ? 's' : ''} en classe.`);
  }
  lignes.push(cycleDom && cycleDom[1] > 0
    ? `Les situations suivies concernent prioritairement le ${cycleDom[0]} (${pct(cycleDom[1], p.total)} % des dossiers).`
    : `Aucune tendance de cycle significative ne se dégage sur la période.`);
  lignes.push((p.orientationsExternes > 0 || p.dossiersMDPH > 0)
    ? `${p.orientationsExternes} orientation${p.orientationsExternes > 1 ? 's' : ''} externe${p.orientationsExternes > 1 ? 's' : ''} et ${p.dossiersMDPH} dossier${p.dossiersMDPH > 1 ? 's' : ''} MDPH ont été instruits, illustrant le travail de liaison avec les partenaires extérieurs au secteur.`
    : `Aucune orientation externe ni dossier MDPH n'a été enregistré sur la période.`);
  return lignes;
}

function analyseMadr(s, membres) {
  const m = s.madr;
  const tauxCloture = pct(m.clotureees, m.elevesEnCharge);
  const lignes = [];
  if (membres.length > 0) {
    const sujet = listeNoms(membres);
    const verbe = membres.length > 1 ? 'ont pris' : 'a pris';
    lignes.push(`${sujet} ${verbe} en charge ${m.elevesEnCharge} élève${m.elevesEnCharge > 1 ? 's' : ''} sur l'année, pour ${m.seancesReeducation} séance${m.seancesReeducation > 1 ? 's' : ''} de rééducation (${m.suivisIndividuels} en individuel, ${m.suivisGroupe} en groupe).`);
  }
  lignes.push(`${m.clotureees} prise${m.clotureees > 1 ? 's' : ''} en charge sur ${m.elevesEnCharge} ${m.clotureees > 1 ? 'ont' : 'a'} été clôturée${m.clotureees > 1 ? 's' : ''} (${tauxCloture} %), pour ${m.liaisonsEnseignants} liaison${m.liaisonsEnseignants > 1 ? 's' : ''} avec les enseignant·es.`);
  return lignes;
}

function analyseMadp(s, membres) {
  const m = s.madp;
  const tauxCloture = pct(m.clotureees, m.elevesAccompagnes);
  const lignes = [];
  if (membres.length > 0) {
    const sujet = listeNoms(membres);
    const verbe = membres.length > 1 ? 'ont accompagné' : 'a accompagné';
    lignes.push(`${sujet} ${verbe} ${m.elevesAccompagnes} élève${m.elevesAccompagnes > 1 ? 's' : ''} sur l'année, pour ${m.seancesAide} séance${m.seancesAide > 1 ? 's' : ''} d'aide pédagogique (${m.suivisIndividuels} en individuel, ${m.suivisGroupe} en groupe).`);
  }
  lignes.push(`${m.clotureees} prise${m.clotureees > 1 ? 's' : ''} en charge sur ${m.elevesAccompagnes} ${m.clotureees > 1 ? 'ont' : 'a'} été clôturée${m.clotureees > 1 ? 's' : ''} (${tauxCloture} %), pour ${m.liaisonsEnseignants} liaison${m.liaisonsEnseignants > 1 ? 's' : ''} avec les enseignant·es.`);
  return lignes;
}

function perspectivesPsy(s, anneeN1) {
  const p = s.psy;
  const items = [];
  items.push(p.dossiersMDPH > 0
    ? `Poursuivre le suivi des ${p.dossiersMDPH} dossier${p.dossiersMDPH > 1 ? 's' : ''} MDPH en cours et anticiper les renouvellements.`
    : 'Maintenir la vigilance sur les situations susceptibles de nécessiter une orientation MDPH.');
  items.push(`Poursuivre l'utilisation de l'arbre décisionnel EDA et renforcer la liaison avec les ${p.liaisonsEnseignants} enseignant·es déjà mobilisé·es.`);
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
  const items = [];
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
export async function generateRapportAnnuel({ anneeScolaire, fiches, eleves, ecoles, equipe = [] }) {
  const libelle = anneeScolaire?.libelle || anneeScolaire;
  const anneeN1 = anneeSuivante(libelle);
  const s = computeStats({ fiches, eleves: eleves || [], libelle });

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

  const yTeam = 115;
  if (equipe.length > 0) {
    const teamWidth = (pageWidth - 2 * margin - 10 * (equipe.length - 1)) / equipe.length;
    equipe.forEach((m, i) => {
      const xPos = margin + i * (teamWidth + 10);
      setFill(doc, COLORS[m.profession] || '#566880');
      doc.rect(xPos, yTeam, teamWidth, 38, 'F');
      setText(doc, '#FFFFFF'); doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
      doc.text(nomAffiche(m), xPos + 4, yTeam + 12, { maxWidth: teamWidth - 8 });
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
      doc.text(TITRES[m.profession] || m.profession, xPos + 4, yTeam + 22, { maxWidth: teamWidth - 8 });
    });
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10); setText(doc, '#FFFFFF');
  doc.text("Ce rapport contient :", margin, 175);
  doc.setFontSize(9); setText(doc, '#C8D2E2');
  [
    "1. Vue d'ensemble du dispositif RASED",
    "2. Répartition par école et par classe",
    '3. Répartition des problématiques',
    "4. Psychologue de l'Éducation Nationale · EDA",
    '5. Maître à Dominante Relationnelle (MaDR)',
    '6. Maître à Dominante Pédagogique (MaDP)',
    '7. Signatures',
  ].forEach((t, i) => doc.text(t, margin, 183 + i * 6));

  doc.setFontSize(10); setText(doc, '#C8D2E2');
  const genDate = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.text(`Document généré le ${genDate}`, pageWidth / 2, pageHeight - 16, { align: 'center' });

  // ───────────────────────── SECTION 1 (pages 2-3) ─────────────────────────
  doc.addPage();
  sectionBanner(doc, { x: margin, y: 22, width: contentWidth, num: 1, title: "VUE D'ENSEMBLE DU DISPOSITIF RASED", color: '#1A3353' });

  let y = kpiGrid(doc, {
    x: margin, y: 40, width: contentWidth, color: '#1A3353', perRow: 3,
    items: [
      { label: "Demandes d'aide (total)", value: s.totalDemandes },
      { label: 'Nouvelles demandes', value: s.nbNouvelles },
      { label: 'Suivis clôturés', value: s.nbClotures },
      { label: 'Séances & interventions', value: s.totalSeances },
      { label: 'Écoles couvertes', value: s.nbEcolesCouvertes },
      { label: '% effectif concerné', value: `${pct(s.totalDemandes, s.effectifSecteur)} %` },
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
      ['TOTAL', s.totalDemandes, '100 %'],
    ],
  });

  y += 10;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, '#1A3353');
  doc.text('Répartition par cycle et type d\'intervention', margin, y); y += 4;
  const totauxParType = t => CYCLES_TABLEAU.reduce((sum, c) => sum + s.matrice[c][t], 0);
  const colWCycleType = contentWidth / (TYPES_TABLEAU.length + 1);
  y = drawTable(doc, {
    x: margin, y, colWidths: Array(TYPES_TABLEAU.length + 1).fill(colWCycleType),
    headers: ['Cycle', ...TYPES_TABLEAU],
    rows: [
      ...CYCLES_TABLEAU.map(c => [c, ...TYPES_TABLEAU.map(t => s.matrice[c][t])]),
      ['TOTAL', ...TYPES_TABLEAU.map(t => totauxParType(t))],
    ],
  });

  addFooter(doc, pageWidth, pageHeight, margin, 2, 0);

  doc.addPage();
  addHeader(doc, pageWidth, margin, libelle);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, '#1A3353');
  doc.text("Répartition par cycle et type d'intervention (graphique)", margin, 26);
  drawGroupedBarChart(doc, {
    x: margin, y: 34, width: contentWidth, height: 60, groups: CYCLES_TABLEAU,
    series: TYPES_TABLEAU.map(t => ({ label: t, color: TYPE_COLORS[t], values: CYCLES_TABLEAU.map(c => s.matrice[c][t]) })),
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

  // ───────────────────────── SECTION 2 — PAR ÉCOLE ET PAR CLASSE ──────────
  doc.addPage();
  sectionBanner(doc, { x: margin, y: 22, width: contentWidth, num: 2, title: 'RÉPARTITION PAR ÉCOLE ET PAR CLASSE', color: '#1A3353' });
  let yEcole = 40;

  const ecoleEntries = Object.entries(s.parEcoleClasse).sort((a, b) => {
    const totA = Object.values(a[1]).reduce((sum, v) => sum + v, 0);
    const totB = Object.values(b[1]).reduce((sum, v) => sum + v, 0);
    return totB - totA;
  });

  if (ecoleEntries.length === 0) {
    setText(doc, '#566880'); doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
    doc.text("Aucune école renseignée dans les fiches de l'année.", margin, yEcole);
  } else {
    ecoleEntries.forEach(([ecole, classes]) => {
      const total = Object.values(classes).reduce((sum, v) => sum + v, 0);
      const classEntries = Object.entries(classes).sort((a, b) => b[1] - a[1]);
      const blockH = 9 + classEntries.length * 7 + 6;
      if (yEcole + blockH > pageHeight - 18) {
        addFooter(doc, pageWidth, pageHeight, margin, 0, 0);
        doc.addPage();
        addHeader(doc, pageWidth, margin, libelle);
        yEcole = 26;
      }
      setFill(doc, '#3B82C4'); setText(doc, '#FFFFFF');
      doc.rect(margin, yEcole, contentWidth, 8, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5);
      doc.text(`${titleCase(ecole)}  ·  ${total} élève${total > 1 ? 's' : ''}`, margin + 3, yEcole + 5.5);
      yEcole += 8;
      yEcole = drawTable(doc, {
        x: margin, y: yEcole, colWidths: [contentWidth - 50, 50],
        headers: ['Classe', 'Élèves'], headerColor: '#566880', fontSize: 8,
        rows: classEntries.map(([cl, nb]) => [cl, nb]),
      });
      yEcole += 6;
    });
  }
  addFooter(doc, pageWidth, pageHeight, margin, 0, 0);

  // ───────────────────────── SECTION 3 — RÉPARTITION DES PROBLÉMATIQUES ───
  doc.addPage();
  sectionBanner(doc, { x: margin, y: 22, width: contentWidth, num: 3, title: 'RÉPARTITION DES PROBLÉMATIQUES', color: '#1A3353' });
  let yProb = 40;
  const probColWidths = [40, contentWidth - 70, 30];

  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, '#1A3353');
  doc.text('Répartition globale (ensemble du secteur)', margin, yProb); yProb += 4;
  const lignesGlobales = lignesProblematiques(s.problematiquesGlobales);
  if (lignesGlobales.length === 0) {
    setText(doc, '#566880'); doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
    doc.text('Aucune problématique cochée sur la période.', margin, yProb); yProb += 8;
  } else {
    yProb = drawTable(doc, {
      x: margin, y: yProb, colWidths: probColWidths,
      headers: ['Catégorie', 'Problématique', 'Élèves'],
      rows: lignesGlobales,
    });
    yProb += 3;
    setText(doc, '#94A3B8'); doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5);
    doc.splitTextToSize(NOTE_PROBLEMATIQUES, contentWidth).forEach(l => { doc.text(l, margin, yProb); yProb += 3.5; });
    yProb += 6;
  }

  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, '#1A3353');
  doc.text('Répartition par école', margin, yProb); yProb += 6;

  const ecolesProbEntries = Object.entries(s.problematiquesParEcole)
    .map(([ecole, counts]) => [ecole, lignesProblematiques(counts)])
    .filter(([, lignes]) => lignes.length > 0)
    .sort((a, b) => {
      const totA = a[1].reduce((sum, l) => sum + l[2], 0);
      const totB = b[1].reduce((sum, l) => sum + l[2], 0);
      return totB - totA;
    });

  if (ecolesProbEntries.length === 0) {
    setText(doc, '#566880'); doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
    doc.text('Aucune problématique cochée par école sur la période.', margin, yProb);
  } else {
    ecolesProbEntries.forEach(([ecole, lignes]) => {
      const noteLines = doc.splitTextToSize(NOTE_PROBLEMATIQUES, contentWidth);
      const blockH = 8 + 7 * (1 + lignes.length) + 3 + noteLines.length * 3.5 + 6;
      if (yProb + blockH > pageHeight - 18) {
        addFooter(doc, pageWidth, pageHeight, margin, 0, 0);
        doc.addPage();
        addHeader(doc, pageWidth, margin, libelle);
        yProb = 26;
      }
      setFill(doc, '#3B82C4'); setText(doc, '#FFFFFF');
      doc.rect(margin, yProb, contentWidth, 8, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5);
      doc.text(titleCase(ecole), margin + 3, yProb + 5.5);
      yProb += 8;
      yProb = drawTable(doc, {
        x: margin, y: yProb, colWidths: probColWidths,
        headers: ['Catégorie', 'Problématique', 'Élèves'], headerColor: '#566880', fontSize: 8,
        rows: lignes,
      });
      yProb += 3;
      setText(doc, '#94A3B8'); doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5);
      noteLines.forEach(l => { doc.text(l, margin, yProb); yProb += 3.5; });
      yProb += 6;
    });
  }
  addFooter(doc, pageWidth, pageHeight, margin, 0, 0);

  // ───────────────────────── SECTION 4 — PSY-EN (pages suivantes) ──────────
  doc.addPage();
  const membresPsy = membresProfession(equipe, 'Psy EN EDA');
  sectionBanner(doc, { x: margin, y: 22, width: contentWidth, num: 4, title: `PSY-EN EDA · ${listeNoms(membresPsy, { maj: true }) || 'POSTE NON POURVU'}`, color: COLORS['Psy EN EDA'] });
  y = kpiGrid(doc, {
    x: margin, y: 40, width: contentWidth, color: COLORS['Psy EN EDA'], perRow: 4,
    items: [
      { label: "Entretien avec l'élève", value: s.psy.entretiensEleves },
      { label: 'Passation psychométrique', value: s.psy.passationsPsycho },
      { label: 'Observation en classe', value: s.psy.observationsClasse },
      { label: 'Entretien avec la famille', value: s.psy.entretiensFamilles },
      { label: 'Participation à une ESS', value: s.psy.participationsESS },
      { label: 'Participation à une EE', value: s.psy.participationsEE },
      { label: "Liaison avec l'enseignant·e", value: s.psy.liaisonsEnseignants },
      { label: 'Orientation externe', value: s.psy.orientationsExternes },
      { label: 'Dossier MDPH', value: s.psy.dossiersMDPH },
      { label: "Réunion d'équipe RASED", value: s.psy.reunionEquipe },
      { label: 'Autre', value: s.psy.autre },
      { label: 'Élèves suivis (total)', value: s.psy.total },
      { label: 'Prises en charge clôturées', value: s.psy.clotures },
      { label: 'Entretiens avec notes', value: s.psy.comptesRendus },
    ],
  });
  addFooter(doc, pageWidth, pageHeight, margin, 0, 0);

  doc.addPage();
  addHeader(doc, pageWidth, margin, libelle);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, COLORS['Psy EN EDA']);
  doc.text('Répartition par cycle', margin, 26);
  drawGroupedBarChart(doc, {
    x: margin, y: 34, width: contentWidth, height: 55, groups: CYCLES_TABLEAU,
    series: [{ label: 'Psy-EN EDA', color: COLORS['Psy EN EDA'], values: CYCLES_TABLEAU.map(c => s.psy.parCycle[c]) }],
  });

  let y3 = 105;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, COLORS['Psy EN EDA']);
  doc.text('Analyse qualitative', margin, y3); y3 += 6;
  y3 = addTextBlock(doc, { x: margin, y: y3, width: contentWidth, lines: analysePsy(s, membresPsy) });

  const perspPsy = perspectivesPsy(s, anneeN1);
  y3 += 4;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, COLORS['Psy EN EDA']);
  doc.text(perspPsy.titre, margin, y3); y3 += 6;
  addTextBlock(doc, { x: margin, y: y3, width: contentWidth, lines: perspPsy.items.map(l => `• ${l}`) });

  addFooter(doc, pageWidth, pageHeight, margin, 0, 0);

  // ───────────────────────── SECTION 5 — MaDR ───────────────────────────────
  doc.addPage();
  const membresMadr = membresProfession(equipe, 'MaDR');
  sectionBanner(doc, { x: margin, y: 22, width: contentWidth, num: 5, title: `MADR · ${listeNoms(membresMadr, { maj: true }) || 'POSTE NON POURVU'}`, color: COLORS['MaDR'] });
  y = kpiGrid(doc, {
    x: margin, y: 40, width: contentWidth, color: COLORS['MaDR'], perRow: 4,
    items: [
      { label: "Entretien avec l'élève", value: s.madr.entretiensEleves },
      { label: 'Séance de rééducation', value: s.madr.seancesReeducation },
      { label: 'Suivi individuel', value: s.madr.suivisIndividuels },
      { label: 'Suivi en groupe', value: s.madr.suivisGroupe },
      { label: 'Observation en classe', value: s.madr.observationsClasse },
      { label: 'Entretien avec la famille', value: s.madr.entretiensFamilles },
      { label: 'Participation à une EE', value: s.madr.participationsEE },
      { label: "Liaison avec l'enseignant·e", value: s.madr.liaisonsEnseignants },
      { label: 'Orientation externe', value: s.madr.orientationsExternes },
      { label: "Réunion d'équipe RASED", value: s.madr.reunionEquipe },
      { label: 'Autre', value: s.madr.autre },
      { label: 'Élèves pris en charge', value: s.madr.elevesEnCharge },
      { label: 'Prises en charge clôturées', value: s.madr.clotureees },
      { label: 'Entretiens avec notes', value: s.madr.comptesRendus },
    ],
  });
  addFooter(doc, pageWidth, pageHeight, margin, 0, 0);

  doc.addPage();
  addHeader(doc, pageWidth, margin, libelle);

  let y4 = 30;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, COLORS['MaDR']);
  doc.text('Analyse qualitative', margin, y4); y4 += 6;
  y4 = addTextBlock(doc, { x: margin, y: y4, width: contentWidth, lines: analyseMadr(s, membresMadr) });

  const perspMadr = perspectivesMadr(s, anneeN1);
  y4 += 4;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, COLORS['MaDR']);
  doc.text(perspMadr.titre, margin, y4); y4 += 6;
  addTextBlock(doc, { x: margin, y: y4, width: contentWidth, lines: perspMadr.items.map(l => `• ${l}`) });

  addFooter(doc, pageWidth, pageHeight, margin, 0, 0);

  // ───────────────────────── SECTION 6 — MaDP ───────────────────────────────
  doc.addPage();
  const membresMadp = membresProfession(equipe, 'MaDP');
  sectionBanner(doc, { x: margin, y: 22, width: contentWidth, num: 6, title: `MADP · ${listeNoms(membresMadp, { maj: true }) || 'POSTE NON POURVU'}`, color: COLORS['MaDP'] });
  y = kpiGrid(doc, {
    x: margin, y: 40, width: contentWidth, color: COLORS['MaDP'], perRow: 4,
    items: [
      { label: "Entretien avec l'élève", value: s.madp.entretiensEleves },
      { label: "Séance d'aide pédagogique", value: s.madp.seancesAide },
      { label: 'Suivi individuel', value: s.madp.suivisIndividuels },
      { label: 'Suivi en groupe', value: s.madp.suivisGroupe },
      { label: 'Observation en classe', value: s.madp.observationsClasse },
      { label: 'Entretien avec la famille', value: s.madp.entretiensFamilles },
      { label: 'Participation à une EE', value: s.madp.participationsEE },
      { label: "Liaison avec l'enseignant·e", value: s.madp.liaisonsEnseignants },
      { label: 'Orientation externe', value: s.madp.orientationsExternes },
      { label: "Réunion d'équipe RASED", value: s.madp.reunionEquipe },
      { label: 'Autre', value: s.madp.autre },
      { label: 'Élèves accompagnés', value: s.madp.elevesAccompagnes },
      { label: 'Prises en charge clôturées', value: s.madp.clotureees },
      { label: 'Entretiens avec notes', value: s.madp.comptesRendus },
    ],
  });
  addFooter(doc, pageWidth, pageHeight, margin, 0, 0);

  doc.addPage();
  addHeader(doc, pageWidth, margin, libelle);

  let y5 = 30;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, COLORS['MaDP']);
  doc.text('Analyse qualitative', margin, y5); y5 += 6;
  y5 = addTextBlock(doc, { x: margin, y: y5, width: contentWidth, lines: analyseMadp(s, membresMadp) });

  const perspMadp = perspectivesMadp(s, anneeN1);
  y5 += 4;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); setText(doc, COLORS['MaDP']);
  doc.text(perspMadp.titre, margin, y5); y5 += 6;
  addTextBlock(doc, { x: margin, y: y5, width: contentWidth, lines: perspMadp.items.map(l => `• ${l}`) });

  addFooter(doc, pageWidth, pageHeight, margin, 0, 0);

  // PAGE — SIGNATURES
  doc.addPage();
  addHeader(doc, pageWidth, margin, libelle);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16); setText(doc, '#1A3353');
  doc.text('Validation du rapport annuel', margin, 32);

  const dateSignature = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11); setText(doc, '#182840');
  doc.text(`Fait à La Possession, le ${dateSignature}`, margin, 46);

  let ySig = 64;
  if (equipe.length === 0) {
    setText(doc, '#94A3B8'); doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
    doc.text("Aucun membre renseigné dans l'équipe RASED.", margin, ySig);
  }
  equipe.forEach(m => {
    setText(doc, COLORS[m.profession] || '#566880'); doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    doc.text(nomAffiche(m), margin, ySig);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); setText(doc, '#566880');
    doc.text(TITRES[m.profession] || m.profession, margin, ySig + 6);
    setDraw(doc, '#94A3B8');
    doc.line(margin, ySig + 22, margin + 70, ySig + 22);
    setText(doc, '#94A3B8'); doc.setFontSize(8);
    doc.text('Signature', margin, ySig + 27);
    ySig += 40;
  });
  addFooter(doc, pageWidth, pageHeight, margin, 0, 0);

  // ── Numérotation finale (total réel des pages, hors couverture) ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, pageWidth, pageHeight, margin, i - 1, totalPages - 1);
  }

  return doc;
}
