import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse Comportement – Opposition – Q32A",
    items: [
      "📌 Hypothèses : rapport conflictuel aux pairs",
      "🔍 À vérifier : dynamique sociale",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : contexte familial",
    ],
  },
  b: {
    title: "Analyse Comportement – Anxiété – Q32B",
    items: [
      "📌 Hypothèses : agressivité défensive",
      "🔍 À vérifier : déclencheurs",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : anxiété masquée",
    ],
  },
  c: {
    title: "Analyse Comportement – TDAH – Q32C",
    items: [
      "📌 Hypothèses : impulsivité sociale",
      "🔍 À vérifier : variabilité",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  d: {
    title: "Analyse Comportement – Stress – Q32D",
    items: [
      "📌 Hypothèses : surcharge émotionnelle",
      "🔍 À vérifier : contexte familial",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : symptômes somatiques",
    ],
  },
};

function AnalysePage({ variant }) {
  const { title, items } = analyses[variant];
  return <ScreenLayout title={title}><InfoList type="hypothesis" items={items} /></ScreenLayout>;
}

export const Q32A = () => <AnalysePage variant="a" />;
export const Q32B = () => <AnalysePage variant="b" />;
export const Q32C = () => <AnalysePage variant="c" />;
export const Q32D = () => <AnalysePage variant="d" />;