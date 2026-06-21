import ActionsPage from "@/components/tree/ActionsPage";

export default function ActionsInhibition() {
  return (
    <ActionsPage
      title="Actions recommandées – Inhibition"
      domaine="comportement"
      sousDomaine="inhibition"
      items={["Encouragements", "Sécurisation", "Prévisibilité", "Travail émotionnel"]}
    />
  );
}