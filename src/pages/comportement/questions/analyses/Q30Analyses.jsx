import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse Comportement – Hypersensibilité – Q30A",
    items: [
      "📌 Hypothèses : réactivité émotionnelle forte",
      "🔍 À vérifier : déclencheurs, intensité",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : TSA possible",
    ],
  },
  b: {
    title: "Analyse Comportement – TDAH – Q30B",
    items: [
      "📌 Hypothèses : difficulté d'inhibition émotionnelle",
      "🔍 À vérifier : variabilité",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  c: {
    title: "Analyse Comportement – Opposition – Q30C",
    items: [
      "📌 Hypothèses : rapport conflictuel à la règle",
      "🔍 À vérifier : contexte relationnel",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : dynamique adulte/enfant",
    ],
  },
  d: {
    title: "Analyse Comportement – Stress – Q30D",
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

export const Q30A = () => <AnalysePage variant="a" />;
export const Q30B = () => <AnalysePage variant="b" />;
export const Q30C = () => <AnalysePage variant="c" />;
export const Q30D = () => <AnalysePage variant="d" />;