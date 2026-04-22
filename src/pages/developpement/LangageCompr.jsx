import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function LangageCompr() {
  return (
    <ScreenLayout title="Langage oral – Compréhension">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Trouble du langage oral réceptif",
          "Déficit auditif (à vérifier)",
          "Bilinguisme – interférences linguistiques",
          "Déficit attentionnel impactant la compréhension",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Actions recommandées</h2>
      <InfoList
        type="action"
        items={[
          "Vérifier l'audition (bilan ORL)",
          "Observer la compréhension en contexte",
          "Simplifier les consignes (phrases courtes, supports visuels)",
          "Entretien famille : histoire du langage",
          "Envisager un bilan orthophonique",
        ]}
      />
    </ScreenLayout>
  );
}