import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse Maths – Anxiété mathématique – Q21A",
    items: [
      "📌 Hypothèses : peur de l'erreur, blocage",
      "🔍 À vérifier : signes corporels, évitement",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : cercle anxiété/échec",
    ],
  },
  b: {
    title: "Analyse Maths – Dyscalculie – Q21B",
    items: [
      "📌 Hypothèses : trouble du nombre → anxiété secondaire",
      "🔍 À vérifier : estimation, manipulation",
      "🎯 Adressage : Orthophoniste",
      "⚠️ Vigilance : double trouble",
    ],
  },
  c: {
    title: "Analyse Maths – TDAH – Q21C",
    items: [
      "📌 Hypothèses : surcharge cognitive",
      "🔍 À vérifier : variabilité",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  d: {
    title: "Analyse Maths – Opposition – Q21D",
    items: [
      "📌 Hypothèses : refus lié au cadre",
      "🔍 À vérifier : contexte relationnel",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : ne pas confondre avec anxiété",
    ],
  },
};

function AnalysePage({ variant }) {
  const { title, items } = analyses[variant];
  return (
    <ScreenLayout title={title}>
      <InfoList type="hypothesis" items={items} />
    </ScreenLayout>
  );
}

export const Q21A = () => <AnalysePage variant="a" />;
export const Q21B = () => <AnalysePage variant="b" />;
export const Q21C = () => <AnalysePage variant="c" />;
export const Q21D = () => <AnalysePage variant="d" />;