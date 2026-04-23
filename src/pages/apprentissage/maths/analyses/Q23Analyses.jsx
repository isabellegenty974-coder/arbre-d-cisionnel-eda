import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse Maths – Dyscalculie – Q23A",
    items: [
      "📌 Hypothèses : confusion symbolique",
      "🔍 À vérifier : reconnaissance des signes",
      "🎯 Adressage : Orthophoniste",
      "⚠️ Vigilance : automatisation faible",
    ],
  },
  b: {
    title: "Analyse Maths – TDAH – Q23B",
    items: [
      "📌 Hypothèses : erreurs d'inattention",
      "🔍 À vérifier : variabilité",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  c: {
    title: "Analyse Maths – Trouble visuel – Q23C",
    items: [
      "📌 Hypothèses : confusion visuelle",
      "🔍 À vérifier : acuité, poursuite",
      "🎯 Adressage : Ophtalmologue / Orthoptiste",
      "⚠️ Vigilance : éliminer trouble organique",
    ],
  },
  d: {
    title: "Analyse Maths – Stress – Q23D",
    items: [
      "📌 Hypothèses : précipitation",
      "🔍 À vérifier : contexte évaluatif",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : anxiété masquée",
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

export const Q23A = () => <AnalysePage variant="a" />;
export const Q23B = () => <AnalysePage variant="b" />;
export const Q23C = () => <AnalysePage variant="c" />;
export const Q23D = () => <AnalysePage variant="d" />;