import { motion } from "framer-motion";
import { Activity, MessageSquare, Eye, Users } from "lucide-react";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";

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
      <ScreenLayout title="🌱 Développement" subtitle="Fiches informatives sur les axes développementaux">
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