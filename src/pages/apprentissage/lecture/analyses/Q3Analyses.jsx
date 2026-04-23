import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse – Dyslexie",
    items: [
      "📌 Hypothèses : décodage faible → surcharge cognitive",
      "🔍 À vérifier : fluence, erreurs phonologiques",
      "🎯 Adressage : Orthophoniste",
      "⚠️ Vigilance : compensation orale",
    ],
  },
  b: {
    title: "Analyse – Dysorthographie",
    items: [
      "📌 Hypothèses : orthographe faible → compréhension altérée",
      "🔍 À vérifier : erreurs phonologiques vs lexicales",
      "🎯 Adressage : Orthophoniste",
      "⚠️ Vigilance : double trouble",
    ],
  },
  c: {
    title: "Analyse – Trouble visuo-attentionnel",
    items: [
      "📌 Hypothèses : difficulté à suivre le texte",
      "🔍 À vérifier : copie, balayage",
      "🎯 Adressage : Orthoptiste",
      "⚠️ Vigilance : confusion avec dyslexie",
    ],
  },
  d: {
    title: "Analyse – Déficit de vocabulaire",
    items: [
      "📌 Hypothèses : déficit lexical",
      "🔍 À vérifier : compréhension orale",
      "🎯 Adressage : Orthophoniste",
      "⚠️ Vigilance : contexte socio-linguistique",
    ],
  },
};

export function Q3A() {
  const d = analyses.a;
  return <ScreenLayout title={d.title}><InfoList type="hypothesis" items={d.items} /></ScreenLayout>;
}
export function Q3B() {
  const d = analyses.b;
  return <ScreenLayout title={d.title}><InfoList type="hypothesis" items={d.items} /></ScreenLayout>;
}
export function Q3C() {
  const d = analyses.c;
  return <ScreenLayout title={d.title}><InfoList type="hypothesis" items={d.items} /></ScreenLayout>;
}
export function Q3D() {
  const d = analyses.d;
  return <ScreenLayout title={d.title}><InfoList type="hypothesis" items={d.items} /></ScreenLayout>;
}