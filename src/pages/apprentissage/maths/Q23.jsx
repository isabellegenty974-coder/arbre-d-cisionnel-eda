import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function MathsQ23() {
  return (
    <ScreenLayout
      title="🔢 Mathématiques – Question 23"
      subtitle="Un élève confond les signes +, –, ×."
    >
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Dyscalculie", to: "/apprentissage/maths/questions/q23/a" },
          { label: "TDAH", to: "/apprentissage/maths/questions/q23/b" },
          { label: "Trouble visuel", to: "/apprentissage/maths/questions/q23/c" },
          { label: "Stress", to: "/apprentissage/maths/questions/q23/d" },
        ]}
      />
    </ScreenLayout>
  );
}