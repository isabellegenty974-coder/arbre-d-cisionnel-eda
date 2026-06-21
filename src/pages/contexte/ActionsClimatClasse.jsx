import ActionsPage from "@/components/tree/ActionsPage";

export default function ActionsClimatClasse() {
  return (
    <ActionsPage
      title="Actions recommandées – Climat de classe"
      domaine="contexte"
      sousDomaine="climat de classe"
      items={["Rituels", "Règles", "Médiation", "Aménagements"]}
    />
  );
}