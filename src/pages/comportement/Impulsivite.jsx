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
          "Agitation",
          "Réponses rapides",
          "Difficulté d'inhibition",
          "Attention fluctuante",
        ]}
      />
      <ActionButton label="Actions recommandées" to="/comportement/impulsivite/actions" />
    </ScreenLayout>
  );
}