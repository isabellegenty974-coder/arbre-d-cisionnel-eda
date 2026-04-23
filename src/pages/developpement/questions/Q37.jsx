import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function DeveloppementQ37() {
  return (
    <ScreenLayout
      title="🧠 Développement – Question 37"
      subtitle="Un élève a une attention très fluctuante."
    >
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "TDAH", to: "/developpement/questions/q37/a" },
          { label: "Anxiété", to: "/developpement/questions/q37/b" },
          { label: "Immaturité", to: "/developpement/questions/q37/c" },
          { label: "Stress", to: "/developpement/questions/q37/d" },
        ]}
      />
    </ScreenLayout>
  );
}