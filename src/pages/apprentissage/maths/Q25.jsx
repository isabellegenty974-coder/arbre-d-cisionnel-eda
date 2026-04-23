import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function MathsQ25() {
  return (
    <ScreenLayout
      title="🔢 Mathématiques – Question 25"
      subtitle="Un élève compte encore sur ses doigts en CM2."
    >
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Dyscalculie", to: "/apprentissage/maths/questions/q25/a" },
          { label: "Manque d'entraînement", to: "/apprentissage/maths/questions/q25/b" },
          { label: "TDAH", to: "/apprentissage/maths/questions/q25/c" },
          { label: "Stress", to: "/apprentissage/maths/questions/q25/d" },
        ]}
      />
    </ScreenLayout>
  );
}