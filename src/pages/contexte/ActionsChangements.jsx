import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function ActionsChangements() {
  return (
    <ScreenLayout title="Actions recommandées – Changements">
      <InfoList
        type="action"
        items={[
          "Entretien famille",
          "Temps d'adaptation",
          "Soutien émotionnel",
        ]}
      />
    </ScreenLayout>
  );
}