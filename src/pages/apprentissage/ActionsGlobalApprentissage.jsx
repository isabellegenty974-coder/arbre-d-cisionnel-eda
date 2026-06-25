import ActionsPage from "@/components/tree/ActionsPage";

export default function ActionsGlobalApprentissage() {
  return (
    <ActionsPage
      title="Actions – Difficultés globales"
      domaine="apprentissage"
      sousDomaine="global"
      items={[
        "Bilan psychométrique si nécessaire",
        "Concertation équipe pédagogique",
        "Mise en place de supports adaptés",
      ]}
    />
  );
}
