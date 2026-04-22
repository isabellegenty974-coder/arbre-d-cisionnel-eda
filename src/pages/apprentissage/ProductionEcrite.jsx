import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function ProductionEcrite() {
  return (
    <ScreenLayout title="Production écrite">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Manque d'idées",
          "Difficulté à structurer",
          "Anxiété",
          "Lenteur cognitive",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Actions</h2>
      <InfoList
        type="action"
        items={[
          "Guidage",
          "Plans",
          "Aides visuelles",
          "Temps supplémentaire",
        ]}
      />
    </ScreenLayout>
  );
}