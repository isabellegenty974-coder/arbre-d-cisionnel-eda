import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse Comportement – TDAH – Q27A",
    items: [
      "📌 Hypothèses : impulsivité, difficulté d'inhibition",
      "🔍 À vérifier : variabilité, agitation",
      "🎯 Adressage : Neuropsychologue / Pédiatre",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  b: {
    title: "Analyse Comportement – Opposition – Q27B",
    items: [
      "📌 Hypothèses : difficulté avec la règle",
      "🔍 À vérifier : contexte relationnel",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : ne pas confondre avec TDAH",
    ],
  },
  c: {
    title: "Analyse Comportement – Anxiété – Q27C",
    items: [
      "📌 Hypothèses : agitation anxieuse",
      "🔍 À vérifier : tension corporelle",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : anxiété masquée",
    ],
  },
  d: {
    title: "Analyse Comportement – Immaturité – Q27D",
    items: [
      "📌 Hypothèses : développement socio-affectif en cours",
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

export const Q27A = () => <AnalysePage variant="a" />;
export const Q27B = () => <AnalysePage variant="b" />;
export const Q27C = () => <AnalysePage variant="c" />;
export const Q27D = () => <AnalysePage variant="d" />;