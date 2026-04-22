import ScreenLayout from "../../components/tree/ScreenLayout";
import QuestionOptions from "../../components/tree/QuestionOptions";

export default function Anxiete() {
  return (
    <ScreenLayout title="🌧️ Anxiété">
      <QuestionOptions
        question="L'anxiété est-elle situationnelle ou généralisée ?"
        options={[
          { label: "🎯 Situationnelle", to: "/comportement/anxiete/situationnelle" },
          { label: "🌧️ Généralisée", to: "/comportement/anxiete/generalisee" },
        ]}
      />
    </ScreenLayout>
  );
}