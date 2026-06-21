import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import { ChevronDown } from "lucide-react";

const RASED_PROFESSIONS = [
  {
    role: "Psy EN EDA",
    emoji: "🧠",
    color: "bg-violet-50 border-violet-200",
    labelColor: "bg-violet-100 text-violet-700",
    champ: "Psychologue de l'Éducation Nationale — Éducation, Développement et Apprentissages",
    interventions: [
      "Bilan psychologique et psychométrique (évaluation cognitive, QI, profil d'apprentissage)",
      "Observation et analyse des difficultés scolaires en lien avec le développement de l'enfant",
      "Évaluation des fonctions cognitives : mémoire, attention, fonctions exécutives",
      "Entretiens avec l'enfant et sa famille pour comprendre le contexte",
      "Guidance parentale et conseils aux enseignants",
      "Participation aux équipes éducatives et ESS",
      "Orientation vers des professionnels de santé ou structures spécialisées",
      "Accompagnement lors de la mise en place d'un PAP, PPRE ou PPS",
    ],
  },
  {
    role: "MaDP",
    emoji: "📚",
    color: "bg-blue-50 border-blue-200",
    labelColor: "bg-blue-100 text-blue-700",
    champ: "Maître à dominante Pédagogique — ancienne aide de type E",
    interventions: [
      "Remédiations pédagogiques individualisées ou en petit groupe",
      "Travail sur les apprentissages fondamentaux : lecture, écriture, calcul",
      "Aide à la compréhension et à la mémorisation des notions",
      "Développement de stratégies d'apprentissage adaptées",
      "Travail sur la métacognition et l'estime de soi scolaire",
      "Coordination avec l'enseignant de la classe",
      "Participation aux équipes éducatives et PPRE",
    ],
  },
  {
    role: "MaDR",
    emoji: "💛",
    color: "bg-amber-50 border-amber-200",
    labelColor: "bg-amber-100 text-amber-700",
    champ: "Maître à dominante Relationnelle — ancienne aide de type G",
    interventions: [
      "Accompagnement des élèves présentant des difficultés comportementales ou émotionnelles",
      "Travail sur la relation à l'autre, la confiance en soi et l'estime de soi",
      "Prise en charge des troubles du comportement en milieu scolaire",
      "Aide aux élèves anxieux, inhibés ou en refus scolaire",
      "Séances individuelles ou en petit groupe axées sur le bien-être",
      "Liaison avec les familles et l'équipe enseignante",
      "Participation aux équipes éducatives et dispositifs d'aide",
    ],
  },
];

