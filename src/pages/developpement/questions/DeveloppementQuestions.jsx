import ScreenLayout from "../../../components/tree/ScreenLayout";
import NavCards from "../../../components/tree/NavCards";

export default function DeveloppementQuestions() {
  return (
    <ScreenLayout
      title="🧠 Questions diagnostiques – Développement"
      subtitle="Sélectionnez la situation observée"
    >
      <NavCards
        items={[
          { label: "Q33 – Langage oral pauvre", to: "/developpement/questions/q33" },
          { label: "Q34 – Articulation floue", to: "/developpement/questions/q34" },
          { label: "Q35 – Motricité fine", to: "/developpement/questions/q35" },
          { label: "Q36 – Planification des actions", to: "/developpement/questions/q36" },
          { label: "Q37 – Attention fluctuante", to: "/developpement/questions/q37" },
        ]}
      />
    </ScreenLayout>
  );
}