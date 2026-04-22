import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function Problemes() {
  return (
    <ScreenLayout title="Problèmes">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Compréhension",
          "Représentation",
          "Impulsivité",
          "Manque de stratégies",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Actions</h2>
      <InfoList
        type="action"
        items={[
          "Schémas",
          "Étapes guidées",
          "Verbalisation",
          "Temps supplémentaire",
        ]}
      />
    </ScreenLayout>
  );
}