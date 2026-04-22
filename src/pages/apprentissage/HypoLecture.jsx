import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function HypoLecture() {
  return (
    <ScreenLayout title="Hypothèses – Lecture">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses psychologue</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Trouble du langage écrit (à explorer)",
          "Manque d'automatisation",
          "Stratégies inefficaces",
          "Impact attentionnel",
          "Anxiété de performance",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Points de vigilance</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Effets de la comparaison sociale",
          "Estime de soi scolaire",
        ]}
      />
    </ScreenLayout>
  );
}