import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function Changements() {
  return (
    <ScreenLayout title="Changements récents">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Déménagement",
          "Séparation",
          "Décès",
          "Changement enseignant",
        ]}
      />
      <ActionButton label="Actions recommandées" to="/contexte/changements/actions" />
    </ScreenLayout>
  );
}