import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function ComportementQ28() {
  return (
    <ScreenLayout
      title="🌧️ Comportement – Question 28"
      subtitle="Un élève s'oppose systématiquement aux adultes."
    >
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Opposition", to: "/comportement/questions/q28/a" },
          { label: "TDAH", to: "/comportement/questions/q28/b" },
          { label: "Anxiété", to: "/comportement/questions/q28/c" },
          { label: "Immaturité", to: "/comportement/questions/q28/d" },
        ]}
      />
    </ScreenLayout>
  );
}