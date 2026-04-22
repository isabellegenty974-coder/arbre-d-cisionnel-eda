import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function Calcul() {
  return (
    <ScreenLayout title="Calcul">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Automatisation faible",
          "Stress",
          "Erreurs d'inattention",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Observations</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Procédures utilisées",
          "Rapidité / précision",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Interventions</h2>
      <InfoList
        type="action"
        items={[
          "Entraînement progressif",
          "Jeux mathématiques",
          "Routines d'automatisation",
        ]}
      />
    </ScreenLayout>
  );
}