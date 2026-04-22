import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function LangageExpr() {
  return (
    <ScreenLayout title="Expression">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Manque de vocabulaire",
          "Difficulté articulation",
          "Phrases courtes",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Observations</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Intelligibilité",
          "Complexité syntaxique",
        ]}
      />
      <ActionButton label="Actions recommandées" to="/developpement/langage-oral/expression/actions" />
    </ScreenLayout>
  );
}