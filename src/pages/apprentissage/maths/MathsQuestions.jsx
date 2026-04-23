import ScreenLayout from "../../../components/tree/ScreenLayout";
import NavCards from "../../../components/tree/NavCards";

export default function MathsQuestions() {
  return (
    <ScreenLayout
      title="🔢 Questions diagnostiques – Maths"
      subtitle="Sélectionnez la situation observée chez l'élève."
    >
      <NavCards
        items={[
          { label: "Q19 – Sens du nombre", to: "/apprentissage/maths/questions/q19" },
          { label: "Q20 – Calcul mental vs raisonnement", to: "/apprentissage/maths/questions/q20" },
          { label: "Q21 – Panique en mathématiques", to: "/apprentissage/maths/questions/q21" },
          { label: "Q22 – Problèmes écrits", to: "/apprentissage/maths/questions/q22" },
          { label: "Q23 – Confusion des signes", to: "/apprentissage/maths/questions/q23" },
          { label: "Q24 – Manipulation vs abstraction", to: "/apprentissage/maths/questions/q24" },
          { label: "Q25 – Compte sur les doigts en CM2", to: "/apprentissage/maths/questions/q25" },
        ]}
      />
    </ScreenLayout>
  );
}