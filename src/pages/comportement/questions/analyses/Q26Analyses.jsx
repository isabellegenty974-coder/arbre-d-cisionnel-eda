import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse Comportement – Anxiété – Q26A",
    items: [
      "📌 Hypothèses : inhibition, peur du jugement",
      "🔍 À vérifier : signes corporels, évitement",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : ne pas confondre avec mutisme sélectif",
    ],
  },
  b: {
    title: "Analyse Comportement – Immaturité – Q26B",
    items: [
      "📌 Hypothèses : développement socio-affectif en cours",
      "🔍 À vérifier : âge, interactions",
      "🎯 Adressage : Enseignant / ATSEM",
      "⚠️ Vigilance : évolution rapide possible",
    ],
  },
  c: {
    title: "Analyse Comportement – TDAH inattentif – Q26C",
    items: [
      "📌 Hypothèses : retrait, lenteur, rêverie",
      "🔍 À vérifier : variabilité, distractibilité",
      "🎯 Adressage : Neuropsychologue / Pédiatre",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  d: {
    title: "Analyse Comportement – Opposition passive – Q26D",
    items: [
      "📌 Hypothèses : évitement relationnel",
      "🔍 À vérifier : contexte adulte/enfant",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : ne pas interpréter trop vite",
    ],
  },
};

function AnalysePage({ variant }) {
  const { title, items } = analyses[variant];
  return <ScreenLayout title={title}><InfoList type="hypothesis" items={items} /></ScreenLayout>;
}

export const Q26A = () => <AnalysePage variant="a" />;
export const Q26B = () => <AnalysePage variant="b" />;
export const Q26C = () => <AnalysePage variant="c" />;
export const Q26D = () => <AnalysePage variant="d" />;