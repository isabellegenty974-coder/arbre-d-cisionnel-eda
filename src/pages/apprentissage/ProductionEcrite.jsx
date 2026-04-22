import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function ProductionEcrite() {
  return (
    <ScreenLayout title="Production écrite">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Difficulté à organiser la pensée",
          "Manque de vocabulaire",
          "Anxiété",
          "Lenteur cognitive",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Observations</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Structure du texte",
          "Cohérence",
          "Stratégies d'écriture",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Interventions</h2>
      <InfoList
        type="action"
        items={[
          "Plans, guidage",
          "Aides visuelles",
          "Étayage progressif",
          "Temps supplémentaire",
        ]}
      />
    </ScreenLayout>
  );
}