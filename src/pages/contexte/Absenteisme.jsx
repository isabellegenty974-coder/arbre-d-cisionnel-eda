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
          "Désengagement",
          "Contexte familial",
          "Anxiété scolaire",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Observations</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Fréquence",
          "Moments d'absence",
        ]}
      />
      <ActionButton label="Actions recommandées" to="/contexte/absenteisme/actions" />
    </ScreenLayout>
  );
}