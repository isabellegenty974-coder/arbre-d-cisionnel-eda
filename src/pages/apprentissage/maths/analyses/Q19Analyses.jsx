import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse Maths – Dyscalculie – Q19A",
    items: [
      "📌 Hypothèses : trouble du sens du nombre, difficultés d'estimation",
      "🔍 À vérifier : comparaison, manipulation, subitizing",
      "🎯 Adressage : Orthophoniste / Neuropsychologue",
      "⚠️ Vigilance : trouble spécifique, non lié au travail",
    ],
  },
  b: {
    title: "Analyse Maths – TDAH – Q19B",
    items: [
      "📌 Hypothèses : inattention lors des manipulations",
      "🔍 À vérifier : variabilité, erreurs d'étourderie",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  c: {
    title: "Analyse Maths – Manque entraînement – Q19C",
    items: [
      "📌 Hypothèses : faible exposition aux activités numériques",
      "🔍 À vérifier : pratiques à la maison",
      "🎯 Adressage : Enseignant",
      "⚠️ Vigilance : éviter la stigmatisation",
    ],
  },
  d: {
    title: "Analyse Maths – Stress – Q19D",
    items: [
      "📌 Hypothèses : anxiété mathématique",
      "🔍 À vérifier : signes corporels, évitement",
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

export const Q19A = () => <AnalysePage variant="a" />;
export const Q19B = () => <AnalysePage variant="b" />;
export const Q19C = () => <AnalysePage variant="c" />;
export const Q19D = () => <AnalysePage variant="d" />;