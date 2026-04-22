import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function ActionsAbsenteisme() {
  return (
    <ScreenLayout title="Actions recommandées – Absentéisme">
      <InfoList
        type="action"
        items={[
          "Échanges famille",
          "Plan de reprise",
          "Suivi",
          "Coordination équipe",
        ]}
      />
    </ScreenLayout>
  );
}