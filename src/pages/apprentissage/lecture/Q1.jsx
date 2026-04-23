import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function LectureQ1() {
  return (
    <ScreenLayout title="📘 Lecture – Question 1" subtitle="Un élève lit lentement, confond les graphèmes complexes et se fatigue rapidement.">
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Dyslexie développementale", to: "/apprentissage/lecture/questions/q1/a" },
          { label: "Manque d'entraînement", to: "/apprentissage/lecture/questions/q1/b" },
          { label: "Anxiété de performance", to: "/apprentissage/lecture/questions/q1/c" },
          { label: "Trouble attentionnel", to: "/apprentissage/lecture/questions/q1/d" },
        ]}
      />
    </ScreenLayout>
  );
}