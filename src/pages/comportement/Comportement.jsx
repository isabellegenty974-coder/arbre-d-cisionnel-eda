import ScreenLayout from "../../components/tree/ScreenLayout";
import NavCards from "../../components/tree/NavCards";

export default function Comportement() {
  const questions = [
    { label: "Q26 – Inhibition, évitement du regard", to: "/comportement/questions/q26" },
    { label: "Q27 – Impulsivité, coupe la parole", to: "/comportement/questions/q27" },
    { label: "Q28 – Opposition systématique", to: "/comportement/questions/q28" },
    { label: "Q29 – Pleure avant les évaluations", to: "/comportement/questions/q29" },
    { label: "Q30 – Colères soudaines", to: "/comportement/questions/q30" },
    { label: "Q31 – Absent, rêveur, lent", to: "/comportement/questions/q31" },
    { label: "Q32 – Agressivité envers les pairs", to: "/comportement/questions/q32" },
  ];

  const modules = [
    { label: "Inhibition", to: "/comportement/inhibition" },
    { label: "Impulsivité", to: "/comportement/impulsivite" },
    { label: "Anxiété", to: "/comportement/anxiete" },
    { label: "Opposition", to: "/comportement/opposition" },
  ];

  return (
    <ScreenLayout title="Difficultés comportementales / émotionnelles">
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Questions diagnostiques</h2>
          <NavCards items={questions} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Modules</h2>
          <NavCards items={modules} />
        </div>
      </div>
    </ScreenLayout>
  );
}