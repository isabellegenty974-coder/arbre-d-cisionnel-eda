import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function ContexteQ40() {
  return (
    <ScreenLayout
      title="🏠 Contexte – Question 40"
      subtitle="Un élève a un absentéisme croissant."
    >
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Anxiété scolaire", to: "/contexte/questions/q40/a" },
          { label: "Désengagement", to: "/contexte/questions/q40/b" },
          { label: "Conflit familial", to: "/contexte/questions/q40/c" },
          { label: "TDAH", to: "/contexte/questions/q40/d" },
        ]}
      />
    </ScreenLayout>
  );
}