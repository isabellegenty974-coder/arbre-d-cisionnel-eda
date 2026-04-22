import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function AnxieteGen() {
  return (
    <ScreenLayout title="Anxiété généralisée – Hypothèses">
      <InfoList
        type="hypothesis"
        items={[
          "Anxiété de performance",
          "Anxiété sociale",
          "Stress lié à un événement extérieur",
          "Hypersensibilité émotionnelle",
        ]}
      />
      <ActionButton label="Actions recommandées" to="/comportement/anxiete/actions" />
    </ScreenLayout>
  );
}