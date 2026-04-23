import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const data = {
  a: {
    title: "Analyse – Trouble du langage oral (Q33A)",
    items: [
      "📌 Hypothèses : déficit lexical, syntaxique, compréhension limitée",
      "🔍 À vérifier : phrases, articulation, compréhension implicite",
      "🎯 Adressage : Orthophoniste",
      "⚠️ Vigilance : impact sur lecture et problèmes écrits",
    ],
  },
  b: {
    title: "Analyse – TDAH (Q33B)",
    items: [
      "📌 Hypothèses : langage décousu, manque de précision",
      "🔍 À vérifier : variabilité, distractibilité",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  c: {
    title: "Analyse – Immaturité (Q33C)",
    items: [
      "📌 Hypothèses : développement langagier en cours",
      "🔍 À vérifier : âge, exposition au langage",
      "🎯 Adressage : Enseignant / ATSEM",
      "⚠️ Vigilance : évolution rapide possible",
    ],
  },
  d: {
    title: "Analyse – Stress (Q33D)",
    items: [
      "📌 Hypothèses : inhibition verbale",
      "🔍 À vérifier : contexte familial, tension",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : anxiété masquée",
    ],
  },
};

function Q33Analysis({ variant }) {
  const d = data[variant];
  return (
    <ScreenLayout title={d.title}>
      <InfoList type="hypothesis" items={d.items} />
    </ScreenLayout>
  );
}

export const Q33A = () => <Q33Analysis variant="a" />;
export const Q33B = () => <Q33Analysis variant="b" />;
export const Q33C = () => <Q33Analysis variant="c" />;
export const Q33D = () => <Q33Analysis variant="d" />;