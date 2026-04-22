import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function ActionsAnxiete() {
  return (
    <ScreenLayout title="Actions recommandées – Anxiété">
      <InfoList
        type="action"
        items={[
          "Entretien élève : repérage des déclencheurs",
          "Entretien famille : contexte, événements récents",
          "Proposer des stratégies d'apaisement en classe",
          "Aménagements pédagogiques (prévisibilité, consignes claires)",
          "Orientation vers un professionnel si nécessaire",
        ]}
      />
    </ScreenLayout>
  );
}