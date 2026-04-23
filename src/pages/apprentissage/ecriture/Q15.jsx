import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function EcritureQ15() {
  return (
    <ScreenLayout title="✍️ Écriture – Question 15" subtitle="Un élève a un bon oral mais une orthographe très faible.">
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Dysorthographie", to: "/apprentissage/ecriture/questions/q15/a" },
          { label: "Trouble visuel", to: "/apprentissage/ecriture/questions/q15/b" },
          { label: "TDAH", to: "/apprentissage/ecriture/questions/q15/c" },
          { label: "Stress", to: "/apprentissage/ecriture/questions/q15/d" },
        ]}
      />
    </ScreenLayout>
  );
}