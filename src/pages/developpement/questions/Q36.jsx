import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function DeveloppementQ36() {
  return (
    <ScreenLayout
      title="🧠 Développement – Question 36"
      subtitle="Un élève a du mal à planifier ses actions."
    >
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Dyspraxie / TDC", to: "/developpement/questions/q36/a" },
          { label: "TDAH", to: "/developpement/questions/q36/b" },
          { label: "Anxiété", to: "/developpement/questions/q36/c" },
          { label: "Immaturité", to: "/developpement/questions/q36/d" },
        ]}
      />
    </ScreenLayout>
  );
}