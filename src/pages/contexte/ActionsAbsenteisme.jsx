import ActionsPage from "@/components/tree/ActionsPage";

export default function ActionsAbsenteisme() {
  return (
    <ActionsPage
      title="Actions recommandées – Absentéisme"
      domaine="contexte"
      sousDomaine="absentéisme"
      items={["Échanges famille", "Plan de reprise", "Suivi", "Coordination équipe"]}
    />
  );
}