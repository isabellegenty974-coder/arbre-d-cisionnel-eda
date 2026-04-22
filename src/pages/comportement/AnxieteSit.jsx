import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function AnxieteSit() {
  return (
    <ScreenLayout title="Anxiété situationnelle – Analyse">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Anxiété de performance (évaluations)",
          "Phobie spécifique (lieu, personne, activité)",
          "Anxiété de séparation",
          "Événement déclencheur identifiable",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Actions recommandées</h2>
      <InfoList
        type="action"
        items={[
          "Identifier les situations déclencheuses",
          "Entretien élève : verbalisation des peurs",
          "Aménagements ciblés sur les situations à risque",
          "Techniques de relaxation adaptées",
          "Suivi si l'anxiété s'étend à d'autres situations",
        ]}
      />
    </ScreenLayout>
  );
}