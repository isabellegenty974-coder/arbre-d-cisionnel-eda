import { motion } from "framer-motion";
import { Home, Globe, Calendar, TrendingDown } from "lucide-react";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";

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
      <ScreenLayout title="🏠 Contexte" subtitle="Fiches informatives sur les facteurs contextuels">
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