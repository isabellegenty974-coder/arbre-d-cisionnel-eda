import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function Attention() {
  return (
    <ScreenLayout title="Attention – Analyse">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Trouble de l'attention (TDA/H)",
          "Fatigue chronique (sommeil, alimentation)",
          "Préoccupations émotionnelles envahissantes",
          "Environnement trop stimulant",
          "Haut potentiel intellectuel (ennui)",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Actions recommandées</h2>
      <InfoList
        type="action"
        items={[
          "Observer les moments d'attention et d'inattention",
          "Aménagements : place en classe, consignes courtes",
          "Outils de recentrage (timer, pauses)",
          "Entretien famille : sommeil, rythme de vie",
          "Orientation vers un neuropédiatre si nécessaire",
        ]}
      />
    </ScreenLayout>
  );
}