const PROFESSIONNELS = [
  {
    emoji: "🗣️",
    color: "border-blue-200",
    dot: "bg-blue-400",
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
    color: "border-violet-200",
    dot: "bg-violet-400",
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
    color: "border-green-200",
    dot: "bg-green-400",
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
    color: "border-amber-200",
    dot: "bg-amber-400",
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
    color: "border-pink-200",
    dot: "bg-pink-400",
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
    color: "border-rose-200",
    dot: "bg-rose-400",
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
    color: "border-cyan-200",
    dot: "bg-cyan-400",
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
    color: "border-orange-200",
    dot: "bg-orange-400",
    title: "Ergothérapeute",
    description: "Aide l'enfant à s'adapter à son environnement pour favoriser son autonomie scolaire.",
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
  { emoji: "🏥", title: "CMPEA", badge: "Médico-social", color: "bg-teal-600", description: "Centre Médico-Psychologique pour Enfants et Adolescents. Soins psychiatriques ambulatoires gratuits, rattaché à l'hôpital public.", items: ["Troubles psychiatriques ou neurodéveloppementaux nécessitant un suivi médical", "Suivi pédopsychiatrique ambulatoire (diagnostic, traitement, suivi)", "Troubles anxieux sévères, dépression, troubles du comportement avec composante psychiatrique", "Mise en place ou renouvellement d'un traitement médicamenteux", "Coordination avec les équipes hospitalières si nécessaire", "📍 Saint-Paul — EPSMR : 02 62 45 35 45 · 42 chemin Grand Pourpier, 97460 Saint-Paul", "📍 La Possession (CMPEA-CATTP) — EPSMR : 02 62 74 32 50 · 9 rue Patrice Lumumba, Ravine à Marquet, 97419 La Possession"] },
  { emoji: "🏡", title: "CMPP", badge: "Médico-social", color: "bg-teal-400", description: "Centre Médico-Psycho-Pédagogique. Consultations pluridisciplinaires gratuites, à gestion associative, orientées vers les apprentissages.", items: ["Difficultés scolaires avec composante psychologique ou développementale", "Bilan pluridisciplinaire (psy, orthophoniste, psychomotricien, éducateur…)", "Troubles des apprentissages (dyslexie, dyscalculie…) avec retentissement émotionnel", "Troubles du comportement en lien avec le contexte scolaire ou familial", "Accompagnement parental et guidance éducative", "📍 Saint-Paul (CMPP Ouest – ALEFPA) : 02 62 22 09 24 · 38 route de Savanna, Espace Santé, 97460 Saint-Paul · cmpp.ouest@alefpa.fr"] },
  { emoji: "🌿", title: "SESSAD", badge: "Médico-social", color: "bg-green-500", description: "Service d'Éducation Spéciale et de Soins à Domicile. Intervient dans le milieu de vie de l'enfant.", items: ["Enfant en situation de handicap scolarisé en milieu ordinaire", "Besoins de rééducation et d'accompagnement régulier", "Troubles moteurs, cognitifs, sensoriels ou du langage", "Accompagnement à l'inclusion scolaire", "Coordination des soins autour de l'enfant"] },
  { emoji: "🍀", title: "CAMSP", badge: "Médico-social", color: "bg-lime-500", description: "Centre d'Action Médico-Sociale Précoce. Pour les enfants de 0 à 6 ans.", items: ["Retard de développement identifié avant 6 ans", "Troubles moteurs néonataux ou congénitaux", "Risques de handicap chez le jeune enfant", "Accompagnement parental précoce", "Dépistage et prise en charge pluridisciplinaire précoce", "📍 La Possession (CAMSP Ouest – ASFA) : 02 62 22 20 36 · 8 rue Raymond Mondon, 97419 La Possession"]  },
  { emoji: "📋", title: "MDPH", badge: "Administratif", color: "bg-indigo-500", description: "Maison Départementale des Personnes Handicapées. Évalue les besoins et attribue les droits.", items: ["Demande de reconnaissance de handicap (RQTH, AEEH…)", "Mise en place d'un PPS (Projet Personnalisé de Scolarisation)", "Attribution d'une AESH (accompagnant)", "Orientation vers des structures spécialisées (ULIS, IME…)", "Accès à des aides financières ou matérielles", "📍 Saint-Denis (siège unique) : 0800 000 262 (numéro vert gratuit) · 13 rue Fénelon, 97400 Saint-Denis · mdph974@mdph.re"] },
  { emoji: "🏛️", title: "ULIS", badge: "Scolaire spécialisé", color: "bg-purple-500", description: "Unité Localisée pour l'Inclusion Scolaire. Dispositif en école, collège ou lycée.", items: ["Troubles cognitifs ou intellectuels", "Troubles du spectre autistique (TSA)", "Troubles des fonctions motrices", "Troubles du langage et de la communication", "Besoins d'un enseignement adapté avec inclusion partielle"] },
  { emoji: "🏠", title: "IME", badge: "Médico-éducatif", color: "bg-fuchsia-600", description: "Institut Médico-Éducatif. Accueille les enfants et adolescents avec déficience intellectuelle, avec ou sans troubles associés.", items: ["Déficience intellectuelle légère, moyenne ou sévère avec retentissement majeur", "TSA (autisme) avec besoins de soins et d'accompagnement intensifs", "Incapacité à suivre une scolarisation en milieu ordinaire même avec aménagements", "Besoin d'un projet individualisé alliant soin, éducation et pédagogie adaptée", "Orientation après décision MDPH/CDAPH"] },
  { emoji: "🌀", title: "ITEP", badge: "Médico-éducatif", color: "bg-fuchsia-400", description: "Institut Thérapeutique, Éducatif et Pédagogique. Accompagne les enfants avec troubles du comportement sans déficience intellectuelle.", items: ["Troubles importants du comportement, des conduites et des émotions", "Perturbations relationnelles sévères empêchant la scolarisation ordinaire", "Pas de déficience intellectuelle associée (à distinguer de l'IME)", "Souffrance psychique sous-jacente (anxiété, traumatisme, troubles de la personnalité)", "Orientation après décision MDPH/CDAPH avec projet thérapeutique, éducatif et pédagogique"] },
  { emoji: "🧑‍🤝‍🧑", title: "AESH", badge: "Accompagnement", color: "bg-yellow-500", description: "Accompagnant des Élèves en Situation de Handicap. Soutien au quotidien.", items: ["Élève nécessitant une aide humaine individuelle ou mutualisée", "Difficultés d'autonomie en classe (installation, prise de notes…)", "Troubles moteurs, sensoriels ou cognitifs impactant la vie scolaire", "Accompagnement lors des temps périscolaires si nécessaire", "Attribution via décision MDPH/CDAPH"] },
];

const TABS = [
  { id: "rased", label: "🏫 RASED", emoji: "🏫" },
  { id: "pros", label: "👤 Professionnels", emoji: "👤" },
  { id: "structures", label: "🏛️ Structures", emoji: "🏛️" },
];

function AccordionCard({ emoji, title, description, dot, color, difficultes, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`rounded-2xl border-2 bg-white overflow-hidden ${color}`}
    >
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-xl shrink-0">{emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm leading-tight">{title}</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{description}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border/50 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Difficultés relevant de son champ</p>
              <ul className="space-y-1.5">
                {difficultes.map((d, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StructureCard({ emoji, title, badge, color, description, items, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-2xl bg-white border border-border overflow-hidden shadow-sm"
    >
      <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left" onClick={() => setOpen(!open)}>
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
          <span className="text-white text-lg">{emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground text-sm">{title}</p>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{badge}</span>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{description}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border/50 pt-3">
              <ul className="space-y-1.5">
                {items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ProfessionCard({ role, emoji, color, labelColor, champ, interventions, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`rounded-2xl border-2 overflow-hidden ${color}`}
    >
      <button className="w-full flex items-center gap-3 px-4 py-4 text-left bg-white/70" onClick={() => setOpen(!open)}>
        <span className="text-2xl shrink-0">{emoji}</span>
        <div className="flex-1 min-w-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${labelColor}`}>{role}</span>
          <p className="text-xs text-muted-foreground mt-1 leading-snug">{champ}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-3 border-t border-white/40">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Champ d'intervention</p>
              <ul className="space-y-1.5">
                {interventions.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ItemsProfessionnels() {
  const [activeTab, setActiveTab] = useState("rased");

  return (
    <div className="min-h-screen bg-background pb-16">
      <HamburgerMenu />
      <ScreenLayout title="📖 Ressources" subtitle="Fiches professionnels, structures et équipe RASED">

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-muted rounded-2xl p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* RASED Tab */}
          {activeTab === "rased" && (
            <motion.div
              key="rased"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="rounded-2xl bg-sky-50 border-2 border-sky-200 p-4 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🏫</span>
                  <div>
                    <h3 className="font-bold text-foreground">RASED</h3>
                    <p className="text-xs text-muted-foreground">Réseau d'Aides Spécialisées aux Élèves en Difficulté</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Intervient directement à l'école auprès des élèves présentant des difficultés persistantes d'apprentissage ou de comportement.</p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Les 3 professions du RASED</p>
              {RASED_PROFESSIONS.map((p, i) => (
                <ProfessionCard key={p.role} {...p} index={i} />
              ))}
            </motion.div>
          )}

          {/* Professionnels Tab */}
          {activeTab === "pros" && (
            <motion.div
              key="pros"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <p className="text-xs text-muted-foreground px-1 mb-4">Touchez une fiche pour voir les difficultés relevant du champ de ce professionnel.</p>
              {PROFESSIONNELS.map((item, i) => (
                <AccordionCard key={item.title} {...item} index={i} />
              ))}
            </motion.div>
          )}

          {/* Structures Tab */}
          {activeTab === "structures" && (
            <motion.div
              key="structures"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <p className="text-xs text-muted-foreground px-1 mb-4">Touchez une structure pour voir les situations qui la concernent.</p>
              {STRUCTURES.map((item, i) => (
                <StructureCard key={item.title} {...item} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </ScreenLayout>
    </div>
  );
}