import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function LectureRecente() {
  return (
    <ScreenLayout title="📘 Lecture – Difficulté récente">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">🔍 Repères psychologue</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Fatigue, anxiété, transitions",
          "Variabilité selon les moments",
          "Posture, engagement, stratégies",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">👥 Entretiens</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Enseignant : attentes, climat",
          "Famille : sommeil, stress",
        ]}
      />
      <ActionButton label="🛠️ Actions" to="/apprentissage/lecture/actions" />
    </ScreenLayout>
  );
}