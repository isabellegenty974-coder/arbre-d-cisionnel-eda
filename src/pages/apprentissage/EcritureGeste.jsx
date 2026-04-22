import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function EcritureGeste() {
  return (
    <ScreenLayout title="Geste graphique – Pistes">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Difficultés de motricité fine",
          "Trouble de la coordination (hypothèse à explorer)",
          "Manque de pratique ou d'entraînement",
          "Tension corporelle liée au stress",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Actions</h2>
      <InfoList
        type="action"
        items={[
          "Observer la posture et la tenue du crayon",
          "Proposer des exercices de motricité fine",
          "Envisager un bilan psychomoteur si persistance",
          "Aménagements : lignages adaptés, outils ergonomiques",
        ]}
      />
    </ScreenLayout>
  );
}