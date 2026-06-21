import ActionsPage from "@/components/tree/ActionsPage";

export default function ActionsMotricite() {
  return (
    <ActionsPage
      title="Actions recommandées – Motricité"
      domaine="développement"
      sousDomaine="motricité"
      items={["Observation", "Adaptations", "Orientation psychomotricité"]}
    />
  );
}