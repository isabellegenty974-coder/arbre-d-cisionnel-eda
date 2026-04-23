import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse Comportement – Opposition – Q28A",
    items: [
      "📌 Hypothèses : rapport au cadre, défi",
      "🔍 À vérifier : contexte relationnel",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : dynamique adulte/enfant",
    ],
  },
  b: {
    title: "Analyse Comportement – TDAH – Q28B",
    items: [
      "📌 Hypothèses : impulsivité → opposition apparente",
      "🔍 À vérifier : variabilité",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  c: {
    title: "Analyse Comportement – Anxiété – Q28C",
    items: [
      "📌 Hypothèses : opposition défensive",
      "🔍 À vérifier : évitement, tension",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : anxiété masquée",
    ],
  },
  d: {
    title: "Analyse Comportement – Immaturité – Q28D",
    items: [
      "📌 Hypothèses : difficulté à accepter la frustration",
      "🔍 À vérifier : âge, interactions",
      "🎯 Adressage : Enseignant",
      "⚠️ Vigilance : évolution rapide possible",
    ],
  },
};

function AnalysePage({ variant }) {
  const { title, items } = analyses[variant];
  return <ScreenLayout title={title}><InfoList type="hypothesis" items={items} /></ScreenLayout>;
}

export const Q28A = () => <AnalysePage variant="a" />;
export const Q28B = () => <AnalysePage variant="b" />;
export const Q28C = () => <AnalysePage variant="c" />;
export const Q28D = () => <AnalysePage variant="d" />;