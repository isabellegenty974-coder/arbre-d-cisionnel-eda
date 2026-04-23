import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const data = {
  a: {
    title: "Analyse – Dyspraxie / TDC (Q35A)",
    items: [
      "📌 Hypothèses : trouble de la coordination motrice",
      "🔍 À vérifier : gestes fins, découpage, habillage",
      "🎯 Adressage : Psychomotricien / Ergothérapeute",
      "⚠️ Vigilance : lenteur extrême",
    ],
  },
  b: {
    title: "Analyse – TDAH (Q35B)",
    items: [
      "📌 Hypothèses : maladresse liée à l'impulsivité",
      "🔍 À vérifier : variabilité",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  c: {
    title: "Analyse – Immaturité (Q35C)",
    items: [
      "📌 Hypothèses : développement moteur en cours",
      "🔍 À vérifier : âge, expériences motrices",
      "🎯 Adressage : Enseignant / ATSEM",
      "⚠️ Vigilance : évolution rapide possible",
    ],
  },
  d: {
    title: "Analyse – Stress (Q35D)",
    items: [
      "📌 Hypothèses : crispation → maladresse",
      "🔍 À vérifier : contexte scolaire",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : anxiété somatisée",
    ],
  },
};

function Q35Analysis({ variant }) {
  const d = data[variant];
  return (
    <ScreenLayout title={d.title}>
      <InfoList type="hypothesis" items={d.items} />
    </ScreenLayout>
  );
}

export const Q35A = () => <Q35Analysis variant="a" />;
export const Q35B = () => <Q35Analysis variant="b" />;
export const Q35C = () => <Q35Analysis variant="c" />;
export const Q35D = () => <Q35Analysis variant="d" />;