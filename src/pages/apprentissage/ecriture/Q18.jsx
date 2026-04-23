import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function EcritureQ18() {
  return (
    <ScreenLayout title="✍️ Écriture – Question 18" subtitle="Un élève a une écriture très grande et débordante.">
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Dyspraxie", to: "/apprentissage/ecriture/questions/q18/a" },
          { label: "TDAH", to: "/apprentissage/ecriture/questions/q18/b" },
          { label: "Dysgraphie", to: "/apprentissage/ecriture/questions/q18/c" },
          { label: "Stress", to: "/apprentissage/ecriture/questions/q18/d" },
        ]}
      />
    </ScreenLayout>
  );
}