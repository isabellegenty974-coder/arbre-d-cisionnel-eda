import ActionsPage from "@/components/tree/ActionsPage";

const ITEMS = [
  "Observation fine en classe (fluidité, stratégies, erreurs)",
  "Entretien enseignant : pratiques, adaptations déjà tentées",
  "Entretien famille : histoire du langage, exposition à l'écrit",
  "Proposer des aménagements pédagogiques",
  "Envisager un bilan orthophonique si nécessaire",
  "Suivi RASED selon les besoins",
];

export default function ActionsLecture() {
  return (
    <ActionsPage
      title="Actions recommandées – Lecture"
      domaine="apprentissage"
      sousDomaine="lecture"
      items={ITEMS}
    />
  );
}