import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function Graphisme() {
  return (
    <ScreenLayout title="Graphisme">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Observations psychologue</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Tension, lenteur, crispation",
          "Difficulté de tenue du crayon",
          "Fatigue motrice",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Trouble graphomoteur",
          "Manque d'entraînement",
          "Stress lié à la performance",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Interventions</h2>
      <InfoList
        type="action"
        items={[
          "Observation posture / installation",
          "Essais d'outils scripteurs",
          "Adaptations (lignes, temps)",
          "Orientation psychomotricité si besoin",
        ]}
      />
    </ScreenLayout>
  );
}