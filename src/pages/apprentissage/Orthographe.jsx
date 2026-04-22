import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function Orthographe() {
  return (
    <ScreenLayout title="Orthographe">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Confusions phonologiques",
          "Manque d'automatisation",
          "Difficulté de mémorisation",
          "Impact attentionnel",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Observations</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Types d'erreurs",
          "Stratégies utilisées",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Interventions</h2>
      <InfoList
        type="action"
        items={[
          "Travail phonologique",
          "Aides visuelles",
          "Dictées adaptées",
          "Renforcement des stratégies",
        ]}
      />
    </ScreenLayout>
  );
}