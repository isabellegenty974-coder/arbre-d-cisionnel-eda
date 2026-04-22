import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function Problemes() {
  return (
    <ScreenLayout title="Problèmes">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Difficulté de compréhension",
          "Représentation mentale faible",
          "Impulsivité",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Observations</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Lecture du problème",
          "Stratégies de résolution",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Interventions</h2>
      <InfoList
        type="action"
        items={[
          "Schématisation",
          "Étapes guidées",
          "Verbalisation",
          "Travail métacognitif",
        ]}
      />
    </ScreenLayout>
  );
}