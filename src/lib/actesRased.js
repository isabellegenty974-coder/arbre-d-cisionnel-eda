// Source unique des actes du menu « Acte accompli » (fiche élève, onglet Suivi).
// Le rapport annuel (rapportAnnuelGenerator.js) et la page Statistiques
// (StatsAnnuelles.jsx) importent ce fichier plutôt que de dupliquer leurs
// propres listes : ajouter, renommer ou supprimer un acte se fait ici, une
// seule fois, et se répercute automatiquement partout où il est compté.

// Actes spécifiques à chaque profession, dans l'ordre d'affichage du menu.
const ACTES_PSY = [
  { key: 'entretienEleve', label: "Entretien avec l'élève (Psy-EN)" },
  { key: 'passationPsycho', label: 'Passation psychométrique (Psy-EN)' },
  { key: 'observationClasse', label: 'Observation en classe (Psy-EN)' },
  { key: 'entretienFamille', label: 'Entretien avec la famille' },
  { key: 'participationESS', label: 'Participation à une ESS' },
  { key: 'participationEE', label: 'Participation à une EE' },
  { key: 'liaisonEnseignant', label: "Liaison avec l'enseignant·e" },
  { key: 'orientationExterne', label: 'Orientation externe (Psy-EN)' },
  { key: 'dossierMDPH', label: 'Dossier MDPH (Psy-EN)' },
];
const ACTES_MADR = [
  { key: 'entretienEleve', label: "Entretien avec l'élève (MaDR)" },
  { key: 'suiviIndividuel', label: 'Suivi individuel (MaDR)' },
  { key: 'suiviGroupe', label: 'Suivi en groupe (MaDR)' },
  { key: 'observationClasse', label: 'Observation en classe (MaDR)' },
  { key: 'entretienFamille', label: 'Entretien avec la famille (MaDR)' },
  { key: 'participationEE', label: 'Participation à une EE (MaDR)' },
  { key: 'liaisonEnseignant', label: "Liaison avec l'enseignant·e (MaDR)" },
  { key: 'orientationExterne', label: 'Orientation externe (MaDR)' },
];
const ACTES_MADP = [
  { key: 'entretienEleve', label: "Entretien avec l'élève (MaDP)" },
  { key: 'suiviIndividuel', label: 'Suivi individuel (MaDP)' },
  { key: 'suiviGroupe', label: 'Suivi en groupe (MaDP)' },
  { key: 'observationClasse', label: 'Observation en classe (MaDP)' },
  { key: 'entretienFamille', label: 'Entretien avec la famille (MaDP)' },
  { key: 'participationEE', label: 'Participation à une EE (MaDP)' },
  { key: 'liaisonEnseignant', label: "Liaison avec l'enseignant·e (MaDP)" },
  { key: 'orientationExterne', label: 'Orientation externe (MaDP)' },
];
// Actes communs aux trois professions : même libellé exact quelle que soit la
// profession de l'intervenant, affichés une seule fois dans le menu.
const ACTES_COMMUNS = [
  { key: 'reunionEquipe', label: "Réunion d'équipe RASED" },
  { key: 'autre', label: 'Autre' },
];

// Groupes affichés dans le <select> « Acte accompli » de DetailFiche.jsx.
export const MENU_ACTE_ACCOMPLI = [
  { groupe: 'Actes Psy-EN EDA', actes: ACTES_PSY },
  { groupe: 'Actes MaDR', actes: ACTES_MADR },
  { groupe: 'Actes MaDP', actes: ACTES_MADP },
  { groupe: 'Commun', actes: ACTES_COMMUNS },
];

function toDict(actes) {
  return Object.fromEntries(actes.map(a => [a.key, a.label]));
}

// Dictionnaire par profession { clé: libellé exact }, actes spécifiques +
// communs. Utilisé pour compter les actes par égalité stricte sur leur
// libellé réellement sélectionné dans le menu (jamais par recherche de mots
// dans une description ou un commentaire).
export const ACTES = {
  'Psy EN EDA': { ...toDict(ACTES_PSY), ...toDict(ACTES_COMMUNS) },
  'MaDR': { ...toDict(ACTES_MADR), ...toDict(ACTES_COMMUNS) },
  'MaDP': { ...toDict(ACTES_MADP), ...toDict(ACTES_COMMUNS) },
};
