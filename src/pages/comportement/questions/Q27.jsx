import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function ComportementQ27() {
  return (
    <ScreenLayout
      title="🌧️ Comportement – Question 27"
      subtitle="Un élève est impulsif, coupe la parole, agit sans réfléchir."
    >
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "TDAH", to: "/comportement/questions/q27/a" },
          { label: "Opposition", to: "/comportement/questions/q27/b" },
          { label: "Anxiété", to: "/comportement/questions/q27/c" },
          { label: "Immaturité", to: "/comportement/questions/q27/d" },
        ]}
      />
    </ScreenLayout>
  );
}