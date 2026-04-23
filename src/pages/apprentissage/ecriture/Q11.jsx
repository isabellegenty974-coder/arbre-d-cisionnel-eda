import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function EcritureQ11() {
  return (
    <ScreenLayout title="✍️ Écriture – Question 11" subtitle="Un élève écrit avec tension, lenteur et douleur.">
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Dysgraphie", to: "/apprentissage/ecriture/questions/q11/a" },
          { label: "Anxiété", to: "/apprentissage/ecriture/questions/q11/b" },
          { label: "Manque d'entraînement", to: "/apprentissage/ecriture/questions/q11/c" },
          { label: "Trouble visuel", to: "/apprentissage/ecriture/questions/q11/d" },
        ]}
      />
    </ScreenLayout>
  );
}