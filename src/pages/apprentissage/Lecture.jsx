import ScreenLayout from "../../components/tree/ScreenLayout";
import QuestionOptions from "../../components/tree/QuestionOptions";

export default function Lecture() {
  return (
    <ScreenLayout title="Lecture – Analyse">
      <QuestionOptions
        question="Les difficultés sont-elles récentes ou installées ?"
        options={[
          { label: "Récentes", to: "/apprentissage/lecture/recente" },
          { label: "Installées", to: "/apprentissage/lecture/installee" },
        ]}
      />
    </ScreenLayout>
  );
}