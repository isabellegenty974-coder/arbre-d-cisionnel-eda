import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function Problemes() {
  return (
    <ScreenLayout title="🧮 Problèmes">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">📌 Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Compréhension",
          "Représentation mentale",
          "Impulsivité",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">🔍 Observations</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Lecture, stratégies",
        ]}
      />
      <ActionButton label="🛠️ Actions" to="/apprentissage/maths/problemes/actions" />
    </ScreenLayout>
  );
}