import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const data = {
  a: {
    title: "Analyse – TDAH (Q37A)",
    items: [
      "📌 Hypothèses : variabilité, distractibilité",
      "🔍 À vérifier : fluctuations selon tâches",
      "🎯 Adressage : Neuropsychologue / Pédiatre",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  b: {
    title: "Analyse – Anxiété (Q37B)",
    items: [
      "📌 Hypothèses : attention captée par les préoccupations",
      "🔍 À vérifier : tension, évitement",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : anxiété masquée",
    ],
  },
  c: {
    title: "Analyse – Immaturité (Q37C)",
    items: [
      "📌 Hypothèses : attention en construction",
      "🔍 À vérifier : âge, contexte",
      "🎯 Adressage : Enseignant",
      "⚠️ Vigilance : évolution rapide possible",
    ],
  },
  d: {
    title: "Analyse – Stress (Q37D)",
    items: [
      "📌 Hypothèses : surcharge émotionnelle",
      "🔍 À vérifier : contexte familial",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : symptômes somatiques",
    ],
  },
};

function Q37Analysis({ variant }) {
  const d = data[variant];
  return (
    <ScreenLayout title={d.title}>
      <InfoList type="hypothesis" items={d.items} />
    </ScreenLayout>
  );
}

export const Q37A = () => <Q37Analysis variant="a" />;
export const Q37B = () => <Q37Analysis variant="b" />;
export const Q37C = () => <Q37Analysis variant="c" />;
export const Q37D = () => <Q37Analysis variant="d" />;