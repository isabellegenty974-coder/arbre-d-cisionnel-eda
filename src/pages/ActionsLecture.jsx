import ListPage from '@/components/ListPage';

export default function ActionsLecture() {
  const items = [
    "Observation fine en classe (fluidité, stratégies, erreurs)",
    "Entretien enseignant : pratiques, adaptations déjà tentées",
    "Entretien famille : histoire du langage, exposition à l'écrit",
    "Proposer des aménagements pédagogiques",
    "Envisager un bilan orthophonique si nécessaire",
    "Suivi RASED selon les besoins"
  ];

  return <ListPage title="Actions recommandées – Lecture" items={items} />;
}