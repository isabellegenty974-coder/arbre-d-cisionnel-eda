import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function EcritureQ14() {
  return (
    <ScreenLayout title="✍️ Écriture – Question 14" subtitle="Un élève fait beaucoup d'erreurs phonologiques à l'écrit.">
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Dysorthographie", to: "/apprentissage/ecriture/questions/q14/a" },
          { label: "Dyslexie", to: "/apprentissage/ecriture/questions/q14/b" },
          { label: "TDAH", to: "/apprentissage/ecriture/questions/q14/c" },
          { label: "Stress", to: "/apprentissage/ecriture/questions/q14/d" },
        ]}
      />
    </ScreenLayout>
  );
}