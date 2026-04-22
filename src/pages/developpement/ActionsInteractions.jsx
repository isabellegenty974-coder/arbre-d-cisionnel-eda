import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function ActionsInteractions() {
  return (
    <ScreenLayout title="Actions recommandées – Interactions sociales">
      <InfoList
        type="action"
        items={[
          "Jeux coopératifs",
          "Médiation",
          "Observation cour",
          "Échanges famille",
        ]}
      />
    </ScreenLayout>
  );
}