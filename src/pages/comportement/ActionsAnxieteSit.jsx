import ActionsPage from "@/components/tree/ActionsPage";

export default function ActionsAnxieteSit() {
  return (
    <ActionsPage
      title="Actions – Anxiété situationnelle"
      domaine="comportement"
      sousDomaine="anxiété situationnelle"
      items={[
        "Identifier les situations déclenchantes précises",
        "Proposer des aménagements contextuels",
        "Techniques de gestion du stress adaptées",
      ]}
    />
  );
}
