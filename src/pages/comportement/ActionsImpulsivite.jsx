import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function ActionsImpulsivite() {
  return (
    <ScreenLayout title="Actions recommandées – Impulsivité">
      <InfoList
        type="action"
        items={[
          "Routines",
          "Consignes fractionnées",
          "Renforcement positif",
          "Place dans la classe",
        ]}
      />
    </ScreenLayout>
  );
}