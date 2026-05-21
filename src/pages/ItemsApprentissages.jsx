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
    description: "Capacité à déchiffrer, lire à voix haute et comprendre un texte.",
    signes: [
      "Confusions de lettres ou de sons proches (b/d, p/q…)",
      "Lecture lente, hésitante ou syllabée",
      "Difficultés à comprendre ce qui est lu",
      "Évitement des activités de lecture",
    ],
    pistes: "Explorer la conscience phonologique, la voie d'assemblage et la voie lexicale. Bilan orthophonique recommandé si persistance.",
  },
  {
    icon: PenLine,
    color: "bg-violet-50 border-violet-200",
    iconColor: "text-violet-500",
    title: "Écriture",
    description: "Maîtrise du geste graphique, de l'orthographe et de la production écrite.",
    signes: [
      "Écriture lente, douloureuse ou illisible",
      "Nombreuses ratures, tracé irrégulier",
      "Erreurs orthographiques récurrentes",
      "Difficultés à organiser ses idées à l'écrit",
    ],
    pistes: "Évaluer la motricité fine, la tenue du crayon, les automatismes orthographiques. Penser à la dysgraphie ou dysorthographie.",
  },
  {
    icon: Calculator,
    color: "bg-orange-50 border-orange-200",
    iconColor: "text-orange-500",
    title: "Mathématiques",
    description: "Compréhension des nombres, des opérations et de la logique mathématique.",
    signes: [
      "Difficultés à dénombrer ou à comprendre la valeur positionnelle",
      "Erreurs récurrentes dans les opérations simples",
      "Problèmes de résolution d'énoncés",
      "Confusion des signes ou des procédures",
    ],
    pistes: "Explorer la numération, les faits arithmétiques automatisés et le raisonnement logique. Bilan neuropsychologique si besoin.",
  },
  {
    icon: Brain,
    color: "bg-teal-50 border-teal-200",
    iconColor: "text-teal-500",
    title: "Apprentissage global",
    description: "Vue d'ensemble sur la capacité d'acquisition et de mémorisation.",
    signes: [
      "Lenteur dans l'acquisition de nouvelles notions",
      "Difficultés à mémoriser les leçons apprises",
      "Fatigabilité cognitive importante",
      "Décalage avec les pairs sans cause évidente",
    ],
    pistes: "Évaluer les fonctions exécutives, la mémoire de travail et la vitesse de traitement. Penser à un bilan global.",
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