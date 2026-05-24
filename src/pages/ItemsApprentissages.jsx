import { motion } from "framer-motion";
import { BookOpen, PenLine, Calculator, Brain } from "lucide-react";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";

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
      <ScreenLayout title="📚 Apprentissages" subtitle="Fiches informatives sur les domaines d'apprentissage">
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