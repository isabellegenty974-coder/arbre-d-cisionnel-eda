import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse Comportement – Anxiété performance – Q29A",
    items: [
      "📌 Hypothèses : peur de l'échec, pression",
      "🔍 À vérifier : signes corporels",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : perfectionnisme",
    ],
  },
  b: {
    title: "Analyse Comportement – Stress – Q29B",
    items: [
      "📌 Hypothèses : surcharge émotionnelle",
      "🔍 À vérifier : contexte familial",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : symptômes somatiques",
    ],
  },
  c: {
    title: "Analyse Comportement – TDAH – Q29C",
    items: [
      "📌 Hypothèses : difficulté à gérer la pression",
      "🔍 À vérifier : variabilité",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  d: {
    title: "Analyse Comportement – Dyslexie – Q29D",
    items: [
      "📌 Hypothèses : anxiété secondaire à l'échec répété",
      "🔍 À vérifier : fluence, décodage",
      "🎯 Adressage : Orthophoniste",
      "⚠️ Vigilance : double trouble",
    ],
  },
};

function AnalysePage({ variant }) {
  const { title, items } = analyses[variant];
  return <ScreenLayout title={title}><InfoList type="hypothesis" items={items} /></ScreenLayout>;
}

export const Q29A = () => <AnalysePage variant="a" />;
export const Q29B = () => <AnalysePage variant="b" />;
export const Q29C = () => <AnalysePage variant="c" />;
export const Q29D = () => <AnalysePage variant="d" />;