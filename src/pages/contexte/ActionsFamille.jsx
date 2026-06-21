import ActionsPage from "@/components/tree/ActionsPage";

export default function ActionsFamille() {
  return (
    <ActionsPage
      title="Actions recommandées – Contexte familial"
      domaine="contexte"
      sousDomaine="famille"
      items={[
        "Entretien famille (écoute, repérage des besoins)",
        "Échanges avec l'enseignant",
        "Aménagements temporaires",
        "Suivi psychologique si nécessaire",
      ]}
    />
  );
}