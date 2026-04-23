import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse Écriture – Dysorthographie – Q14A",
    items: [
      "📌 Hypothèses : trouble spécifique de l'orthographe",
      "🔍 À vérifier : erreurs phonologiques vs lexicales",
      "🎯 Adressage : Orthophoniste",
      "⚠️ Vigilance : double trouble possible",
    ],
  },
  b: {
    title: "Analyse Écriture – Dyslexie – Q14B",
    items: [
      "📌 Hypothèses : trouble du décodage impactant l'orthographe",
      "🔍 À vérifier : fluence, erreurs phonémiques",
      "🎯 Adressage : Orthophoniste",
      "⚠️ Vigilance : surcharge cognitive",
    ],
  },
  c: {
    title: "Analyse Écriture – TDAH – Q14C",
    items: [
      "📌 Hypothèses : erreurs d'inattention",
      "🔍 À vérifier : variabilité",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  d: {
    title: "Analyse Écriture – Stress – Q14D",
    items: [
      "📌 Hypothèses : précipitation liée à l'anxiété",
      "🔍 À vérifier : contexte évaluatif",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : pression scolaire",
    ],
  },
};

export function Q14A() { return <ScreenLayout title={analyses.a.title}><InfoList type="hypothesis" items={analyses.a.items} /></ScreenLayout>; }
export function Q14B() { return <ScreenLayout title={analyses.b.title}><InfoList type="hypothesis" items={analyses.b.items} /></ScreenLayout>; }
export function Q14C() { return <ScreenLayout title={analyses.c.title}><InfoList type="hypothesis" items={analyses.c.items} /></ScreenLayout>; }
export function Q14D() { return <ScreenLayout title={analyses.d.title}><InfoList type="hypothesis" items={analyses.d.items} /></ScreenLayout>; }