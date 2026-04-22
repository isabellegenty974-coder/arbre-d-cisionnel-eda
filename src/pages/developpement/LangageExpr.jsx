import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function LangageExpr() {
  return (
    <ScreenLayout title="Langage oral – Expression">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Trouble du langage oral expressif",
          "Retard de parole / retard de langage",
          "Inhibition verbale",
          "Bilinguisme – développement en cours",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Actions recommandées</h2>
      <InfoList
        type="action"
        items={[
          "Observer les productions orales en classe",
          "Encourager la verbalisation sans pression",
          "Entretien famille : développement langagier",
          "Envisager un bilan orthophonique",
          "Aménagements : reformulations, étayage verbal",
        ]}
      />
    </ScreenLayout>
  );
}