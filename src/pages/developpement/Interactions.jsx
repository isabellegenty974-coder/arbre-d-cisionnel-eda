import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function Interactions() {
  return (
    <ScreenLayout title="Interactions sociales">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Isolement",
          "Conflits",
          "Manque de codes sociaux",
          "Anxiété sociale",
        ]}
      />
      <ActionButton label="Actions recommandées" to="/developpement/interactions/actions" />
    </ScreenLayout>
  );
}