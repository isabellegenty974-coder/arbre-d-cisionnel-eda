import ListPage from '@/components/ListPage';

export default function ActionsAnxiete() {
  const items = [
    "Entretien élève : repérage des déclencheurs",
    "Entretien famille : contexte, événements récents",
    "Proposer des stratégies d'apaisement en classe",
    "Aménagements pédagogiques (prévisibilité, consignes claires)",
    "Orientation vers un professionnel si nécessaire"
  ];

  return <ListPage title="Actions recommandées – Anxiété" items={items} />;
}