import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function Maths() {
  return (
    <ScreenLayout title="Mathématiques – Analyse">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Difficulté de raisonnement logique",
          "Trouble des apprentissages en mathématiques (dyscalculie)",
          "Déficit de la mémoire de travail",
          "Manque de manipulation concrète",
          "Anxiété liée aux mathématiques",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Actions recommandées</h2>
      <InfoList
        type="action"
        items={[
          "Observation des stratégies de résolution",
          "Proposer du matériel de manipulation",
          "Entretien enseignant : méthodes et progressions",
          "Aménagements : temps supplémentaire, calculatrice",
          "Envisager un bilan logico-mathématique si nécessaire",
        ]}
      />
    </ScreenLayout>
  );
}