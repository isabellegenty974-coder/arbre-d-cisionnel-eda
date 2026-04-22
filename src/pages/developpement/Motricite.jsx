import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function Motricite() {
  return (
    <ScreenLayout title="Motricité – Analyse">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Trouble développemental de la coordination (dyspraxie)",
          "Retard psychomoteur",
          "Manque de stimulation motrice",
          "Trouble neurologique (à explorer)",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Actions recommandées</h2>
      <InfoList
        type="action"
        items={[
          "Observation en situation motrice (EPS, graphisme)",
          "Entretien famille : développement moteur précoce",
          "Aménagements : outils adaptés, temps supplémentaire",
          "Envisager un bilan psychomoteur",
          "Coordination avec le médecin scolaire",
        ]}
      />
    </ScreenLayout>
  );
}