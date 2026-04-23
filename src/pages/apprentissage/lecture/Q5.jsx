import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function LectureQ5() {
  return (
    <ScreenLayout title="📘 Lecture – Question 5" subtitle="Un élève lit vite mais fait beaucoup d'erreurs.">
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Dyslexie", to: "/apprentissage/lecture/questions/q5/a" },
          { label: "TDAH", to: "/apprentissage/lecture/questions/q5/b" },
          { label: "Anxiété", to: "/apprentissage/lecture/questions/q5/c" },
          { label: "Manque d'entraînement", to: "/apprentissage/lecture/questions/q5/d" },
        ]}
      />
    </ScreenLayout>
  );
}