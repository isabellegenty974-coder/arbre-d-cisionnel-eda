import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function Graphisme() {
  return (
    <ScreenLayout title="Graphisme">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Lenteur",
          "Tension",
          "Dysgraphie possible",
          "Fatigue motrice",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Actions</h2>
      <InfoList
        type="action"
        items={[
          "Observation posture",
          "Entretien famille",
          "Adaptations (lignes, outils)",
          "Orientation psychomotricité",
        ]}
      />
    </ScreenLayout>
  );
}