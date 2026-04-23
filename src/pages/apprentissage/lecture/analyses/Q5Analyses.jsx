import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse – Dyslexie",
    items: [
      "📌 Hypothèses : lecture impulsive compensatoire",
      "🔍 À vérifier : erreurs phonologiques",
      "🎯 Adressage : Orthophoniste",
      "⚠️ Vigilance : faux fluents",
    ],
  },
  b: {
    title: "Analyse – TDAH",
    items: [
      "📌 Hypothèses : impulsivité, variabilité",
      "🔍 À vérifier : erreurs d'inattention",
      "🎯 Adressage : Neuropsychologue / Pédiatre",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  c: {
    title: "Analyse – Anxiété",
    items: [
      "📌 Hypothèses : précipitation liée au stress",
      "🔍 À vérifier : signes corporels",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : pression scolaire",
    ],
  },
  d: {
    title: "Analyse – Manque d'entraînement",
    items: [
      "📌 Hypothèses : manque d'entraînement",
      "🔍 À vérifier : régularité des lectures",
      "🎯 Adressage : Enseignant",
      "⚠️ Vigilance : éviter la stigmatisation",
    ],
  },
};

export function Q5A() {
  const d = analyses.a;
  return <ScreenLayout title={d.title}><InfoList type="hypothesis" items={d.items} /></ScreenLayout>;
}
export function Q5B() {
  const d = analyses.b;
  return <ScreenLayout title={d.title}><InfoList type="hypothesis" items={d.items} /></ScreenLayout>;
}
export function Q5C() {
  const d = analyses.c;
  return <ScreenLayout title={d.title}><InfoList type="hypothesis" items={d.items} /></ScreenLayout>;
}
export function Q5D() {
  const d = analyses.d;
  return <ScreenLayout title={d.title}><InfoList type="hypothesis" items={d.items} /></ScreenLayout>;
}