import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function GlobalApprentissage() {
  return (
    <ScreenLayout title="Difficultés globales d'apprentissage">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Déficience intellectuelle (hypothèse à explorer)",
          "Retard global de développement",
          "Facteurs environnementaux (manque de stimulation)",
          "Trouble attentionnel impactant les apprentissages",
          "Facteurs émotionnels ou traumatiques",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Actions recommandées</h2>
      <InfoList
        type="action"
        items={[
          "Évaluation psychométrique (WISC, etc.)",
          "Entretien approfondi avec la famille",
          "Coordination avec le médecin scolaire",
          "Aménagements pédagogiques différenciés",
          "Orientation MDPH si nécessaire",
        ]}
      />
    </ScreenLayout>
  );
}