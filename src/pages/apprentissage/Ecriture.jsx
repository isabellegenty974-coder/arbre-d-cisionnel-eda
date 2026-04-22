import ScreenLayout from "../../components/tree/ScreenLayout";
import QuestionOptions from "../../components/tree/QuestionOptions";

export default function Ecriture() {
  return (
    <ScreenLayout
      title="Écriture"
      subtitle="Quel type de difficulté est observé ?"
    >
      <QuestionOptions
        question="Quel type de difficulté est observé ?"
        options={[
          { label: "Graphisme", to: "/apprentissage/ecriture/graphisme" },
          { label: "Orthographe", to: "/apprentissage/ecriture/orthographe" },
          { label: "Production écrite", to: "/apprentissage/ecriture/production" },
        ]}
      />
    </ScreenLayout>
  );
}