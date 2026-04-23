import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse – Trouble attentionnel",
    items: [
      "📌 Hypothèses : distractibilité, variabilité",
      "🔍 À vérifier : fluctuations selon tâches",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : confusion avec trouble visuel",
    ],
  },
  b: {
    title: "Analyse – Trouble visuo-attentionnel",
    items: [
      "📌 Hypothèses : poursuite oculaire déficitaire, sauts de lignes",
      "🔍 À vérifier : copie, balayage visuel",
      "🎯 Adressage : Orthoptiste",
      "⚠️ Vigilance : trouble sous-dépisté",
    ],
  },
  c: {
    title: "Analyse – Trouble du langage oral",
    items: [
      "📌 Hypothèses : surcharge cognitive en lecture",
      "🔍 À vérifier : compréhension orale",
      "🎯 Adressage : Orthophoniste",
      "⚠️ Vigilance : impact sur compréhension écrite",
    ],
  },
  d: {
    title: "Analyse – Stress",
    items: [
      "📌 Hypothèses : surcharge émotionnelle",
      "🔍 À vérifier : contexte scolaire",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : symptômes somatiques",
    ],
  },
};

export function Q2A() {
  const d = analyses.a;
  return <ScreenLayout title={d.title}><InfoList type="hypothesis" items={d.items} /></ScreenLayout>;
}
export function Q2B() {
  const d = analyses.b;
  return <ScreenLayout title={d.title}><InfoList type="hypothesis" items={d.items} /></ScreenLayout>;
}
export function Q2C() {
  const d = analyses.c;
  return <ScreenLayout title={d.title}><InfoList type="hypothesis" items={d.items} /></ScreenLayout>;
}
export function Q2D() {
  const d = analyses.d;
  return <ScreenLayout title={d.title}><InfoList type="hypothesis" items={d.items} /></ScreenLayout>;
}