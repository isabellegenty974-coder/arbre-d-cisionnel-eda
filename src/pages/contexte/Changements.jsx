import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function Changements() {
  return (
    <ScreenLayout title="🔄 Changements">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">📌 Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Déménagement",
          "Séparation",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">🔍 Observations</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Adaptation",
        ]}
      />
      <ActionButton label="Actions recommandées" to="/contexte/changements/actions" />
    </ScreenLayout>
  );
}