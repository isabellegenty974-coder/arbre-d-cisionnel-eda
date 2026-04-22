import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function Opposition() {
  return (
    <ScreenLayout title="Opposition – Analyse">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Besoin d'autonomie et d'affirmation de soi",
          "Trouble oppositionnel avec provocation (TOP)",
          "Réaction à un sentiment d'injustice",
          "Difficultés de compréhension des consignes",
          "Facteurs familiaux (modèles éducatifs)",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Actions recommandées</h2>
      <InfoList
        type="action"
        items={[
          "Observer les contextes d'opposition",
          "Entretien enseignant : gestion de la relation",
          "Entretien famille : cadre éducatif",
          "Proposer des choix plutôt que des injonctions",
          "Renforcement positif des comportements adaptés",
          "Orientation si persistance et intensité",
        ]}
      />
    </ScreenLayout>
  );
}