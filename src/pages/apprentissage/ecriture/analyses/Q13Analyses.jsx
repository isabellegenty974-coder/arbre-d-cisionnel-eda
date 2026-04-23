import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse Écriture – Dysgraphie – Q13A",
    items: [
      "📌 Hypothèses : douleur liée au geste",
      "🔍 À vérifier : crispation, pression excessive",
      "🎯 Adressage : Psychomotricien",
      "⚠️ Vigilance : éviter l'interprétation comportementale",
    ],
  },
  b: {
    title: "Analyse Écriture – Opposition – Q13B",
    items: [
      "📌 Hypothèses : refus lié au cadre",
      "🔍 À vérifier : contexte relationnel",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : ne pas confondre avec douleur réelle",
    ],
  },
  c: {
    title: "Analyse Écriture – Anxiété – Q13C",
    items: [
      "📌 Hypothèses : peur de l'échec",
      "🔍 À vérifier : évitement, tension",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : pression familiale",
    ],
  },
  d: {
    title: "Analyse Écriture – TDAH – Q13D",
    items: [
      "📌 Hypothèses : difficulté à maintenir l'effort",
      "🔍 À vérifier : variabilité, agitation",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
};

export function Q13A() { return <ScreenLayout title={analyses.a.title}><InfoList type="hypothesis" items={analyses.a.items} /></ScreenLayout>; }
export function Q13B() { return <ScreenLayout title={analyses.b.title}><InfoList type="hypothesis" items={analyses.b.items} /></ScreenLayout>; }
export function Q13C() { return <ScreenLayout title={analyses.c.title}><InfoList type="hypothesis" items={analyses.c.items} /></ScreenLayout>; }
export function Q13D() { return <ScreenLayout title={analyses.d.title}><InfoList type="hypothesis" items={analyses.d.items} /></ScreenLayout>; }