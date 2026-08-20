import { fetchAllPages } from './fetchAllPages';

// Socle d'indicateurs officiels RASED, partagé entre la page Statistiques et
// l'export annuel. Lit exclusivement FicheEleve (problematiques cochées sur
// la fiche élève + interventions) : l'entité Diagnostic (outil « arbre
// décisionnel EDA », rattaché à l'élève par simple correspondance nom/prénom
// texte) reste une source annexe, volontairement exclue de ce socle.
const CATEGORIES_PROBLEMATIQUES = ['apprentissages', 'comportement', 'developpement', 'contexte', 'autre'];

function compterProblematiques(fiches) {
  const counts = {};
  CATEGORIES_PROBLEMATIQUES.forEach(cat => { counts[cat] = {}; });
  fiches.forEach(f => {
    const p = f.problematiques || {};
    CATEGORIES_PROBLEMATIQUES.forEach(cat => {
      (p[cat] || []).forEach(item => {
        counts[cat][item] = (counts[cat][item] || 0) + 1;
      });
    });
  });
  return counts;
}

export async function fetchIndicateursRased({ anneeScolaire } = {}) {
  const [fiches, ecoles] = await Promise.all([
    fetchAllPages('FicheEleve', '-created_date'),
    fetchAllPages('EcoleRased', '-nom'),
  ]);
  return computeIndicateursRased({ fiches, ecoles, anneeScolaire });
}

export function computeIndicateursRased({ fiches, ecoles = [], anneeScolaire }) {
  const fichesAnnee = anneeScolaire ? fiches.filter(f => f.annee_scolaire === anneeScolaire) : fiches;

  const ecolesConcernees = [...new Set(fichesAnnee.map(f => f.ecole).filter(Boolean))];
  const nbEcoles = ecolesConcernees.length;
  const nbEleves = fichesAnnee.length;

  const suivisParEcole = ecolesConcernees
    .map(ecole => ({ ecole, nbEleves: fichesAnnee.filter(f => f.ecole === ecole).length }))
    .sort((a, b) => b.nbEleves - a.nbEleves);

  const problematiquesGlobales = compterProblematiques(fichesAnnee);
  const problematiquesParEcole = {};
  ecolesConcernees.forEach(ecole => {
    problematiquesParEcole[ecole] = compterProblematiques(fichesAnnee.filter(f => f.ecole === ecole));
  });

  return {
    fichesAnnee,
    ecoles,
    nbEcoles,
    nbEleves,
    suivisParEcole,
    problematiquesGlobales,
    problematiquesParEcole,
  };
}
