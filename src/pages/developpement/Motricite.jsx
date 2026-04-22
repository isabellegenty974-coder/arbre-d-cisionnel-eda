import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function Motricite() {
  return (
    <ScreenLayout title="Motricité">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Trouble de la coordination",
          "Fatigue motrice",
          "Difficulté de planification",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Observations</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Motricité fine / globale",
          "Posture",
        ]}
      />
      <ActionButton label="Actions recommandées" to="/developpement/motricite/actions" />
    </ScreenLayout>
  );
}