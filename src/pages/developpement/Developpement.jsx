import ScreenLayout from "../../components/tree/ScreenLayout";
import NavCards from "../../components/tree/NavCards";

export default function Developpement() {
  const questions = [
    { label: "Q33 – Langage oral pauvre", to: "/developpement/questions/q33" },
    { label: "Q34 – Articulation floue", to: "/developpement/questions/q34" },
    { label: "Q35 – Motricité fine", to: "/developpement/questions/q35" },
    { label: "Q36 – Planification des actions", to: "/developpement/questions/q36" },
    { label: "Q37 – Attention fluctuante", to: "/developpement/questions/q37" },
  ];

  const modules = [
    { label: "Langage oral", to: "/developpement/langage-oral" },
    { label: "Motricité", to: "/developpement/motricite" },
    { label: "Attention", to: "/developpement/attention" },
    { label: "Interactions sociales", to: "/developpement/interactions" },
  ];

  return (
    <ScreenLayout title="Difficultés liées au développement">
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