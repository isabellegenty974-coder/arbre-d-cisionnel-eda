import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function ActionsFamille() {
  return (
    <ScreenLayout title="Actions recommandées – Contexte familial">
      <InfoList
        type="action"
        items={[
          "Entretien famille (écoute, repérage des besoins)",
          "Échanges avec l'enseignant",
          "Aménagements temporaires",
          "Suivi psychologique si nécessaire",
        ]}
      />
    </ScreenLayout>
  );
}