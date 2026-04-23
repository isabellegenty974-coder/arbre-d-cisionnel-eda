import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse Maths – Dyscalculie – Q20A",
    items: [
      "📌 Hypothèses : automatisation déficitaire",
      "🔍 À vérifier : tables, procédures, estimation",
      "🎯 Adressage : Orthophoniste",
      "⚠️ Vigilance : compensation par raisonnement",
    ],
  },
  b: {
    title: "Analyse Maths – TDAH – Q20B",
    items: [
      "📌 Hypothèses : erreurs d'inattention",
      "🔍 À vérifier : fluctuations",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  c: {
    title: "Analyse Maths – Anxiété – Q20C",
    items: [
      "📌 Hypothèses : blocage en situation de rapidité",
      "🔍 À vérifier : tension, évitement",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : pression évaluative",
    ],
  },
  d: {
    title: "Analyse Maths – Manque entraînement – Q20D",
    items: [
      "📌 Hypothèses : automatisation non travaillée",
      "🔍 À vérifier : régularité des exercices",
      "🎯 Adressage : Enseignant",
      "⚠️ Vigilance : éviter la culpabilisation",
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

export const Q20A = () => <AnalysePage variant="a" />;
export const Q20B = () => <AnalysePage variant="b" />;
export const Q20C = () => <AnalysePage variant="c" />;
export const Q20D = () => <AnalysePage variant="d" />;