import { Home, Calendar, TrendingDown } from "lucide-react";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import ItemCard from "@/components/ItemCard";

const FICHES = [
  {
    icon: Home,
    color: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-600",
    title: "Contexte familial",
    description: "Environnement familial et soutien scolaire.",
    signes: [
      "Instabilité familiale récente ou précarité",
      "Manque de soutien aux devoirs et à la scolarité",
    ],
    pistes: "Accompagnement social/familial. Collaborer avec parents pour mieux comprendre la situation.",
  },
  {
    icon: Calendar,
    color: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-500",
    title: "Absentéisme scolaire",
    description: "Parcours scolaire chaotique créant des lacunes importantes.",
    signes: [
      "Absences répétées ou changements d'école fréquents",
      "Retard scolaire cumulé",
    ],
    pistes: "Évaluer les lacunes réelles. Mettre en place soutien individualisé (PPRE, PAP).",
  },
  {
    icon: TrendingDown,
    color: "bg-red-50 border-red-200",
    iconColor: "text-red-500",
    title: "Changements / Stress",
    description: "Événements de vie fragilisant l'élève à court terme.",
    signes: [
      "Déménagement, changement d'école récent",
      "Événement stressant (deuil, harcèlement...)",
    ],
    pistes: "Soutien psychologique adapté. Adapter exigences scolaires sur le court terme.",
  },
];

export default function ItemsContexte() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <HamburgerMenu />
      <ScreenLayout title="🏠 Contexte" subtitle="Facteurs contextuels importants">
        <div className="space-y-4">
          {FICHES.map((fiche, i) => (
            <ItemCard key={fiche.title} {...fiche} index={i} />
          ))}
        </div>
      </ScreenLayout>
    </div>
  );
}