import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function Impulsivite() {
  return (
    <ScreenLayout title="Impulsivité – Analyse">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Trouble de l'attention avec hyperactivité (TDAH)",
          "Immaturité développementale",
          "Recherche de stimulation",
          "Difficultés de régulation émotionnelle",
          "Contexte familial instable",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Actions recommandées</h2>
      <InfoList
        type="action"
        items={[
          "Observer la fréquence et les contextes d'apparition",
          "Proposer des outils de régulation (timer, fidgets)",
          "Entretien enseignant : cadrage et renforcement positif",
          "Entretien famille : comportement hors école",
          "Orientation vers un neuropédiatre si nécessaire",
        ]}
      />
    </ScreenLayout>
  );
}