import ScreenLayout from "../../components/tree/ScreenLayout";
import NavCards from "../../components/tree/NavCards";

export default function LectureQuestions() {
  return (
    <ScreenLayout title="🔍 Questions diagnostiques – Lecture" subtitle="Choisissez la situation qui correspond à l'élève.">
      <NavCards
        items={[
          { label: "Q1 – Lecture lente, confusion graphèmes, fatigue", to: "/apprentissage/lecture/questions/q1" },
          { label: "Q2 – Saute des lignes, perd le suivi visuel", to: "/apprentissage/lecture/questions/q2" },
          { label: "Q3 – Comprend à l'oral, échoue en compréhension écrite", to: "/apprentissage/lecture/questions/q3" },
          { label: "Q4 – Inverse b/d/p/q après 8 ans", to: "/apprentissage/lecture/questions/q4" },
          { label: "Q5 – Lit vite mais fait beaucoup d'erreurs", to: "/apprentissage/lecture/questions/q5" },
        ]}
      />
    </ScreenLayout>
  );
}