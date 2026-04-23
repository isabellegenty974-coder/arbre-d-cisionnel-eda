import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function MathsQ20() {
  return (
    <ScreenLayout
      title="🔢 Mathématiques – Question 20"
      subtitle="Un élève échoue en calcul mental mais réussit en raisonnement."
    >
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Dyscalculie", to: "/apprentissage/maths/questions/q20/a" },
          { label: "TDAH", to: "/apprentissage/maths/questions/q20/b" },
          { label: "Anxiété", to: "/apprentissage/maths/questions/q20/c" },
          { label: "Manque d'entraînement", to: "/apprentissage/maths/questions/q20/d" },
        ]}
      />
    </ScreenLayout>
  );
}