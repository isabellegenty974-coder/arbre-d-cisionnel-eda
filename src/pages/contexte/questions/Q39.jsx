import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function ContexteQ39() {
  return (
    <ScreenLayout
      title="🏠 Contexte – Question 39"
      subtitle="Un élève est perturbé par le bruit de la classe."
    >
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Hypersensibilité sensorielle", to: "/contexte/questions/q39/a" },
          { label: "Anxiété", to: "/contexte/questions/q39/b" },
          { label: "TDAH", to: "/contexte/questions/q39/c" },
          { label: "Stress", to: "/contexte/questions/q39/d" },
        ]}
      />
    </ScreenLayout>
  );
}