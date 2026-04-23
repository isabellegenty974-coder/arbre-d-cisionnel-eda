import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function EcritureQ16() {
  return (
    <ScreenLayout title="✍️ Écriture – Question 16" subtitle="Un élève écrit très lentement mais proprement.">
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Trouble du traitement de l'information", to: "/apprentissage/ecriture/questions/q16/a" },
          { label: "Dysgraphie", to: "/apprentissage/ecriture/questions/q16/b" },
          { label: "Anxiété", to: "/apprentissage/ecriture/questions/q16/c" },
          { label: "TDAH", to: "/apprentissage/ecriture/questions/q16/d" },
        ]}
      />
    </ScreenLayout>
  );
}