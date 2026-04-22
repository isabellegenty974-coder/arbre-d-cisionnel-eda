import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function EcritureProduction() {
  return (
    <ScreenLayout title="Production écrite – Pistes">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Difficultés de structuration de la pensée",
          "Pauvreté du vocabulaire",
          "Trouble du langage écrit",
          "Manque de confiance en soi",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Actions</h2>
      <InfoList
        type="action"
        items={[
          "Proposer des supports visuels pour la planification",
          "Travailler le vocabulaire en contexte",
          "Entretien enseignant : attentes et adaptations",
          "Envisager un bilan orthophonique si nécessaire",
        ]}
      />
    </ScreenLayout>
  );
}