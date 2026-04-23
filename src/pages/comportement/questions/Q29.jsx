import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function ComportementQ29() {
  return (
    <ScreenLayout
      title="🌧️ Comportement – Question 29"
      subtitle="Un élève pleure avant les évaluations."
    >
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Anxiété de performance", to: "/comportement/questions/q29/a" },
          { label: "Stress", to: "/comportement/questions/q29/b" },
          { label: "TDAH", to: "/comportement/questions/q29/c" },
          { label: "Dyslexie", to: "/comportement/questions/q29/d" },
        ]}
      />
    </ScreenLayout>
  );
}