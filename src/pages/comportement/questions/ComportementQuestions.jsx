import ScreenLayout from "../../../components/tree/ScreenLayout";
import NavCards from "../../../components/tree/NavCards";

export default function ComportementQuestions() {
  return (
    <ScreenLayout
      title="🌧️ Questions diagnostiques – Comportement"
      subtitle="Sélectionnez la situation observée chez l'élève."
    >
      <NavCards
        items={[
          { label: "Q26 – Inhibition, évitement du regard", to: "/comportement/questions/q26" },
          { label: "Q27 – Impulsivité, coupe la parole", to: "/comportement/questions/q27" },
          { label: "Q28 – Opposition systématique", to: "/comportement/questions/q28" },
          { label: "Q29 – Pleure avant les évaluations", to: "/comportement/questions/q29" },
          { label: "Q30 – Colères soudaines", to: "/comportement/questions/q30" },
          { label: "Q31 – Absent, rêveur, lent", to: "/comportement/questions/q31" },
          { label: "Q32 – Agressivité envers les pairs", to: "/comportement/questions/q32" },
        ]}
      />
    </ScreenLayout>
  );
}