import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function GlobalApprentissage() {
  return (
    <ScreenLayout title="🧩 Difficultés globales">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">📌 Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Décalage développemental",
          "Fatigue chronique",
          "Contexte familial",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">🔍 Observations</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Variabilité, engagement",
        ]}
      />
      <ActionButton label="🛠️ Actions" to="/apprentissage/global/actions" />
    </ScreenLayout>
  );
}