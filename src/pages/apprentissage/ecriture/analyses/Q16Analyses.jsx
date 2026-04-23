import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse Écriture – Traitement information – Q16A",
    items: [
      "📌 Hypothèses : lenteur cognitive",
      "🔍 À vérifier : vitesse de traitement",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : surcharge cognitive",
    ],
  },
  b: {
    title: "Analyse Écriture – Dysgraphie – Q16B",
    items: [
      "📌 Hypothèses : geste non automatisé",
      "🔍 À vérifier : posture, pression",
      "🎯 Adressage : Psychomotricien",
      "⚠️ Vigilance : douleur associée",
    ],
  },
  c: {
    title: "Analyse Écriture – Anxiété – Q16C",
    items: [
      "📌 Hypothèses : perfectionnisme anxieux",
      "🔍 À vérifier : effacement, hésitations",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : rigidité",
    ],
  },
  d: {
    title: "Analyse Écriture – TDAH – Q16D",
    items: [
      "📌 Hypothèses : lenteur liée à l'inattention",
      "🔍 À vérifier : variabilité",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
};

export function Q16A() { return <ScreenLayout title={analyses.a.title}><InfoList type="hypothesis" items={analyses.a.items} /></ScreenLayout>; }
export function Q16B() { return <ScreenLayout title={analyses.b.title}><InfoList type="hypothesis" items={analyses.b.items} /></ScreenLayout>; }
export function Q16C() { return <ScreenLayout title={analyses.c.title}><InfoList type="hypothesis" items={analyses.c.items} /></ScreenLayout>; }
export function Q16D() { return <ScreenLayout title={analyses.d.title}><InfoList type="hypothesis" items={analyses.d.items} /></ScreenLayout>; }