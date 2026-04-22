import ScreenLayout from "../../components/tree/ScreenLayout";
import NavCards from "../../components/tree/NavCards";

export default function Contexte() {
  return (
    <ScreenLayout title="Facteurs contextuels / environnementaux">
      <NavCards
        items={[
          { label: "Événement familial", to: "/contexte/famille" },
          { label: "Climat de classe", to: "/contexte/climat-classe" },
          { label: "Changements récents", to: "/contexte/changements" },
          { label: "Absentéisme", to: "/contexte/absenteisme" },
        ]}
      />
    </ScreenLayout>
  );
}