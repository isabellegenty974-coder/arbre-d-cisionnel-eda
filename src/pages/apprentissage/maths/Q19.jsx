import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function MathsQ19() {
  return (
    <ScreenLayout
      title="🔢 Mathématiques – Question 19"
      subtitle="Un élève ne comprend pas le sens du nombre."
    >
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Dyscalculie", to: "/apprentissage/maths/questions/q19/a" },
          { label: "TDAH", to: "/apprentissage/maths/questions/q19/b" },
          { label: "Manque d'entraînement", to: "/apprentissage/maths/questions/q19/c" },
          { label: "Stress", to: "/apprentissage/maths/questions/q19/d" },
        ]}
      />
    </ScreenLayout>
  );
}