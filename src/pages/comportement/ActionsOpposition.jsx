import ActionsPage from "@/components/tree/ActionsPage";

export default function ActionsOpposition() {
  return (
    <ActionsPage
      title="Actions recommandées – Opposition"
      domaine="comportement"
      sousDomaine="opposition"
      items={["Cadre clair", "Rituels", "Médiation", "Échanges famille"]}
    />
  );
}