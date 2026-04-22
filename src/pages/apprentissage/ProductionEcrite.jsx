import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function ProductionEcrite() {
  return (
    <ScreenLayout title="📝 Production écrite">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">📌 Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Difficulté d'organisation",
          "Anxiété",
          "Lenteur cognitive",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">🔍 Observations</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Structure, cohérence",
        ]}
      />
      <ActionButton label="🛠️ Actions" to="/apprentissage/ecriture/production/actions" />
    </ScreenLayout>
  );
}