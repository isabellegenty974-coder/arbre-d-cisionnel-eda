import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function DeveloppementQ35() {
  return (
    <ScreenLayout
      title="🧠 Développement – Question 35"
      subtitle="Un élève a des difficultés massives en motricité fine."
    >
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Dyspraxie / TDC", to: "/developpement/questions/q35/a" },
          { label: "TDAH", to: "/developpement/questions/q35/b" },
          { label: "Immaturité", to: "/developpement/questions/q35/c" },
          { label: "Stress", to: "/developpement/questions/q35/d" },
        ]}
      />
    </ScreenLayout>
  );
}