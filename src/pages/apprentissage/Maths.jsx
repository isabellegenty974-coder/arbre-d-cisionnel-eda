import ScreenLayout from "../../components/tree/ScreenLayout";
import QuestionOptions from "../../components/tree/QuestionOptions";

export default function Maths() {
  return (
    <ScreenLayout
      title="Mathématiques"
      subtitle="Quel domaine pose difficulté ?"
    >
      <QuestionOptions
        question="Quel domaine pose difficulté ?"
        options={[
          { label: "Numération", to: "/apprentissage/maths/numeration" },
          { label: "Résolution de problèmes", to: "/apprentissage/maths/problemes" },
          { label: "Calcul", to: "/apprentissage/maths/calcul" },
        ]}
      />
    </ScreenLayout>
  );
}