import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function Changements() {
  return (
    <ScreenLayout title="Changements récents">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Déménagement, changement d'école",
          "Changement d'enseignant",
          "Arrivée d'un nouveau membre dans la famille",
          "Perte d'un proche",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Actions recommandées</h2>
      <InfoList
        type="action"
        items={[
          "Entretien famille : repérer les changements récents",
          "Entretien élève : expression du vécu",
          "Accompagnement temporaire renforcé",
          "Patience et bienveillance dans les attentes",
          "Réévaluation après une période d'adaptation",
        ]}
      />
    </ScreenLayout>
  );
}