import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function Attention() {
  return (
    <ScreenLayout title="🎯 Attention">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">📌 Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Distractibilité",
          "Hyperfocalisation",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">🔍 Observations</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Durée de concentration",
        ]}
      />
      <ActionButton label="Actions recommandées" to="/developpement/attention/actions" />
    </ScreenLayout>
  );
}