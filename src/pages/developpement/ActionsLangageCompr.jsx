import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function ActionsLangageCompr() {
  return (
    <ScreenLayout title="Actions recommandées – Compréhension">
      <InfoList
        type="action"
        items={[
          "Simplification",
          "Supports visuels",
          "Vérification compréhension",
        ]}
      />
    </ScreenLayout>
  );
}