import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function ComportementQ26() {
  return (
    <ScreenLayout
      title="🌧️ Comportement – Question 26"
      subtitle="Un élève est très inhibé, parle peu, évite le regard."
    >
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Anxiété", to: "/comportement/questions/q26/a" },
          { label: "Immaturité", to: "/comportement/questions/q26/b" },
          { label: "TDAH inattentif", to: "/comportement/questions/q26/c" },
          { label: "Opposition passive", to: "/comportement/questions/q26/d" },
        ]}
      />
    </ScreenLayout>
  );
}