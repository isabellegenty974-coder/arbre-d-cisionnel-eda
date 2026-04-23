import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function ComportementQ32() {
  return (
    <ScreenLayout
      title="🌧️ Comportement – Question 32"
      subtitle="Un élève a des comportements agressifs envers les pairs."
    >
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Opposition", to: "/comportement/questions/q32/a" },
          { label: "Anxiété", to: "/comportement/questions/q32/b" },
          { label: "TDAH", to: "/comportement/questions/q32/c" },
          { label: "Stress", to: "/comportement/questions/q32/d" },
        ]}
      />
    </ScreenLayout>
  );
}