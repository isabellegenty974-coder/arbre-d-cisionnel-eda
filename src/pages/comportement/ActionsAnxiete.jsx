import ActionsPage from "@/components/tree/ActionsPage";

const ITEMS = [
  "Entretien élève : repérage des déclencheurs",
  "Entretien famille : contexte, événements récents",
  "Proposer des stratégies d'apaisement en classe",
  "Aménagements pédagogiques (prévisibilité, consignes claires)",
  "Orientation vers un professionnel si nécessaire",
];

export default function ActionsAnxiete() {
  return (
    <ActionsPage
      title="Actions recommandées – Anxiété"
      domaine="comportement"
      sousDomaine="anxiété"
      items={ITEMS}
    />
  );
}