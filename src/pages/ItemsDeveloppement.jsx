import { Activity, MessageSquare, Eye } from "lucide-react";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import ItemCard from "@/components/ItemCard";

const FICHES = [
  {
    icon: Activity,
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
    title: "Motricité",
    description: "Habiletés motrices fines et globales (coordination, équilibre).",
    signes: [
      "Maladresse dans les gestes fins ou coordination pauvre",
      "Difficultés d'équilibre ou chutes fréquentes",
    ],
    pistes: "Bilan en psychomotricité. Explorer dyspraxie développementale si besoin.",
  },
  {
    icon: MessageSquare,
    color: "bg-cyan-50 border-cyan-200",
    iconColor: "text-cyan-600",
    title: "Langage oral",
    description: "Compréhension et expression verbale.",
    signes: [
      "Vocabulaire pauvre ou phrases simples",
      "Trouble d'articulation ou compréhension limitée",
    ],
    pistes: "Bilan orthophonique recommandé. Évaluer lexical et phonologie.",
  },
  {
    icon: Eye,
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-500",
    title: "Attention",
    description: "Concentration et maintien de l'effort.",
    signes: [
      "Distraction rapide, travail inachevé",
      "Difficulté à suivre des consignes longues",
    ],
    pistes: "Évaluer fonctions attentionnelles. Peut relever du TDAH. Bilan neuropsychologique utile.",
  },
];

export default function ItemsDeveloppement() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <HamburgerMenu />
      <ScreenLayout title="🌱 Développement" subtitle="Axes développementaux clés">
        <div className="space-y-4">
          {FICHES.map((fiche, i) => (
            <ItemCard key={fiche.title} {...fiche} index={i} />
          ))}
        </div>
      </ScreenLayout>
    </div>
  );
}