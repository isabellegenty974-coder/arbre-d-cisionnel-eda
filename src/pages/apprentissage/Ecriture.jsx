import ScreenLayout from "../../components/tree/ScreenLayout";
import QuestionOptions from "../../components/tree/QuestionOptions";

export default function Ecriture() {
  return (
    <ScreenLayout title="Écriture – Analyse">
      <QuestionOptions
        question="Les difficultés concernent-elles le geste graphique ou la production écrite ?"
        options={[
          { label: "Geste graphique", to: "/apprentissage/ecriture/geste" },
          { label: "Production écrite", to: "/apprentissage/ecriture/production" },
        ]}
      />
    </ScreenLayout>
  );
}