import ScreenLayout from "../../../components/tree/ScreenLayout";
import NavCards from "../../../components/tree/NavCards";

export default function ContexteQuestions() {
  return (
    <ScreenLayout
      title="🏠 Questions diagnostiques – Contexte"
      subtitle="Sélectionnez la situation observée"
    >
      <NavCards
        items={[
          { label: "Q38 – Régression après événement familial", to: "/contexte/questions/q38" },
          { label: "Q39 – Perturbé par le bruit", to: "/contexte/questions/q39" },
          { label: "Q40 – Absentéisme croissant", to: "/contexte/questions/q40" },
        ]}
      />
    </ScreenLayout>
  );
}