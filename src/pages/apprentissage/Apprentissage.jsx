import ScreenLayout from "../../components/tree/ScreenLayout";
import NavCards from "../../components/tree/NavCards";

export default function Apprentissage() {
  const lectureQuestions = [
    { label: "Q1 – Lecture lente, confusion graphèmes, fatigue", to: "/apprentissage/lecture/questions/q1" },
    { label: "Q2 – Saute des lignes, perd le suivi visuel", to: "/apprentissage/lecture/questions/q2" },
    { label: "Q3 – Comprend à l'oral, échoue en compréhension écrite", to: "/apprentissage/lecture/questions/q3" },
    { label: "Q4 – Inverse b/d/p/q après 8 ans", to: "/apprentissage/lecture/questions/q4" },
    { label: "Q5 – Lit vite mais fait beaucoup d'erreurs", to: "/apprentissage/lecture/questions/q5" },
  ];

  const ecritureQuestions = [
    { label: "Q11 – Écrit avec tension, lenteur et douleur", to: "/apprentissage/ecriture/questions/q11" },
    { label: "Q12 – Écriture illisible et irrégulière", to: "/apprentissage/ecriture/questions/q12" },
    { label: "Q13 – Refuse d'écrire car « ça fait mal »", to: "/apprentissage/ecriture/questions/q13" },
    { label: "Q14 – Beaucoup d'erreurs phonologiques à l'écrit", to: "/apprentissage/ecriture/questions/q14" },
    { label: "Q15 – Bon oral mais orthographe très faible", to: "/apprentissage/ecriture/questions/q15" },
    { label: "Q16 – Écrit très lentement mais proprement", to: "/apprentissage/ecriture/questions/q16" },
    { label: "Q17 – Écriture très petite et serrée", to: "/apprentissage/ecriture/questions/q17" },
    { label: "Q18 – Écriture très grande et débordante", to: "/apprentissage/ecriture/questions/q18" },
  ];

  const mathsQuestions = [
    { label: "Q19 – Sens du nombre", to: "/apprentissage/maths/questions/q19" },
    { label: "Q20 – Calcul mental vs raisonnement", to: "/apprentissage/maths/questions/q20" },
    { label: "Q21 – Panique en mathématiques", to: "/apprentissage/maths/questions/q21" },
    { label: "Q22 – Problèmes écrits", to: "/apprentissage/maths/questions/q22" },
    { label: "Q23 – Confusion des signes", to: "/apprentissage/maths/questions/q23" },
    { label: "Q24 – Manipulation vs abstraction", to: "/apprentissage/maths/questions/q24" },
    { label: "Q25 – Compte sur les doigts en CM2", to: "/apprentissage/maths/questions/q25" },
  ];

  return (
    <ScreenLayout title="📘 Difficultés d'apprentissage">
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Lecture</h2>
          <NavCards items={lectureQuestions} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Écriture</h2>
          <NavCards items={ecritureQuestions} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Mathématiques</h2>
          <NavCards items={mathsQuestions} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Autres</h2>
          <NavCards items={[{ label: "Difficultés globales", to: "/apprentissage/global" }]} />
        </div>
      </div>
    </ScreenLayout>
  );
}