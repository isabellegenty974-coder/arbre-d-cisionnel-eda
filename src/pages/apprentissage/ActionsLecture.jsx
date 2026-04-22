import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function ActionsLecture() {
  return (
    <ScreenLayout title="Actions recommandées – Lecture">
      <InfoList
        type="action"
        items={[
          "Observation fine en classe (fluidité, stratégies, erreurs)",
          "Entretien enseignant : pratiques, adaptations déjà tentées",
          "Entretien famille : histoire du langage, exposition à l'écrit",
          "Proposer des aménagements pédagogiques",
          "Envisager un bilan orthophonique si nécessaire",
          "Suivi RASED selon les besoins",
        ]}
      />
    </ScreenLayout>
  );
}