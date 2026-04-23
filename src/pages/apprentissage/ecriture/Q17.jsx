import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function EcritureQ17() {
  return (
    <ScreenLayout title="✍️ Écriture – Question 17" subtitle="Un élève a une écriture très petite et serrée.">
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Anxiété", to: "/apprentissage/ecriture/questions/q17/a" },
          { label: "Dysgraphie", to: "/apprentissage/ecriture/questions/q17/b" },
          { label: "TDAH", to: "/apprentissage/ecriture/questions/q17/c" },
          { label: "Trouble visuel", to: "/apprentissage/ecriture/questions/q17/d" },
        ]}
      />
    </ScreenLayout>
  );
}