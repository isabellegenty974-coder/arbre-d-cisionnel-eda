import { motion } from "framer-motion";
import { Zap, Wind, Heart, ShieldAlert } from "lucide-react";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";

const FICHES = [
  {
    icon: Zap,
    color: "bg-rose-50 border-rose-200",
    iconColor: "text-rose-500",
    title: "Agitation / Hyperactivité",
    description: "Niveau élevé d'activité motrice difficilement contrôlable, persistant dans différents contextes.",
    signes: [
      "Se lève souvent, ne peut rester assis",
      "Gesticule en permanence, touche tout",
      "Court ou grimpe dans des situations inappropriées",
      "Parle excessivement, bruit continuel",
    ],
    pistes: "Explorer une suspicion de TDAH, une hypersensibilité sensorielle ou une anxiété sous-jacente. Évaluation pédopsychiatrique ou neuropsychologique conseillée.",
  },
  {
    icon: Wind,
    color: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-500",
    title: "Impulsivité",
    description: "Difficulté à inhiber ses réponses, agit avant de réfléchir.",
    signes: [
      "Coupe la parole, répond avant la fin des questions",
      "Ne peut attendre son tour",
      "Passe d'une activité à l'autre très vite",
      "Réactions émotionnelles disproportionnées",
    ],
    pistes: "Évaluer les fonctions d'inhibition et de contrôle exécutif. Peut être associé au TDAH ou à des difficultés de régulation émotionnelle.",
  },
  {
    icon: Heart,
    color: "bg-sky-50 border-sky-200",
    iconColor: "text-sky-500",
    title: "Anxiété / Retrait",
    description: "Manifestations d'inquiétude excessive ou d'isolement social entravant les apprentissages.",
    signes: [
      "Pleurs fréquents, inquiétudes répétées",
      "Évitement de situations scolaires",
      "Plaintes somatiques (ventre, tête)",
      "Retrait des interactions avec les pairs",
    ],
    pistes: "Distinguer anxiété situationnelle et anxiété généralisée. Un suivi psychologique ou un bilan pédopsychiatrique peut être indiqué.",
  },
  {
    icon: ShieldAlert,
    color: "bg-orange-50 border-orange-200",
    iconColor: "text-orange-500",
    title: "Opposition / Instabilité émotionnelle",
    description: "Refus systématique, conflits récurrents avec les adultes ou difficultés de régulation des émotions.",
    signes: [
      "Refus de consignes ou de tâches scolaires",
      "Crises de colère fréquentes et intenses",
      "Provocation délibérée envers adultes ou pairs",
      "Humeur très variable au cours de la journée",
    ],
    pistes: "Explorer les troubles oppositionnels, les difficultés émotionnelles ou un contexte familial difficile. Guidance parentale souvent utile.",
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