import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse – Dyslexie",
    items: [
      "📌 Hypothèses : trouble phonologique",
      "🔍 À vérifier : conscience phonémique",
      "🎯 Adressage : Orthophoniste",
      "⚠️ Vigilance : persistance après 7 ans",
    ],
  },
  b: {
    title: "Analyse – Immaturité développementale",
    items: [
      "📌 Hypothèses : développement encore en cours",
      "🔍 À vérifier : âge, exposition",
      "🎯 Adressage : Enseignant",
      "⚠️ Vigilance : ne pas pathologiser",
    ],
  },
  c: {
    title: "Analyse – Trouble visuel",
    items: [
      "📌 Hypothèses : confusion visuelle",
      "🔍 À vérifier : acuité, poursuite oculaire",
      "🎯 Adressage : Ophtalmologue",
      "⚠️ Vigilance : éliminer trouble organique",
    ],
  },
  d: {
    title: "Analyse – Stress / surcharge cognitive",
    items: [
      "📌 Hypothèses : surcharge cognitive",
      "🔍 À vérifier : contexte scolaire",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : anxiété masquée",
    ],
  },
};

export function Q4A() {
  const d = analyses.a;
  return <ScreenLayout title={d.title}><InfoList type="hypothesis" items={d.items} /></ScreenLayout>;
}
export function Q4B() {
  const d = analyses.b;
  return <ScreenLayout title={d.title}><InfoList type="hypothesis" items={d.items} /></ScreenLayout>;
}
export function Q4C() {
  const d = analyses.c;
  return <ScreenLayout title={d.title}><InfoList type="hypothesis" items={d.items} /></ScreenLayout>;
}
export function Q4D() {
  const d = analyses.d;
  return <ScreenLayout title={d.title}><InfoList type="hypothesis" items={d.items} /></ScreenLayout>;
}