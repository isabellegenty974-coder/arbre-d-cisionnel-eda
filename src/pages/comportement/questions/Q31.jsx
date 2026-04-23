import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function ComportementQ31() {
  return (
    <ScreenLayout
      title="🌧️ Comportement – Question 31"
      subtitle="Un élève semble absent, rêveur, lent."
    >
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "TDAH inattentif", to: "/comportement/questions/q31/a" },
          { label: "Anxiété", to: "/comportement/questions/q31/b" },
          { label: "Dépression infantile", to: "/comportement/questions/q31/c" },
          { label: "Immaturité", to: "/comportement/questions/q31/d" },
        ]}
      />
    </ScreenLayout>
  );
}