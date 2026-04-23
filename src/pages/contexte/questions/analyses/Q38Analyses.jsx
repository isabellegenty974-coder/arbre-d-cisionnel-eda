import ScreenLayout from "../../../../components/tree/ScreenLayout";
import InfoList from "../../../../components/tree/InfoList";

const data = {
  a: {
    title: "Analyse – Stress post-événement (Q38A)",
    items: [
      "📌 Hypothèses : réaction émotionnelle à un changement majeur",
      "🔍 À vérifier : sommeil, appétit, irritabilité, évitement",
      "🎯 Adressage : Psychologue scolaire / CMP",
      "⚠️ Vigilance : risque de traumatisme psychique",
    ],
  },
  b: {
    title: "Analyse – Anxiété (Q38B)",
    items: [
      "📌 Hypothèses : inquiétudes liées à l'événement",
      "🔍 À vérifier : tension, ruminations",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : anxiété masquée",
    ],
  },
  c: {
    title: "Analyse – TDAH (Q38C)",
    items: [
      "📌 Hypothèses : aggravation d'un trouble attentionnel préexistant",
      "🔍 À vérifier : variabilité, impulsivité",
      "🎯 Adressage : Neuropsychologue / Pédiatre",
      "⚠️ Vigilance : diagnostic médical",
    ],
  },
  d: {
    title: "Analyse – Opposition (Q38D)",
    items: [
      "📌 Hypothèses : réaction comportementale au stress",
      "🔍 À vérifier : contexte familial, cadre",
      "🎯 Adressage : Psychologue scolaire",
      "⚠️ Vigilance : ne pas confondre avec trouble oppositionnel",
    ],
  },
};

function Q38Analysis({ variant }) {
  const d = data[variant];
  return (
    <ScreenLayout title={d.title}>
      <InfoList type="hypothesis" items={d.items} />
    </ScreenLayout>
  );
}

export const Q38A = () => <Q38Analysis variant="a" />;
export const Q38B = () => <Q38Analysis variant="b" />;
export const Q38C = () => <Q38Analysis variant="c" />;
export const Q38D = () => <Q38Analysis variant="d" />;