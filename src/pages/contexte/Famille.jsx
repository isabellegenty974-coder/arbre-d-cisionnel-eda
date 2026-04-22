import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function Famille() {
  return (
    <ScreenLayout title="Événement familial">
      <p className="text-muted-foreground mb-5">Hypothèses possibles :</p>
      <InfoList
        type="hypothesis"
        items={[
          "Impact émotionnel sur l'élève",
          "Désorganisation temporaire",
          "Fatigue, anxiété, préoccupations",
        ]}
      />
      <ActionButton label="Actions recommandées" to="/contexte/famille/actions" />
    </ScreenLayout>
  );
}