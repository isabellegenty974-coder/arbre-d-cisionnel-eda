import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const data = {
  a: {
    title: "Analyse – Dyspraxie / TDC (Q36A)",
    items: [
      "📌 Hypothèses : trouble de la planification motrice",
      "🔍 À vérifier : séquences d'actions, gestes complexes",
      "🎯 Adressage : Psychomotricien / Ergothérapeute",
      "⚠️ Vigilance : lenteur extrême",
    ],
  },
  b: {
    title: "Analyse – TDAH (Q36B)",
    items: [
      "📌 Hypothèses : difficulté à organiser les étapes",
      "🔍 À vérifier : variabilité, oublis",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  c: {
    title: "Analyse – Anxiété (Q36C)",
    items: [
      "📌 Hypothèses : blocage → désorganisation",
      "🔍 À vérifier : tension, évitement",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : surcharge émotionnelle",
    ],
  },
  d: {
    title: "Analyse – Immaturité (Q36D)",
    items: [
      "📌 Hypothèses : planification en développement",
      "🔍 À vérifier : âge, autonomie",
      "🎯 Adressage : Enseignant",
      "⚠️ Vigilance : évolution rapide possible",
    ],
  },
};

function Q36Analysis({ variant }) {
  const d = data[variant];
  return (
    <ScreenLayout title={d.title}>
      <InfoList type="hypothesis" items={d.items} />
    </ScreenLayout>
  );
}

export const Q36A = () => <Q36Analysis variant="a" />;
export const Q36B = () => <Q36Analysis variant="b" />;
export const Q36C = () => <Q36Analysis variant="c" />;
export const Q36D = () => <Q36Analysis variant="d" />;