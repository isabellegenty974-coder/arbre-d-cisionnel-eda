import { Zap, Heart, ShieldAlert } from "lucide-react";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import ItemCard from "@/components/ItemCard";

const FICHES = [
  {
    icon: Zap,
    color: "bg-rose-50 border-rose-200",
    iconColor: "text-rose-500",
    title: "Hyperactivité / Impulsivité",
    description: "Agitation motrice et difficultés d'inhibition persistantes.",
    signes: [
      "Ne peut rester assis, très agité",
      "Coupe la parole, réagit sans réfléchir",
    ],
    pistes: "Suspecter TDAH. Évaluation pédopsychiatrique ou neuropsychologique conseillée.",
  },
  {
    icon: Heart,
    color: "bg-sky-50 border-sky-200",
    iconColor: "text-sky-500",
    title: "Anxiété / Retrait",
    description: "Inquiétude excessive ou isolement social impactant les apprentissages.",
    signes: [
      "Évitement des situations scolaires",
      "Retrait social ou plaintes somatiques",
    ],
    pistes: "Bilan pédopsychiatrique. Soutien psychologique adapté à la cause.",
  },
  {
    icon: ShieldAlert,
    color: "bg-orange-50 border-orange-200",
    iconColor: "text-orange-500",
    title: "Opposition / Colère",
    description: "Refus systématique ou difficultés de régulation émotionnelle.",
    signes: [
      "Refus de consignes, crises de colère fréquentes",
      "Comportement de provocation persistant",
    ],
    pistes: "Évaluer contexte familial. Guidance parentale et pédopsychiatrique utile.",
  },
];

export default function ItemsComportement() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <HamburgerMenu />
      <ScreenLayout title="💝 Comportement" subtitle="Profils comportementaux à explorer">
        <div className="space-y-4">
          {FICHES.map((fiche, i) => (
            <ItemCard key={fiche.title} {...fiche} index={i} />
          ))}
        </div>
      </ScreenLayout>
    </div>
  );
}