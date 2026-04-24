/**
 * analyseEDA
 * Input:  reponsesQCM — objet { [questionId]: "a" | "b" | "c" | "d" }
 * Output: hypotheses  — tableau de strings
 *
 * Chaque question contribue à un score de catégorie.
 * Les questions sont affectées à une catégorie via QUESTION_CATEGORIES.
 * Une réponse non-A (b, c, d) vaut 1 point (indice de difficulté).
 */

// Mapping questionId → catégorie
const QUESTION_CATEGORIES = {
  // Lecture (Q1–Q5)
  q1: "lecture", q2: "lecture", q3: "lecture", q4: "lecture", q5: "lecture",
  // Écriture / graphisme (Q11–Q18)
  q11: "ecriture", q12: "ecriture", q13: "ecriture", q14: "ecriture",
  q15: "ecriture", q16: "ecriture", q17: "ecriture", q18: "ecriture",
  // Maths (Q19–Q25)
  q19: "maths", q20: "maths", q21: "maths", q22: "maths",
  q23: "maths", q24: "maths", q25: "maths",
  // Comportement (Q26–Q32)
  q26: "comportement", q27: "comportement", q28: "comportement", q29: "comportement",
  q30: "comportement", q31: "comportement", q32: "comportement",
  // Attention — questions comportement spécifiques
  q26: "attention", q27: "attention",
  // Développement (Q33–Q37)
  q33: "developpement", q34: "developpement", q35: "developpement",
  q36: "developpement", q37: "developpement",
  // Motricité
  q36: "motricite", q37: "motricite",
  // Contexte (Q38–Q40)
  q38: "contexte", q39: "contexte", q40: "contexte",
};

/**
 * Calcule les scores par catégorie à partir des réponses QCM.
 * Une réponse autre que "a" vaut 1 point (indicateur de difficulté).
 * @param {Object} reponsesQCM — { [questionId]: "a"|"b"|"c"|"d" }
 * @returns {Object} scores — { [categorie]: number }
 */
function computeScores(reponsesQCM) {
  const scores = {};
  Object.entries(reponsesQCM).forEach(([qId, reponse]) => {
    const cat = QUESTION_CATEGORIES[qId.toLowerCase()];
    if (!cat) return;
    if (!scores[cat]) scores[cat] = 0;
    if (reponse && reponse !== "a") {
      scores[cat] += 1;
    }
  });
  return scores;
}

/**
 * Règles d'analyse EDA.
 * Chaque règle: { categorie, seuil, hypothese }
 */
const REGLES = [
  {
    categorie: "lecture",
    seuil: 3,
    hypothese: "Suspicion trouble lecture / dyslexie",
  },
  {
    categorie: "attention",
    seuil: 2,
    hypothese: "Hypothèse TDA/H",
  },
  {
    categorie: "motricite",
    seuil: 2,
    hypothese: "Hypothèse dyspraxie / TDC",
  },
  {
    categorie: "ecriture",
    seuil: 4,
    hypothese: "Suspicion trouble de l'écriture / dysgraphie",
  },
  {
    categorie: "maths",
    seuil: 4,
    hypothese: "Suspicion trouble du calcul / dyscalculie",
  },
  {
    categorie: "comportement",
    seuil: 4,
    hypothese: "Hypothèse trouble du comportement",
  },
  {
    categorie: "developpement",
    seuil: 3,
    hypothese: "Hypothèse trouble du développement",
  },
  {
    categorie: "contexte",
    seuil: 2,
    hypothese: "Facteurs contextuels à explorer (famille / environnement)",
  },
];

/**
 * analyseEDA — fonction principale
 * @param {Object} reponsesQCM — { [questionId]: "a"|"b"|"c"|"d" }
 * @returns {{ hypotheses: string[], scores: Object }}
 */
export function analyseEDA(reponsesQCM = {}) {
  const scores = computeScores(reponsesQCM);
  const hypotheses = [];

  REGLES.forEach(({ categorie, seuil, hypothese }) => {
    const score = scores[categorie] || 0;
    if (score >= seuil) {
      hypotheses.push(hypothese);
    }
  });

  return { hypotheses, scores };
}

/**
 * scoreCategorie — utilitaire pour accéder au score d'une catégorie
 * @param {Object} reponsesQCM
 * @param {string} categorie
 * @returns {number}
 */
export function scoreCategorie(reponsesQCM, categorie) {
  const scores = computeScores(reponsesQCM);
  return scores[categorie] || 0;
}