import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse Écriture – Anxiété – Q17A",
    items: [
      "📌 Hypothèses : tension interne",
      "🔍 À vérifier : crispation, lenteur",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : perfectionnisme",
    ],
  },
  b: {
    title: "Analyse Écriture – Dysgraphie – Q17B",
    items: [
      "📌 Hypothèses : geste trop contracté",
      "🔍 À vérifier : pression, posture",
      "🎯 Adressage : Psychomotricien",
      "⚠️ Vigilance : douleur",
    ],
  },
  c: {
    title: "Analyse Écriture – TDAH – Q17C",
    items: [
      "📌 Hypothèses : écriture variable",
      "🔍 À vérifier : fluctuations",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  d: {
    title: "Analyse Écriture – Trouble visuel – Q17D",
    items: [
      "📌 Hypothèses : inconfort visuel",
      "🔍 À vérifier : distance, clignements",
      "🎯 Adressage : Ophtalmologue",
      "⚠️ Vigilance : éliminer trouble organique",
    ],
  },
};

export function Q17A() { return <ScreenLayout title={analyses.a.title}><InfoList type="hypothesis" items={analyses.a.items} /></ScreenLayout>; }
export function Q17B() { return <ScreenLayout title={analyses.b.title}><InfoList type="hypothesis" items={analyses.b.items} /></ScreenLayout>; }
export function Q17C() { return <ScreenLayout title={analyses.c.title}><InfoList type="hypothesis" items={analyses.c.items} /></ScreenLayout>; }
export function Q17D() { return <ScreenLayout title={analyses.d.title}><InfoList type="hypothesis" items={analyses.d.items} /></ScreenLayout>; }