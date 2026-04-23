import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function LectureQ2() {
  return (
    <ScreenLayout title="📘 Lecture – Question 2" subtitle="Un élève saute des lignes, perd le suivi visuel et se plaint de fatigue oculaire.">
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Trouble attentionnel", to: "/apprentissage/lecture/questions/q2/a" },
          { label: "Trouble visuo-attentionnel", to: "/apprentissage/lecture/questions/q2/b" },
          { label: "Trouble du langage oral", to: "/apprentissage/lecture/questions/q2/c" },
          { label: "Stress", to: "/apprentissage/lecture/questions/q2/d" },
        ]}
      />
    </ScreenLayout>
  );
}