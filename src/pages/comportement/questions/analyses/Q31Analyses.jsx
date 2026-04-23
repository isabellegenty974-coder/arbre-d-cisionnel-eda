import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse Comportement – TDAH inattentif – Q31A",
    items: [
      "📌 Hypothèses : distractibilité, lenteur",
      "🔍 À vérifier : variabilité",
      "🎯 Adressage : Neuropsychologue / Pédiatre",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  b: {
    title: "Analyse Comportement – Anxiété – Q31B",
    items: [
      "📌 Hypothèses : retrait anxieux",
      "🔍 À vérifier : tension, évitement",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : anxiété masquée",
    ],
  },
  c: {
    title: "Analyse Comportement – Dépression – Q31C",
    items: [
      "📌 Hypothèses : ralentissement psychomoteur",
      "🔍 À vérifier : tristesse, isolement",
      "🎯 Adressage : CMP / Pédopsychiatre",
      "⚠️ Vigilance : repérage précoce",
    ],
  },
  d: {
    title: "Analyse Comportement – Immaturité – Q31D",
    items: [
      "📌 Hypothèses : développement en cours",
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

export const Q31A = () => <AnalysePage variant="a" />;
export const Q31B = () => <AnalysePage variant="b" />;
export const Q31C = () => <AnalysePage variant="c" />;
export const Q31D = () => <AnalysePage variant="d" />;