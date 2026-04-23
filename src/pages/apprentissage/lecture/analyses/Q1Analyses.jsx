import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse – Dyslexie développementale",
    items: [
      "📌 Hypothèses : trouble phonologique, automatisation faible",
      "🔍 À vérifier : fluence, erreurs phonémiques, conscience phonologique",
      "🎯 Adressage : Orthophoniste",
      "⚠️ Vigilance : estime de soi scolaire",
    ],
  },
  b: {
    title: "Analyse – Manque d'entraînement",
    items: [
      "📌 Hypothèses : exposition limitée, manque de pratique",
      "🔍 À vérifier : habitudes de lecture, contexte familial",
      "🎯 Adressage : Enseignant / RASED",
      "⚠️ Vigilance : éviter la pathologisation",
    ],
  },
  c: {
    title: "Analyse – Anxiété de performance",
    items: [
      "📌 Hypothèses : anxiété de performance, peur de l'erreur",
      "🔍 À vérifier : signes corporels, évitement",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : pression scolaire",
    ],
  },
  d: {
    title: "Analyse – Trouble attentionnel",
    items: [
      "📌 Hypothèses : distractibilité, variabilité",
      "🔍 À vérifier : fluctuations, erreurs d'inattention",
      "🎯 Adressage : Neuropsychologue / Pédiatre",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
};

export function Q1A() {
  const d = analyses.a;
  return <ScreenLayout title={d.title}><InfoList type="hypothesis" items={d.items} /></ScreenLayout>;
}
export function Q1B() {
  const d = analyses.b;
  return <ScreenLayout title={d.title}><InfoList type="hypothesis" items={d.items} /></ScreenLayout>;
}
export function Q1C() {
  const d = analyses.c;
  return <ScreenLayout title={d.title}><InfoList type="hypothesis" items={d.items} /></ScreenLayout>;
}
export function Q1D() {
  const d = analyses.d;
  return <ScreenLayout title={d.title}><InfoList type="hypothesis" items={d.items} /></ScreenLayout>;
}