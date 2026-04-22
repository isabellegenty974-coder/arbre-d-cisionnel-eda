import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function Inhibition() {
  return (
    <ScreenLayout title="Inhibition">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Timidité",
          "Anxiété",
          "Peur de l'erreur",
          "Manque de confiance",
        ]}
      />
      <ActionButton label="Actions recommandées" to="/comportement/inhibition/actions" />
    </ScreenLayout>
  );
}