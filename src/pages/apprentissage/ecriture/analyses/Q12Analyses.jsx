import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse Écriture – Dyspraxie – Q12A",
    items: [
      "📌 Hypothèses : trouble de la planification motrice",
      "🔍 À vérifier : gestes fins, organisation spatiale",
      "🎯 Adressage : Psychomotricien / Ergothérapeute",
      "⚠️ Vigilance : lenteur extrême",
    ],
  },
  b: {
    title: "Analyse Écriture – TDAH – Q12B",
    items: [
      "📌 Hypothèses : impulsivité graphique, variabilité",
      "🔍 À vérifier : fluctuations, erreurs d'inattention",
      "🎯 Adressage : Neuropsychologue",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  c: {
    title: "Analyse Écriture – Dysgraphie – Q12C",
    items: [
      "📌 Hypothèses : geste mal automatisé",
      "🔍 À vérifier : pression, tenue, posture",
      "🎯 Adressage : Psychomotricien",
      "⚠️ Vigilance : douleur associée",
    ],
  },
  d: {
    title: "Analyse Écriture – Stress – Q12D",
    items: [
      "📌 Hypothèses : crispation liée à l'anxiété",
      "🔍 À vérifier : contexte scolaire",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : surcharge émotionnelle",
    ],
  },
};

export function Q12A() { return <ScreenLayout title={analyses.a.title}><InfoList type="hypothesis" items={analyses.a.items} /></ScreenLayout>; }
export function Q12B() { return <ScreenLayout title={analyses.b.title}><InfoList type="hypothesis" items={analyses.b.items} /></ScreenLayout>; }
export function Q12C() { return <ScreenLayout title={analyses.c.title}><InfoList type="hypothesis" items={analyses.c.items} /></ScreenLayout>; }
export function Q12D() { return <ScreenLayout title={analyses.d.title}><InfoList type="hypothesis" items={analyses.d.items} /></ScreenLayout>; }