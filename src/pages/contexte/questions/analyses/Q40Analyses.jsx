import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const data = {
  a: {
    title: "Analyse – Anxiété scolaire (Q40A)",
    items: [
      "📌 Hypothèses : évitement anxieux, peur de l'école",
      "🔍 À vérifier : plaintes somatiques, tension, isolement",
      "🎯 Adressage : Psychologue scolaire / CMP",
      "⚠️ Vigilance : risque de phobie scolaire",
    ],
  },
  b: {
    title: "Analyse – Désengagement (Q40B)",
    items: [
      "📌 Hypothèses : perte de motivation, rupture scolaire",
      "🔍 À vérifier : intérêt, participation, relations aux pairs",
      "🎯 Adressage : Enseignant / CPE",
      "⚠️ Vigilance : décrochage latent",
    ],
  },
  c: {
    title: "Analyse – Conflit familial (Q40C)",
    items: [
      "📌 Hypothèses : tensions à la maison → évitement",
      "🔍 À vérifier : changements récents, discours de l'enfant",
      "🎯 Adressage : Psychologue scolaire / Travailleur social",
      "⚠️ Vigilance : situations sensibles",
    ],
  },
  d: {
    title: "Analyse – TDAH (Q40D)",
    items: [
      "📌 Hypothèses : difficultés organisationnelles → absences répétées",
      "🔍 À vérifier : oublis, routines du matin",
      "🎯 Adressage : Neuropsychologue / Pédiatre",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
};

function Q40Analysis({ variant }) {
  const d = data[variant];
  return (
    <ScreenLayout title={d.title}>
      <InfoList type="hypothesis" items={d.items} />
    </ScreenLayout>
  );
}

export const Q40A = () => <Q40Analysis variant="a" />;
export const Q40B = () => <Q40Analysis variant="b" />;
export const Q40C = () => <Q40Analysis variant="c" />;
export const Q40D = () => <Q40Analysis variant="d" />;