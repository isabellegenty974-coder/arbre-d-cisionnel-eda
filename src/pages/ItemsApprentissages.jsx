import { BookOpen, PenLine, Calculator } from "lucide-react";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import ItemCard from "@/components/ItemCard";

const FICHES = [
  {
    icon: BookOpen,
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-500",
    title: "Lecture",
    description: "Capacité à déchiffrer et comprendre un texte.",
    signes: [
      "Lecture lente, hésitante ou syllabée",
      "Difficultés de compréhension",
    ],
    pistes: "Bilan orthophonique recommandé. Explorer conscience phonologique et automatismes.",
  },
  {
    icon: PenLine,
    color: "bg-violet-50 border-violet-200",
    iconColor: "text-violet-500",
    title: "Écriture",
    description: "Maîtrise du geste graphique et de l'orthographe.",
    signes: [
      "Écriture lente ou douloureuse",
      "Erreurs orthographiques fréquentes",
    ],
    pistes: "Évaluer motricité fine et automatismes. Dysgraphie/dysorthographie à explorer.",
  },
  {
    icon: Calculator,
    color: "bg-orange-50 border-orange-200",
    iconColor: "text-orange-500",
    title: "Mathématiques",
    description: "Compréhension des nombres et opérations.",
    signes: [
      "Difficulté en dénombrement ou numération",
      "Erreurs dans les opérations simples",
    ],
    pistes: "Bilan neuropsychologique si persistance. Évaluer capacités logico-mathématiques.",
  },
];

export default function ItemsApprentissages() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <HamburgerMenu />
      <ScreenLayout title="📚 Apprentissages" subtitle="Domaines clés pour l'apprentissage">
        <div className="space-y-4">
          {FICHES.map((fiche, i) => (
            <ItemCard key={fiche.title} {...fiche} index={i} />
          ))}
        </div>
      </ScreenLayout>
    </div>
  );
}