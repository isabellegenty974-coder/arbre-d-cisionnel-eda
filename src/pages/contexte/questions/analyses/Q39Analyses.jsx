import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const data = {
  a: {
    title: "Analyse – Hypersensibilité sensorielle (Q39A)",
    items: [
      "📌 Hypothèses : sensibilité accrue aux stimuli auditifs",
      "🔍 À vérifier : réactions au bruit, évitement, agitation",
      "🎯 Adressage : Psychologue scolaire / Orthophoniste (intégration sensorielle)",
      "⚠️ Vigilance : TSA possible",
    ],
  },
  b: {
    title: "Analyse – Anxiété (Q39B)",
    items: [
      "📌 Hypothèses : hypervigilance anxieuse",
      "🔍 À vérifier : tension, ruminations",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : anxiété masquée",
    ],
  },
  c: {
    title: "Analyse – TDAH (Q39C)",
    items: [
      "📌 Hypothèses : distractibilité accrue",
      "🔍 À vérifier : variabilité, agitation",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  d: {
    title: "Analyse – Stress (Q39D)",
    items: [
      "📌 Hypothèses : surcharge émotionnelle",
      "🔍 À vérifier : contexte familial, fatigue",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : symptômes somatiques",
    ],
  },
};

function Q39Analysis({ variant }) {
  const d = data[variant];
  return (
    <ScreenLayout title={d.title}>
      <InfoList type="hypothesis" items={d.items} />
    </ScreenLayout>
  );
}

export const Q39A = () => <Q39Analysis variant="a" />;
export const Q39B = () => <Q39Analysis variant="b" />;
export const Q39C = () => <Q39Analysis variant="c" />;
export const Q39D = () => <Q39Analysis variant="d" />;