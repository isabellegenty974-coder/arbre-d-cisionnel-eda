import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function Inhibition() {
  return (
    <ScreenLayout title="🫙 Inhibition">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">📌 Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Anxiété",
          "Peur de l'erreur",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">🔍 Observations</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Participation, posture",
        ]}
      />
      <ActionButton label="Actions recommandées" to="/comportement/inhibition/actions" />
    </ScreenLayout>
  );
}