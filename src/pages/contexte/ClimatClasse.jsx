import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";
import ActionButton from "../../components/tree/ActionButton";

export default function ClimatClasse() {
  return (
    <ScreenLayout title="Climat de classe">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Bruit",
          "Conflits",
          "Manque de repères",
          "Stress",
        ]}
      />
      <ActionButton label="Actions recommandées" to="/contexte/climat-classe/actions" />
    </ScreenLayout>
  );
}