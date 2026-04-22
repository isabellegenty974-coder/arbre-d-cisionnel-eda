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
          "Incompréhensions",
          "Conflits relationnels",
        ]}
      />
      <ActionButton label="Actions recommandées" to="/comportement/opposition/actions" />
    </ScreenLayout>
  );
}