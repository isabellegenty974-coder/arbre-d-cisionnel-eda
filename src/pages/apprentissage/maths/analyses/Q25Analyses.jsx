import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse Maths – Dyscalculie – Q25A",
    items: [
      "📌 Hypothèses : automatisation non acquise",
      "🔍 À vérifier : tables, estimation",
      "🎯 Adressage : Orthophoniste",
      "⚠️ Vigilance : trouble spécifique",
    ],
  },
  b: {
    title: "Analyse Maths – Manque entraînement – Q25B",
    items: [
      "📌 Hypothèses : pratique insuffisante",
      "🔍 À vérifier : exercices réguliers",
      "🎯 Adressage : Enseignant",
      "⚠️ Vigilance : éviter la stigmatisation",
    ],
  },
  c: {
    title: "Analyse Maths – TDAH – Q25C",
    items: [
      "📌 Hypothèses : difficulté à mémoriser les faits numériques",
      "🔍 À vérifier : variabilité",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  d: {
    title: "Analyse Maths – Stress – Q25D",
    items: [
      "📌 Hypothèses : blocage en situation d'évaluation",
      "🔍 À vérifier : tension, évitement",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : anxiété scolaire",
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

export const Q25A = () => <AnalysePage variant="a" />;
export const Q25B = () => <AnalysePage variant="b" />;
export const Q25C = () => <AnalysePage variant="c" />;
export const Q25D = () => <AnalysePage variant="d" />;