import ActionsPage from "@/components/tree/ActionsPage";

export default function ActionsAttention() {
  return (
    <ActionsPage
      title="Actions recommandées – Attention"
      domaine="développement"
      sousDomaine="attention"
      items={["Routines", "Consignes courtes", "Place adaptée", "Renforcement positif"]}
    />
  );
}