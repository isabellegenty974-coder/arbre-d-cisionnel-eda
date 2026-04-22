import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function Calcul() {
  return (
    <ScreenLayout title="Calcul">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Automatisation faible",
          "Erreurs d'inattention",
          "Stress",
          "Manque de stratégies",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Actions</h2>
      <InfoList
        type="action"
        items={[
          "Tables",
          "Jeux",
          "Manipulations",
          "Routines d'entraînement",
        ]}
      />
    </ScreenLayout>
  );
}