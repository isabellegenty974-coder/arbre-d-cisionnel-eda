import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function LangageCompr() {
  return (
    <ScreenLayout title="Compréhension">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Consignes difficiles",
          "Vocabulaire limité",
          "Attention fluctuante",
        ]}
      />
      <ActionButton label="Actions recommandées" to="/developpement/langage-oral/comprehension/actions" />
    </ScreenLayout>
  );
}