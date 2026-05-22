import { motion } from "framer-motion";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";

const PROFESSIONNELS = [
  {
    emoji: "🗣️",
    color: "bg-blue-50 border-blue-200",
    badgeColor: "bg-blue-100 text-blue-700",
    badge: "Professionnel de santé",
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
    badge: "Professionnel de santé",
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
    badge: "Professionnel de santé",
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
    badge: "Professionnel de santé",
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
    badge: "Professionnel de santé",
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
    badge: "Professionnel de l'accompagnement",
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
    badge: "Professionnel de santé",
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
    badge: "Professionnel de santé",
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

const STRUCTURES = [
  {
    emoji: "🏫",
    color: "bg-sky-50 border-sky-200",
    badgeColor: "bg-sky-100 text-sky-700",
    badge: "Structure scolaire",
    title: "RASED",
    description: "Réseau d'Aides Spécialisées aux Élèves en Difficulté. Intervient directement à l'école.",
    difficultes: [
      "Difficultés d'apprentissage persistantes à l'école ordinaire",
      "Élève nécessitant une aide pédagogique renforcée",
      "Difficultés de comportement perturbant les apprentissages",
      "Blocages émotionnels face aux apprentissages",
      "Besoin d'un bilan adaptatif en milieu scolaire",
    ],
  },
  {
    emoji: "🏥",
    color: "bg-teal-50 border-teal-200",
    badgeColor: "bg-teal-100 text-teal-700",
    badge: "Structure médico-sociale",
    title: "CMP / CMPP",
    description: "Centre Médico-Psychologique / Médico-Psycho-Pédagogique. Offre des consultations pluridisciplinaires gratuites.",
    difficultes: [
      "Troubles émotionnels ou comportementaux marqués",
      "Suspicion de troubles neurodéveloppementaux",
      "Besoin d'un bilan pluridisciplinaire (psy, ortho, psychomot…)",
      "Suivi pédopsychiatrique ambulatoire",
      "Difficultés scolaires avec composante psychologique",
    ],
  },
  {
    emoji: "🌿",
    color: "bg-green-50 border-green-200",
    badgeColor: "bg-green-100 text-green-700",
    badge: "Structure médico-sociale",
    title: "SESSAD",
    description: "Service d'Éducation Spéciale et de Soins à Domicile. Intervient dans le milieu de vie de l'enfant.",
    difficultes: [
      "Enfant en situation de handicap scolarisé en milieu ordinaire",
      "Besoins de rééducation et d'accompagnement régulier",
      "Troubles moteurs, cognitifs, sensoriels ou du langage",
      "Accompagnement à l'inclusion scolaire",
      "Coordination des soins autour de l'enfant",
    ],
  },
  {
    emoji: "🍀",
    color: "bg-lime-50 border-lime-200",
    badgeColor: "bg-lime-100 text-lime-700",
    badge: "Structure médico-sociale",
    title: "CAMSP",
    description: "Centre d'Action Médico-Sociale Précoce. Destiné aux enfants de 0 à 6 ans présentant des troubles du développement.",
    difficultes: [
      "Retard de développement identifié avant 6 ans",
      "Troubles moteurs néonataux ou congénitaux",
      "Risques de handicap chez le jeune enfant",
      "Accompagnement parental précoce",
      "Dépistage et prise en charge pluridisciplinaire précoce",
    ],
  },
  {
    emoji: "📋",
    color: "bg-indigo-50 border-indigo-200",
    badgeColor: "bg-indigo-100 text-indigo-700",
    badge: "Instance administrative",
    title: "MDPH",
    description: "Maison Départementale des Personnes Handicapées. Évalue les besoins et attribue les droits et aides.",
    difficultes: [
      "Demande de reconnaissance de handicap (RQTH, AEEH…)",
      "Mise en place d'un PPS (Projet Personnalisé de Scolarisation)",
      "Attribution d'une AESH (accompagnant)",
      "Orientation vers des structures spécialisées (ULIS, IME…)",
      "Accès à des aides financières ou matérielles",
    ],
  },
  {
    emoji: "🏛️",
    color: "bg-purple-50 border-purple-200",
    badgeColor: "bg-purple-100 text-purple-700",
    badge: "Structure scolaire spécialisée",
    title: "ULIS",
    description: "Unité Localisée pour l'Inclusion Scolaire. Dispositif en école, collège ou lycée pour élèves avec besoins éducatifs particuliers.",
    difficultes: [
      "Troubles cognitifs ou intellectuels",
      "Troubles du spectre autistique (TSA)",
      "Troubles des fonctions motrices",
      "Troubles du langage et de la communication",
      "Besoins d'un enseignement adapté avec inclusion partielle",
    ],
  },
  {
    emoji: "🏠",
    color: "bg-fuchsia-50 border-fuchsia-200",
    badgeColor: "bg-fuchsia-100 text-fuchsia-700",
    badge: "Structure médico-éducative",
    title: "IME / ITEP",
    description: "Institut Médico-Éducatif / Institut Thérapeutique, Éducatif et Pédagogique. Pour les enfants ne pouvant être scolarisés en milieu ordinaire.",
    difficultes: [
      "Déficience intellectuelle avec retentissement majeur",
      "Troubles du comportement sévères empêchant la scolarisation ordinaire",
      "Besoin d'un accompagnement éducatif, thérapeutique et pédagogique global",
      "TSA avec besoins de soins intensifs",
      "Orientation après décision MDPH/CDAPH",
    ],
  },
  {
    emoji: "🧑‍🤝‍🧑",
    color: "bg-yellow-50 border-yellow-200",
    badgeColor: "bg-yellow-100 text-yellow-700",
    badge: "Accompagnement scolaire",
    title: "AESH",
    description: "Accompagnant des Élèves en Situation de Handicap. Soutient l'élève dans sa scolarité au quotidien.",
    difficultes: [
      "Élève nécessitant une aide humaine individuelle ou mutualisée",
      "Difficultés d'autonomie en classe (installation, prise de notes…)",
      "Troubles moteurs, sensoriels ou cognitifs impactant la vie scolaire",
      "Accompagnement lors des temps périscolaires si nécessaire",
      "Attribution via décision MDPH/CDAPH",
    ],
  },
];

function FicheCard({ emoji, color, badgeColor, badge, title, description, difficultes, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-2xl border p-5 ${color}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{emoji}</span>
        <div>
          <h3 className="font-semibold text-foreground text-lg leading-tight">{title}</h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
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
  );
}

export default function ItemsProfessionnels() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <HamburgerMenu />
      <ScreenLayout title="👩‍⚕️ Professionnels & Structures" subtitle="Fiches par professionnel ou structure et difficultés concernées">
        <div className="space-y-5">
          {/* Section professionnels */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-base font-bold text-foreground uppercase tracking-wider pt-2"
          >
            👤 Professionnels
          </motion.h2>
          {PROFESSIONNELS.map((item, i) => (
            <FicheCard key={item.title} {...item} index={i} />
          ))}

          {/* Section structures */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-base font-bold text-foreground uppercase tracking-wider pt-4"
          >
            🏛️ Structures
          </motion.h2>
          {STRUCTURES.map((item, i) => (
            <FicheCard key={item.title} {...item} index={i} />
          ))}
        </div>
      </ScreenLayout>
    </div>
  );
}