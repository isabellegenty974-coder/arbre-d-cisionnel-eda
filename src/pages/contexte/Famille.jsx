import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function Famille() {
  return (
    <ScreenLayout title="Événement familial">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Impact émotionnel",
          "Désorganisation temporaire",
          "Fatigue psychique",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Observations</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Variabilité",
          "Signes émotionnels",
        ]}
      />
      <ActionButton label="Actions recommandées" to="/contexte/famille/actions" />
    </ScreenLayout>
  );
}