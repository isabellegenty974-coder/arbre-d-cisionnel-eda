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
          "Trouble du langage oral (à explorer)",
          "Attention fluctuante",
          "Vocabulaire limité",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Observations</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Réactions aux consignes",
          "Compréhension implicite",
        ]}
      />
      <ActionButton label="Actions recommandées" to="/developpement/langage-oral/comprehension/actions" />
    </ScreenLayout>
  );
}