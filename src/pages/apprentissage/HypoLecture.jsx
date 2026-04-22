import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function HypoLecture() {
  return (
    <ScreenLayout title="Hypothèses – Lecture">
      <InfoList
        type="hypothesis"
        items={[
          "Difficulté d'apprentissage spécifique",
          "Trouble du langage écrit (hypothèse à explorer)",
          "Manque d'automatisation des procédures",
          "Impact attentionnel",
          "Facteur émotionnel (anxiété de performance)",
        ]}
      />
    </ScreenLayout>
  );
}