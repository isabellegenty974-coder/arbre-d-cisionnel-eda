import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function ContexteQ38() {
  return (
    <ScreenLayout
      title="🏠 Contexte – Question 38"
      subtitle="Un élève régresse après un événement familial."
    >
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Stress post-événement", to: "/contexte/questions/q38/a" },
          { label: "Anxiété", to: "/contexte/questions/q38/b" },
          { label: "TDAH", to: "/contexte/questions/q38/c" },
          { label: "Opposition", to: "/contexte/questions/q38/d" },
        ]}
      />
    </ScreenLayout>
  );
}