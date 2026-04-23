import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const analyses = {
  a: {
    title: "Analyse Écriture – Dysgraphie – Q11A",
    items: [
      "📌 Hypothèses : trouble graphomoteur, tension, lenteur, douleur",
      "🔍 À vérifier : posture, tenue du crayon, pression, motricité fine",
      "🎯 Adressage : Psychomotricien / Ergothérapeute",
      "⚠️ Vigilance : ne pas confondre avec anxiété",
    ],
  },
  b: {
    title: "Analyse Écriture – Anxiété – Q11B",
    items: [
      "📌 Hypothèses : peur de mal faire, crispation",
      "🔍 À vérifier : signes corporels, évitement",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : contexte évaluatif",
    ],
  },
  c: {
    title: "Analyse Écriture – Manque entraînement – Q11C",
    items: [
      "📌 Hypothèses : faible exposition à l'écriture",
      "🔍 À vérifier : habitudes, rythme de travail",
      "🎯 Adressage : Enseignant",
      "⚠️ Vigilance : éviter la stigmatisation",
    ],
  },
  d: {
    title: "Analyse Écriture – Trouble visuel – Q11D",
    items: [
      "📌 Hypothèses : inconfort visuel, mauvaise accommodation",
      "🔍 À vérifier : distance, plissement des yeux",
      "🎯 Adressage : Ophtalmologue",
      "⚠️ Vigilance : éliminer trouble organique",
    ],
  },
};

export function Q11A() { return <ScreenLayout title={analyses.a.title}><InfoList type="hypothesis" items={analyses.a.items} /></ScreenLayout>; }
export function Q11B() { return <ScreenLayout title={analyses.b.title}><InfoList type="hypothesis" items={analyses.b.items} /></ScreenLayout>; }
export function Q11C() { return <ScreenLayout title={analyses.c.title}><InfoList type="hypothesis" items={analyses.c.items} /></ScreenLayout>; }
export function Q11D() { return <ScreenLayout title={analyses.d.title}><InfoList type="hypothesis" items={analyses.d.items} /></ScreenLayout>; }