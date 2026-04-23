import ScreenLayout from "../../components/tree/ScreenLayout";
import NavCards from "../../components/tree/NavCards";

export default function Maths() {
  return (
    <ScreenLayout
      title="🔢 Mathématiques"
      subtitle="Quel domaine pose difficulté ?"
    >
      <NavCards
        items={[
          { label: "🔍 Questions diagnostiques", to: "/apprentissage/maths/questions" },
          { label: "🔢 Numération", to: "/apprentissage/maths/numeration" },
          { label: "🧮 Problèmes", to: "/apprentissage/maths/problemes" },
          { label: "➗ Calcul", to: "/apprentissage/maths/calcul" },
        ]}
      />
    </ScreenLayout>
  );
}