import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function Impulsivite() {
  return (
    <ScreenLayout title="Impulsivité">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Difficulté d'inhibition",
          "Attention fluctuante",
          "Besoin de mouvement",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Observations</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Réactivité",
          "Gestion des consignes",
        ]}
      />
      <ActionButton label="Actions recommandées" to="/comportement/impulsivite/actions" />
    </ScreenLayout>
  );
}