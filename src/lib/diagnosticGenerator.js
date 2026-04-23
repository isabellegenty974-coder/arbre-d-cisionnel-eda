// Synthèse intelligente basée sur les analyses sélectionnées
export const generateDiagnosticSynthesis = (selections) => {
  const profileMap = {
    // Lecture
    'q1a': { category: 'Dyslexie', score: 'phonologique', professionals: ['Orthophoniste'], concerns: ['estime de soi'] },
    'q1b': { category: 'Manque d\'entraînement', score: 'pratique', professionals: ['Enseignant', 'RASED'], concerns: ['contexte familial'] },
    'q1c': { category: 'Anxiété de performance', score: 'anxiété', professionals: ['Psychologue scolaire'], concerns: ['pression scolaire'] },
    'q1d': { category: 'Trouble attentionnel', score: 'attention', professionals: ['Neuropsychologue'], concerns: ['diagnostic médical'] },
    'q2a': { category: 'Trouble oculomoteur', score: 'motricité visuelle', professionals: ['Orthoptiste', 'Ophtalmologue'], concerns: ['fatigue visuelle'] },
    'q2b': { category: 'Dyslexie', score: 'visuelle', professionals: ['Orthophoniste'], concerns: ['reconnaissance de formes'] },
    'q3a': { category: 'Trouble de compréhension', score: 'sémantique', professionals: ['Orthophoniste'], concerns: ['vocabulaire'] },
    'q3b': { category: 'Trouble lexical', score: 'fluence', professionals: ['Orthophoniste'], concerns: ['automatisation'] },
  };

  // Compter les catégories de problèmes
  const problems = {};
  Object.entries(selections).forEach(([category, items]) => {
    items.forEach((item) => {
      const profile = profileMap[item.questionId.toLowerCase()];
      if (profile) {
        problems[profile.category] = (problems[profile.category] || 0) + 1;
      }
    });
  });

  // Classer par fréquence
  const sortedProblems = Object.entries(problems)
    .sort(([, a], [, b]) => b - a)
    .map(([category, count]) => ({ category, count }));

  // Générer la synthèse
  const mainCategory = sortedProblems[0]?.category || 'Besoin d\'investigation';
  const secondaryCategories = sortedProblems.slice(1).map(p => p.category);
  const allProfessionals = [...new Set(
    sortedProblems.flatMap(p => profileMap[Object.keys(profileMap).find(k => profileMap[k].category === p.category)]?.professionals || [])
  )];

  return {
    mainCategory,
    secondaryCategories,
    professionals: allProfessionals,
    problemCount: Object.values(problems).reduce((a, b) => a + b, 0),
    profiles: sortedProblems
  };
};

// Générer des recommandations basées sur le profil
export const generateRecommendations = (mainCategory, selections) => {
  const recommendations = {
    'Dyslexie': [
      '💡 Proposer des supports adaptés (polices adaptées, espacements augmentés)',
      '💡 Mettre en place des entraînements phonologiques réguliers',
      '💡 Utiliser des outils numériques (synthèse vocale, surlignage)',
      '💡 Favoriser la lecture plaisir sans pression d\'évaluation'
    ],
    'Manque d\'entraînement': [
      '💡 Augmenter progressivement le temps de lecture quotidienne',
      '💡 Lire avec l\'enfant (lecture partagée)',
      '💡 Proposer des livres adaptés aux intérêts de l\'enfant',
      '💡 Créer une routine de lecture positive'
    ],
    'Anxiété de performance': [
      '💡 Réduire la pression et valoriser les efforts plutôt que les résultats',
      '💡 Utiliser des techniques de relaxation avant la lecture',
      '💡 Proposer des lectures sans correction/évaluation',
      '💡 Renforcer la confiance en soi progressivement'
    ],
    'Trouble attentionnel': [
      '💡 Segmenter les textes en portions courtes',
      '💡 Minimiser les distractions (environnement calme)',
      '💡 Faire des pauses régulières',
      '💡 Proposer des tâches avec renforcement immédiat'
    ],
    'Trouble oculomoteur': [
      '💡 Consulter un orthoptiste pour une prise en charge',
      '💡 Augmenter la taille des caractères temporairement',
      '💡 Favoriser des textes avec espacement augmenté',
      '💡 Prévoir des pauses visuelles régulières'
    ],
    'Trouble de compréhension': [
      '💡 Enrichir le vocabulaire progressivement',
      '💡 Utiliser des images/schémas pour soutenir la compréhension',
      '💡 Poser des questions avant, pendant et après la lecture',
      '💡 Verbaliser le processus de compréhension'
    ]
  };

  return recommendations[mainCategory] || recommendations['Besoin d\'investigation'] || [];
};