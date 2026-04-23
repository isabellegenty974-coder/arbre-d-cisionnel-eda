import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const data = {
  a: {
    title: "Analyse – Trouble phonologique (Q34A)",
    items: [
      "📌 Hypothèses : difficultés d'articulation, substitutions",
      "🔍 À vérifier : intelligibilité, phonèmes spécifiques",
      "🎯 Adressage : Orthophoniste",
      "⚠️ Vigilance : impact sur lecture",
    ],
  },
  b: {
    title: "Analyse – Trouble visuel (Q34B)",
    items: [
      "📌 Hypothèses : mauvaise perception des mouvements articulatoires",
      "🔍 À vérifier : vision, poursuite",
      "🎯 Adressage : Ophtalmologue",
      "⚠️ Vigilance : éliminer trouble organique",
    ],
  },
  c: {
    title: "Analyse – Stress (Q34C)",
    items: [
      "📌 Hypothèses : tension → articulation imprécise",
      "🔍 À vérifier : contexte scolaire",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : anxiété masquée",
    ],
  },
  d: {
    title: "Analyse – TDAH (Q34D)",
    items: [
      "📌 Hypothèses : parole rapide, imprécise",
      "🔍 À vérifier : variabilité",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
};

function Q34Analysis({ variant }) {
  const d = data[variant];
  return (
    <ScreenLayout title={d.title}>
      <InfoList type="hypothesis" items={d.items} />
    </ScreenLayout>
  );
}

export const Q34A = () => <Q34Analysis variant="a" />;
export const Q34B = () => <Q34Analysis variant="b" />;
export const Q34C = () => <Q34Analysis variant="c" />;
export const Q34D = () => <Q34Analysis variant="d" />;