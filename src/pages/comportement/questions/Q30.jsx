import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function ComportementQ30() {
  return (
    <ScreenLayout
      title="🌧️ Comportement – Question 30"
      subtitle="Un élève a des colères soudaines sans raison apparente."
    >
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Hypersensibilité émotionnelle", to: "/comportement/questions/q30/a" },
          { label: "TDAH", to: "/comportement/questions/q30/b" },
          { label: "Opposition", to: "/comportement/questions/q30/c" },
          { label: "Stress", to: "/comportement/questions/q30/d" },
        ]}
      />
    </ScreenLayout>
  );
}