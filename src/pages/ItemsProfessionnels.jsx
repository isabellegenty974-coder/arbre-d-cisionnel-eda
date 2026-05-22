import { motion } from "framer-motion";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";

const PROFESSIONNELS = [
  {
    emoji: "🗣️",
    color: "bg-blue-50 border-blue-200",
    badgeColor: "bg-blue-100 text-blue-700",
    title: "Orthophoniste",
    description: "Spécialiste du langage oral et écrit, de la parole, de la voix et de la déglutition.",
    difficultes: [
      "Retard de parole ou de langage oral",
      "Difficultés de lecture (dyslexie)",
      "Difficultés d'orthographe (dysorthographie)",
      "Troubles de la compréhension du langage",
      "Bégaiement ou troubles de la fluence",
      "Difficultés en mathématiques (dyscalculie)",
    ],
  },
  {
    emoji: "🧠",
    color: "bg-violet-50 border-violet-200",
    badgeColor: "bg-violet-100 text-violet-700",
    title: "Neuropsychologue",
    description: "Évalue les fonctions cognitives : mémoire, attention, fonctions exécutives, QI.",
    difficultes: [
      "Difficultés d'attention et de concentration (TDAH suspecté)",
      "Troubles des apprentissages non expliqués",
      "Mémoire de travail défaillante",
      "Lenteur cognitive importante",
      "Difficultés de planification et d'organisation",
      "Évaluation globale du potentiel intellectuel",
    ],
  },
  {
    emoji: "🏃",
    color: "bg-green-50 border-green-200",
    badgeColor: "bg-green-100 text-green-700",
    title: "Psychomotricien(ne)",
    description: "Travaille sur les liens entre corps, mouvement et psychisme pour favoriser le développement global.",
    difficultes: [
      "Maladresse motrice globale ou fine (TDC/dyspraxie)",
      "Difficultés graphomotrices (tenue du crayon, écriture)",
      "Problèmes d'équilibre et de coordination",
      "Agitation motrice ou hypotonie",
      "Troubles de l'image du corps et de l'espace",
      "Difficultés de régulation tonico-émotionnelle",
    ],
  },
  {
    emoji: "👁️",
    color: "bg-amber-50 border-amber-200",
    badgeColor: "bg-amber-100 text-amber-700",
    title: "Ophtalmologiste / Orthoptiste",
    description: "Dépiste et traite les troubles visuels et oculomoteurs pouvant gêner la lecture et l'écriture.",
    difficultes: [
      "Fatigue visuelle à la lecture",
      "Sauts de lignes, confusion de mots proches",
      "Maux de tête lors de la lecture ou de l'écriture",
      "Vision double ou floue",
      "Difficultés de suivi du texte",
      "Troubles de la convergence oculaire",
    ],
  },
  {
    emoji: "🧏",
    color: "bg-pink-50 border-pink-200",
    badgeColor: "bg-pink-100 text-pink-700",
    title: "Audiologiste / ORL",
    description: "Évalue l'acuité auditive et les traitements auditifs centraux pouvant impacter le langage.",
    difficultes: [
      "Difficultés de discrimination phonologique",
      "Enfant qui ne semble pas entendre correctement",
      "Otites à répétition dans la petite enfance",
      "Retard de parole ou articulation déficiente",
      "Difficultés à suivre les consignes orales en classe",
    ],
  },
  {
    emoji: "💆",
    color: "bg-rose-50 border-rose-200",
    badgeColor: "bg-rose-100 text-rose-700",
    title: "Psychologue",
    description: "Accompagne l'enfant dans sa vie émotionnelle, ses relations et son épanouissement psychique.",
    difficultes: [
      "Anxiété, phobies scolaires ou refus d'école",
      "Tristesse persistante, repli sur soi",
      "Troubles du comportement émotionnel",
      "Deuil, séparation ou traumatisme",
      "Difficultés relationnelles avec les pairs",
      "Manque de confiance en soi ou estime de soi faible",
    ],
  },
  {
    emoji: "🩺",
    color: "bg-cyan-50 border-cyan-200",
    badgeColor: "bg-cyan-100 text-cyan-700",
    title: "Pédopsychiatre",
    description: "Médecin spécialiste des troubles mentaux et neurodéveloppementaux chez l'enfant.",
    difficultes: [
      "Suspicion de TDAH avec retentissement important",
      "Suspicion de TSA (autisme)",
      "Troubles du comportement sévères ou persistants",
      "Troubles anxieux généralisés",
      "Troubles de l'humeur ou dépression",
      "Mise en place d'un traitement médicamenteux si nécessaire",
    ],
  },
  {
    emoji: "🤝",
    color: "bg-orange-50 border-orange-200",
    badgeColor: "bg-orange-100 text-orange-700",
    title: "Ergothérapeute",
    description: "Aide l'enfant à s'adapter à son environnement pour favoriser son autonomie dans les activités quotidiennes et scolaires.",
    difficultes: [
      "Difficultés de préhension et de manipulation d'outils",
      "Dyspraxie affectant les gestes du quotidien",
      "Aménagement du poste de travail et des outils",
      "Passage au clavier / numérique comme compensation",
      "Difficultés d'autonomie dans les activités scolaires",
      "Hypersensibilités sensorielles impactant l'activité",
    ],
  },
];

export default function ItemsProfessionnels() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <HamburgerMenu />
      <ScreenLayout title="👩‍⚕️ Professionnels" subtitle="Fiches par professionnel et difficultés concernées">
        <div className="space-y-5">
          {PROFESSIONNELS.map(({ emoji, color, badgeColor, title, description, difficultes }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-2xl border p-5 ${color}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{emoji}</span>
                <div>
                  <h3 className="font-semibold text-foreground text-lg leading-tight">{title}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>Professionnel de santé</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{description}</p>

              <div className="p-3 rounded-xl bg-white/60">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Difficultés relevant de son champ</p>
                <ul className="space-y-1.5">
                  {difficultes.map((d, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </ScreenLayout>
    </div>
  );
}