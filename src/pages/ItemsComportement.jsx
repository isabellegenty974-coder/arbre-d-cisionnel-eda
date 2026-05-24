import { motion } from "framer-motion";
import { Zap, Heart, ShieldAlert } from "lucide-react";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";

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
      <ScreenLayout title="💝 Comportement" subtitle="Fiches informatives sur les profils comportementaux">
        <div className="space-y-5">
          {FICHES.map(({ icon: Icon, color, iconColor, title, description, signes, pistes }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`rounded-2xl border p-5 ${color}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-xl bg-white/70 ${iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">{title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{description}</p>

              <div className="mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Signes à observer</p>
                <ul className="space-y-1.5">
                  {signes.map((s, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-50" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-white/60">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Pistes d'exploration</p>
                <p className="text-sm text-foreground">{pistes}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </ScreenLayout>
    </div>
  );
}