import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function ActionsMotricite() {
  return (
    <ScreenLayout title="Actions recommandées – Motricité">
      <InfoList
        type="action"
        items={[
          "Observation",
          "Adaptations",
          "Orientation psychomotricité",
        ]}
      />
    </ScreenLayout>
  );
}