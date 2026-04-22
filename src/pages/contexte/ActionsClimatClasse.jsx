import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function ActionsClimatClasse() {
  return (
    <ScreenLayout title="Actions recommandées – Climat de classe">
      <InfoList
        type="action"
        items={[
          "Rituels",
          "Règles",
          "Médiation",
          "Aménagements",
        ]}
      />
    </ScreenLayout>
  );
}