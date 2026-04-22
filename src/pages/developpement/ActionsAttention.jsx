import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function ActionsAttention() {
  return (
    <ScreenLayout title="Actions recommandées – Attention">
      <InfoList
        type="action"
        items={[
          "Routines",
          "Consignes courtes",
          "Place adaptée",
          "Renforcement positif",
        ]}
      />
    </ScreenLayout>
  );
}