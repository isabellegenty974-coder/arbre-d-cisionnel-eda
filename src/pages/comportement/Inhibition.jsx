import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function Inhibition() {
  return (
    <ScreenLayout title="Inhibition – Analyse">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hypothèses</h2>
      <InfoList
        type="hypothesis"
        items={[
          "Timidité importante",
          "Anxiété sociale",
          "Faible estime de soi",
          "Peur de l'erreur ou du jugement",
          "Mutisme sélectif (hypothèse à explorer)",
        ]}
      />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Actions recommandées</h2>
      <InfoList
        type="action"
        items={[
          "Observer les situations où l'élève s'exprime le mieux",
          "Favoriser les interactions en petit groupe",
          "Entretien famille : comportement à la maison",
          "Aménagements : ne pas forcer la prise de parole",
          "Orientation vers un professionnel si mutisme persistant",
        ]}
      />
    </ScreenLayout>
  );
}