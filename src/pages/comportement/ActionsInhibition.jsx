import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function ActionsInhibition() {
  return (
    <ScreenLayout title="Actions recommandées – Inhibition">
      <InfoList
        type="action"
        items={[
          "Encouragements",
          "Sécurisation",
          "Prévisibilité",
          "Travail émotionnel",
        ]}
      />
    </ScreenLayout>
  );
}