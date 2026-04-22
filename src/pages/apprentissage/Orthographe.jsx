import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function Orthographe() {
  return (
    <ScreenLayout title="Orthographe">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Confusions phonologiques",
          "Manque d'automatisation",
          "Difficulté de mémorisation",
          "Impact attentionnel",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Actions</h2>
      <InfoList
        type="action"
        items={[
          "Dictées adaptées",
          "Travail phonologique",
          "Aides visuelles",
          "Échanges enseignant",
        ]}
      />
    </ScreenLayout>
  );
}