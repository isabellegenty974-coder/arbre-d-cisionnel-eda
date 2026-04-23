import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function MathsQ22() {
  return (
    <ScreenLayout
      title="🔢 Mathématiques – Question 22"
      subtitle="Un élève ne comprend pas les problèmes écrits."
    >
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Trouble du langage oral", to: "/apprentissage/maths/questions/q22/a" },
          { label: "Dyscalculie", to: "/apprentissage/maths/questions/q22/b" },
          { label: "TDAH", to: "/apprentissage/maths/questions/q22/c" },
          { label: "Stress", to: "/apprentissage/maths/questions/q22/d" },
        ]}
      />
    </ScreenLayout>
  );
}