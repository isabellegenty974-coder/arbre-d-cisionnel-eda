import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function EcritureQ12() {
  return (
    <ScreenLayout title="✍️ Écriture – Question 12" subtitle="Un élève a une écriture illisible et irrégulière.">
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Dyspraxie", to: "/apprentissage/ecriture/questions/q12/a" },
          { label: "TDAH", to: "/apprentissage/ecriture/questions/q12/b" },
          { label: "Dysgraphie", to: "/apprentissage/ecriture/questions/q12/c" },
          { label: "Stress", to: "/apprentissage/ecriture/questions/q12/d" },
        ]}
      />
    </ScreenLayout>
  );
}