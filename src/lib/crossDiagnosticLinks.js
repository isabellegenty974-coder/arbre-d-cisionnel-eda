// Mapping des diagnostics liés entre modules
export const diagnosticLinks = {
  // Apprentissage x Développement
  'q1': { linked: ['q35', 'q36'], reason: 'Lecture lente → vérifier motricité fine et planification' },
  'q2': { linked: ['q37'], reason: 'Saute les lignes → attention fluctuante possible' },
  'q3': { linked: ['q34'], reason: 'Compréhension écrite faible → vérifier articulation/langage' },
  'q4': { linked: ['q35', 'q36'], reason: 'Inversions b/d → motricité fine ou lateralité' },
  'q5': { linked: ['q37'], reason: 'Lit vite mais erreurs → attention/concentration' },
  
  // Écriture x Développement
  'q11': { linked: ['q35'], reason: 'Écriture douloureuse → motricité fine problématique' },
  'q12': { linked: ['q35', 'q36'], reason: 'Écriture illisible → motricité ou planification' },
  'q13': { linked: ['q29', 'q35'], reason: 'Refuse d\'écrire → anxiété ou motricité fine' },
  'q14': { linked: ['q34'], reason: 'Erreurs phonologiques → articulation/langage' },
  'q15': { linked: ['q34'], reason: 'Oral bon mais écrit faible → langage expression vs compréhension' },
  
  // Maths x Comportement/Développement
  'q19': { linked: ['q36'], reason: 'Sens du nombre faible → planification/abstraction' },
  'q21': { linked: ['q29', 'q30'], reason: 'Panique en maths → anxiété ou impulsivité' },
  'q22': { linked: ['q33', 'q36'], reason: 'Problèmes écrits → compréhension langage + planification' },
  'q25': { linked: ['q36'], reason: 'Compte sur doigts en CM2 → abstraction/planification' },
  
  // Comportement x Contexte
  'q27': { linked: ['q40'], reason: 'Impulsivité → vérifier contexte familial/absentéisme' },
  'q29': { linked: ['q38', 'q40'], reason: 'Angoisse éval → événement familial ou absentéisme' },
  'q30': { linked: ['q38'], reason: 'Colères → peut être lié à événement familial' },
  'q31': { linked: ['q39', 'q40'], reason: 'Absent/rêveur → environnement ou absentéisme' },
  'q32': { linked: ['q38', 'q39'], reason: 'Agressivité → climat classe ou événement familial' },
};

export function getCrossRecommendations(questionId) {
  const links = diagnosticLinks[questionId];
  return links || null;
}

export function getLinkedQuestions(selectedQuestions) {
  const crossLinks = {};
  
  selectedQuestions.forEach(q => {
    const links = diagnosticLinks[q];
    if (links) {
      links.linked.forEach(linkedQ => {
        if (!selectedQuestions.includes(linkedQ)) {
          crossLinks[linkedQ] = links.reason;
        }
      });
    }
  });
  
  return crossLinks;
}