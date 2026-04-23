import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse Écriture – Dysorthographie – Q15A",
    items: [
      "📌 Hypothèses : trouble spécifique de l'orthographe",
      "🔍 À vérifier : erreurs phonologiques, lexicales",
      "🎯 Adressage : Orthophoniste",
      "⚠️ Vigilance : compensation orale",
    ],
  },
  b: {
    title: "Analyse Écriture – Trouble visuel – Q15B",
    items: [
      "📌 Hypothèses : confusion visuelle",
      "🔍 À vérifier : copie, repérage spatial",
      "🎯 Adressage : Orthoptiste",
      "⚠️ Vigilance : éliminer trouble organique",
    ],
  },
  c: {
    title: "Analyse Écriture – TDAH – Q15C",
    items: [
      "📌 Hypothèses : erreurs d'inattention",
      "🔍 À vérifier : variabilité",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  d: {
    title: "Analyse Écriture – Stress – Q15D",
    items: [
      "📌 Hypothèses : surcharge émotionnelle",
      "🔍 À vérifier : contexte scolaire",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : anxiété masquée",
    ],
  },
};

export function Q15A() { return <ScreenLayout title={analyses.a.title}><InfoList type="hypothesis" items={analyses.a.items} /></ScreenLayout>; }
export function Q15B() { return <ScreenLayout title={analyses.b.title}><InfoList type="hypothesis" items={analyses.b.items} /></ScreenLayout>; }
export function Q15C() { return <ScreenLayout title={analyses.c.title}><InfoList type="hypothesis" items={analyses.c.items} /></ScreenLayout>; }
export function Q15D() { return <ScreenLayout title={analyses.d.title}><InfoList type="hypothesis" items={analyses.d.items} /></ScreenLayout>; }