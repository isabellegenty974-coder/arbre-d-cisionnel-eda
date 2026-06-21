import ActionsPage from "@/components/tree/ActionsPage";

export default function ActionsLangageCompr() {
  return (
    <ActionsPage
      title="Actions recommandées – Compréhension"
      domaine="développement"
      sousDomaine="langage oral / compréhension"
      items={["Simplification", "Supports visuels", "Vérification compréhension"]}
    />
  );
}