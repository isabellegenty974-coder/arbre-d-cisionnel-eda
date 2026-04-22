import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function Absenteisme() {
  return (
    <ScreenLayout title="Absentéisme">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Phobie scolaire",
          "Difficultés familiales (organisation, santé)",
          "Harcèlement scolaire",
          "Troubles somatiques liés à l'anxiété",
          "Déscolarisation progressive",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Actions recommandées</h2>
      <InfoList
        type="action"
        items={[
          "Rencontre famille : comprendre les causes",
          "Lien avec l'assistante sociale scolaire",
          "Entretien élève : recueillir son vécu",
          "Plan d'accompagnement pour le retour",
          "Signalement si absentéisme chronique",
        ]}
      />
    </ScreenLayout>
  );
}