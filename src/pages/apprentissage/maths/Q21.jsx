import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function MathsQ21() {
  return (
    <ScreenLayout
      title="🔢 Mathématiques – Question 21"
      subtitle="Un élève panique en mathématiques."
    >
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Anxiété mathématique", to: "/apprentissage/maths/questions/q21/a" },
          { label: "Dyscalculie", to: "/apprentissage/maths/questions/q21/b" },
          { label: "TDAH", to: "/apprentissage/maths/questions/q21/c" },
          { label: "Opposition", to: "/apprentissage/maths/questions/q21/d" },
        ]}
      />
    </ScreenLayout>
  );
}