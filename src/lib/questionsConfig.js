// Configuration centralisée des questions et analyses
export const QUESTIONS_CONFIG = {
  // Lecture (Q1-Q5)
  lecture: [
    {
      id: "q1",
      title: "📘 Lecture – Question 1",
      subtitle: "Un élève lit lentement, confond les graphèmes complexes et se fatigue rapidement.",
      category: "Lecture",
      domain: "apprentissage",
      options: [
        {
          label: "Dyslexie développementale",
          analysis: {
            title: "Analyse – Dyslexie développementale",
            analysisType: "Dyslexie",
            items: [
              "📌 Hypothèses : trouble phonologique, automatisation faible",
              "🔍 À vérifier : fluence, erreurs phonémiques, conscience phonologique",
              "🎯 Adressage : Orthophoniste",
              "⚠️ Vigilance : estime de soi scolaire",
            ],
          },
        },
        {
          label: "Manque d'entraînement",
          analysis: {
            title: "Analyse – Manque d'entraînement",
            analysisType: "Manque d'entraînement",
            items: [
              "📌 Hypothèses : exposition limitée, manque de pratique",
              "🔍 À vérifier : habitudes de lecture, contexte familial",
              "🎯 Adressage : Enseignant / RASED",
              "⚠️ Vigilance : éviter la pathologisation",
            ],
          },
        },
        {
          label: "Anxiété de performance",
          analysis: {
            title: "Analyse – Anxiété de performance",
            analysisType: "Anxiété",
            items: [
              "📌 Hypothèses : anxiété de performance, peur de l'erreur",
              "🔍 À vérifier : signes corporels, évitement",
              "🎯 Adressage : Psychologue scolaire",
              "⚠️ Vigilance : pression scolaire",
            ],
          },
        },
        {
          label: "Trouble attentionnel",
          analysis: {
            title: "Analyse – Trouble attentionnel",
            analysisType: "Trouble attentionnel",
            items: [
              "📌 Hypothèses : distractibilité, variabilité",
              "🔍 À vérifier : fluctuations, erreurs d'inattention",
              "🎯 Adressage : Neuropsychologue / Pédiatre",
              "⚠️ Vigilance : diagnostic médical",
            ],
          },
        },
      ],
    },
    // Q2-Q5 would follow the same pattern...
  ],
  // Add other domains (ecriture, maths, comportement, developpement, contexte)
};

export function getQuestion(domain, questionId) {
  const questions = QUESTIONS_CONFIG[domain] || [];
  return questions.find((q) => q.id === questionId);
}

export function getQuestionByPath(domain, questionNum) {
  const questionId = `q${questionNum}`;
  return getQuestion(domain, questionId);
}