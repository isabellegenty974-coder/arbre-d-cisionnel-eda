import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function Numeration() {
  return (
    <ScreenLayout title="Numération">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Manque de sens du nombre",
          "Difficulté de manipulation",
          "Anxiété mathématique",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Observations</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Stratégies utilisées",
          "Erreurs récurrentes",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Interventions</h2>
      <InfoList
        type="action"
        items={[
          "Manipulations",
          "Reprises de base",
          "Aides visuelles",
          "Travail du sens du nombre",
        ]}
      />
    </ScreenLayout>
  );
}