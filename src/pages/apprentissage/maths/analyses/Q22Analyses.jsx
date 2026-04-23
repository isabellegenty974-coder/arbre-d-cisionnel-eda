import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse Maths – Langage oral – Q22A",
    items: [
      "📌 Hypothèses : compréhension orale faible",
      "🔍 À vérifier : lexique, syntaxe",
      "🎯 Adressage : Orthophoniste",
      "⚠️ Vigilance : impact sur lecture",
    ],
  },
  b: {
    title: "Analyse Maths – Dyscalculie – Q22B",
    items: [
      "📌 Hypothèses : difficulté à relier texte et opérations",
      "🔍 À vérifier : compréhension du sens",
      "🎯 Adressage : Orthophoniste",
      "⚠️ Vigilance : surcharge cognitive",
    ],
  },
  c: {
    title: "Analyse Maths – TDAH – Q22C",
    items: [
      "📌 Hypothèses : difficulté à suivre les étapes",
      "🔍 À vérifier : erreurs d'inattention",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  d: {
    title: "Analyse Maths – Stress – Q22D",
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

export const Q22A = () => <AnalysePage variant="a" />;
export const Q22B = () => <AnalysePage variant="b" />;
export const Q22C = () => <AnalysePage variant="c" />;
export const Q22D = () => <AnalysePage variant="d" />;