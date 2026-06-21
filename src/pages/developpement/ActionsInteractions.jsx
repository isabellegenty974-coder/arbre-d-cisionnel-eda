import ActionsPage from "@/components/tree/ActionsPage";

export default function ActionsInteractions() {
  return (
    <ActionsPage
      title="Actions recommandées – Interactions sociales"
      domaine="développement"
      sousDomaine="interactions sociales"
      items={["Jeux coopératifs", "Médiation", "Observation cour", "Échanges famille"]}
    />
  );
}