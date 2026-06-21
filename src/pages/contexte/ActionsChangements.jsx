import ActionsPage from "@/components/tree/ActionsPage";

export default function ActionsChangements() {
  return (
    <ActionsPage
      title="Actions recommandées – Changements"
      domaine="contexte"
      sousDomaine="changements"
      items={["Entretien famille", "Temps d'adaptation", "Soutien émotionnel"]}
    />
  );
}