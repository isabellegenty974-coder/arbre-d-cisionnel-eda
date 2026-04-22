import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function Numeration() {
  return (
    <ScreenLayout title="🔢 Numération">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">📌 Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Manque de sens du nombre",
          "Anxiété mathématique",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">🔍 Observations</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Stratégies, erreurs",
        ]}
      />
      <ActionButton label="🛠️ Actions" to="/apprentissage/maths/numeration/actions" />
    </ScreenLayout>
  );
}