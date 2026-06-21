import ActionsPage from "@/components/tree/ActionsPage";

export default function ActionsImpulsivite() {
  return (
    <ActionsPage
      title="Actions recommandées – Impulsivité"
      domaine="comportement"
      sousDomaine="impulsivité"
      items={["Routines", "Consignes fractionnées", "Renforcement positif", "Place dans la classe"]}
    />
  );
}