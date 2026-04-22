import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function AnxieteGen() {
  return (
    <ScreenLayout title="🌧️ Anxiété généralisée">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">📌 Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Stress chronique",
          "Hypersensibilité",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">🔍 Observations</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Impact apprentissages",
        ]}
      />
      <ActionButton label="Actions recommandées" to="/comportement/anxiete/actions" />
    </ScreenLayout>
  );
}