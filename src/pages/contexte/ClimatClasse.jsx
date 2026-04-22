import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function ClimatClasse() {
  return (
    <ScreenLayout title="Climat de classe">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Ambiance de classe dégradée",
          "Relation enseignant-élève difficile",
          "Harcèlement entre pairs",
          "Manque de cadre sécurisant",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Actions recommandées</h2>
      <InfoList
        type="action"
        items={[
          "Observation en classe",
          "Entretien enseignant : dynamique de groupe",
          "Médiation entre pairs si nécessaire",
          "Proposer des outils de régulation collective",
          "Signalement si situation de harcèlement",
        ]}
      />
    </ScreenLayout>
  );
}