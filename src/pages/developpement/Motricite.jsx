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
          "Maladresse",
          "Lenteur",
          "Difficulté coordination",
          "Fatigue",
        ]}
      />
      <ActionButton label="Actions recommandées" to="/developpement/motricite/actions" />
    </ScreenLayout>
  );
}