import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse Maths – Raisonnement – Q24A",
    items: [
      "📌 Hypothèses : difficulté à généraliser",
      "🔍 À vérifier : passage concret → abstrait",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : fonctions exécutives",
    ],
  },
  b: {
    title: "Analyse Maths – Dyscalculie – Q24B",
    items: [
      "📌 Hypothèses : trouble du sens du nombre",
      "🔍 À vérifier : estimation, comparaison",
      "🎯 Adressage : Orthophoniste",
      "⚠️ Vigilance : surcharge cognitive",
    ],
  },
  c: {
    title: "Analyse Maths – TDAH – Q24C",
    items: [
      "📌 Hypothèses : difficulté à suivre les étapes",
      "🔍 À vérifier : erreurs d'inattention",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  d: {
    title: "Analyse Maths – Stress – Q24D",
    items: [
      "📌 Hypothèses : blocage émotionnel",
      "🔍 À vérifier : tension, évitement",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : pression scolaire",
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

export const Q24A = () => <AnalysePage variant="a" />;
export const Q24B = () => <AnalysePage variant="b" />;
export const Q24C = () => <AnalysePage variant="c" />;
export const Q24D = () => <AnalysePage variant="d" />;