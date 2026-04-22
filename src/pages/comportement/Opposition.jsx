import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function Opposition() {
  return (
    <ScreenLayout title="Opposition">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Frustration",
          "Besoin de contrôle",
          "Conflits relationnels",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Observations</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Déclencheurs",
          "Modes d'entrée en conflit",
        ]}
      />
      <ActionButton label="Actions recommandées" to="/comportement/opposition/actions" />
    </ScreenLayout>
  );
}