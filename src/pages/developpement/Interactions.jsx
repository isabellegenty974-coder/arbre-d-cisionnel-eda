import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function Interactions() {
  return (
    <ScreenLayout title="Interactions sociales – Analyse">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Trouble du spectre autistique (TSA – hypothèse à explorer)",
          "Difficultés pragmatiques du langage",
          "Manque d'habiletés sociales",
          "Rejet par les pairs / harcèlement",
          "Anxiété sociale",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Actions recommandées</h2>
      <InfoList
        type="action"
        items={[
          "Observer les interactions en récréation et en classe",
          "Entretien famille : comportement social hors école",
          "Proposer des activités en petit groupe",
          "Ateliers d'habiletés sociales si possible",
          "Orientation vers un spécialiste si TSA suspecté",
        ]}
      />
    </ScreenLayout>
  );
}