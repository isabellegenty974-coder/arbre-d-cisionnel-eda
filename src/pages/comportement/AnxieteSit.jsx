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
          "Anxiété de performance",
          "Pression scolaire",
          "Relations sociales",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Observations</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Déclencheurs",
          "Signes corporels",
        ]}
      />
      <ActionButton label="Actions recommandées" to="/comportement/anxiete/actions" />
    </ScreenLayout>
  );
}