import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function LectureRecente() {
  return (
    <ScreenLayout title="Lecture – Difficulté récente">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Repères psychologue</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Vérifier fatigue, anxiété, événements récents",
          "Observer la fluidité, les stratégies, la posture",
          "Examiner les variations selon les contextes",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Entretiens</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Enseignant : changements, climat, attentes",
          "Famille : sommeil, stress, transitions",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Interventions possibles</h2>
      <InfoList
        type="action"
        items={[
          "Adaptations temporaires",
          "Lecture accompagnée",
          "Réduction de la charge cognitive",
          "Suivi de l'évolution sur 4–6 semaines",
        ]}
      />
    </ScreenLayout>
  );
}