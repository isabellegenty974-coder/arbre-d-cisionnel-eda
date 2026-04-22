import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function ActionsOpposition() {
  return (
    <ScreenLayout title="Actions recommandées – Opposition">
      <InfoList
        type="action"
        items={[
          "Cadre clair",
          "Rituels",
          "Médiation",
          "Échanges famille",
        ]}
      />
    </ScreenLayout>
  );
}