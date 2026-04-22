import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function Numeration() {
  return (
    <ScreenLayout title="Numération">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Confusions",
          "Manque de sens",
          "Difficulté de manipulation",
          "Anxiété",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Actions</h2>
      <InfoList
        type="action"
        items={[
          "Manipulations",
          "Reprises de base",
          "Aides visuelles",
          "Échanges enseignant",
        ]}
      />
    </ScreenLayout>
  );
}