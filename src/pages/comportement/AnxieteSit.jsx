import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function AnxieteSit() {
  return (
    <ScreenLayout title="Anxiété situationnelle">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Évaluations",
          "Relations sociales",
          "Changements",
          "Pression scolaire",
        ]}
      />
      <ActionButton label="Actions recommandées" to="/comportement/anxiete/actions" />
    </ScreenLayout>
  );
}