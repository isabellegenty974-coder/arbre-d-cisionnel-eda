import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function MathsQ24() {
  return (
    <ScreenLayout
      title="🔢 Mathématiques – Question 24"
      subtitle="Un élève réussit les manipulations mais échoue en abstraction."
    >
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Trouble du raisonnement", to: "/apprentissage/maths/questions/q24/a" },
          { label: "Dyscalculie", to: "/apprentissage/maths/questions/q24/b" },
          { label: "TDAH", to: "/apprentissage/maths/questions/q24/c" },
          { label: "Stress", to: "/apprentissage/maths/questions/q24/d" },
        ]}
      />
    </ScreenLayout>
  );
}