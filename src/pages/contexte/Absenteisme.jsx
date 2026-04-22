import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function Absenteisme() {
  return (
    <ScreenLayout title="Absentéisme">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Fatigue",
          "Désengagement",
          "Contexte familial",
          "Anxiété scolaire",
        ]}
      />
      <ActionButton label="Actions recommandées" to="/contexte/absenteisme/actions" />
    </ScreenLayout>
  );
}