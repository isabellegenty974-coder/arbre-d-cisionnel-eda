import ScreenLayout from "../../components/tree/ScreenLayout";
import NavCards from "../../components/tree/NavCards";

export default function Contexte() {
  const questions = [
    { label: "Q38 – Régression après événement familial", to: "/contexte/questions/q38" },
    { label: "Q39 – Perturbé par le bruit", to: "/contexte/questions/q39" },
    { label: "Q40 – Absentéisme croissant", to: "/contexte/questions/q40" },
  ];

  const modules = [
    { label: "Événement familial", to: "/contexte/famille" },
    { label: "Climat de classe", to: "/contexte/climat-classe" },
    { label: "Changements récents", to: "/contexte/changements" },
    { label: "Absentéisme", to: "/contexte/absenteisme" },
  ];

  return (
    <ScreenLayout title="Facteurs contextuels / environnementaux">
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