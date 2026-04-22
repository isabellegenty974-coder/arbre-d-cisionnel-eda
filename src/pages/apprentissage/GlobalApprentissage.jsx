import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function GlobalApprentissage() {
  return (
    <ScreenLayout title="Difficultés globales">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Décalage développemental",
          "Fatigue chronique",
          "Contexte familial impactant",
          "Manque de repères scolaires",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Observations</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Variabilité",
          "Engagement en classe",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Interventions</h2>
      <InfoList
        type="action"
        items={[
          "Entretien famille",
          "Observation globale",
          "Adaptations transversales",
          "Suivi RASED",
        ]}
      />
    </ScreenLayout>
  );
}