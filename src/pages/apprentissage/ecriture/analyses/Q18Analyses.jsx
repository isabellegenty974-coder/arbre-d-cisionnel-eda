import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse Écriture – Dyspraxie – Q18A",
    items: [
      "📌 Hypothèses : trouble de l'organisation spatiale",
      "🔍 À vérifier : repérage, alignement",
      "🎯 Adressage : Psychomotricien",
      "⚠️ Vigilance : lenteur extrême",
    ],
  },
  b: {
    title: "Analyse Écriture – TDAH – Q18B",
    items: [
      "📌 Hypothèses : écriture impulsive",
      "🔍 À vérifier : variabilité",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  c: {
    title: "Analyse Écriture – Dysgraphie – Q18C",
    items: [
      "📌 Hypothèses : geste non maîtrisé",
      "🔍 À vérifier : pression, tenue",
      "🎯 Adressage : Psychomotricien",
      "⚠️ Vigilance : douleur",
    ],
  },
  d: {
    title: "Analyse Écriture – Stress – Q18D",
    items: [
      "📌 Hypothèses : agitation liée à l'anxiété",
      "🔍 À vérifier : contexte scolaire",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : surcharge émotionnelle",
    ],
  },
};

export function Q18A() { return <ScreenLayout title={analyses.a.title}><InfoList type="hypothesis" items={analyses.a.items} /></ScreenLayout>; }
export function Q18B() { return <ScreenLayout title={analyses.b.title}><InfoList type="hypothesis" items={analyses.b.items} /></ScreenLayout>; }
export function Q18C() { return <ScreenLayout title={analyses.c.title}><InfoList type="hypothesis" items={analyses.c.items} /></ScreenLayout>; }
export function Q18D() { return <ScreenLayout title={analyses.d.title}><InfoList type="hypothesis" items={analyses.d.items} /></ScreenLayout>; }