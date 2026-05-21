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
    description: "L'environnement familial joue un rôle central dans la stabilité émotionnelle et les apprentissages.",
    signes: [
      "Séparation ou recomposition familiale récente",
      "Deuil ou événement traumatisant dans la famille",
      "Instabilité du logement ou précarité",
      "Manque de soutien aux devoirs et à la scolarité",
    ],
    pistes: "Un accompagnement social ou familial peut être pertinent. Collaborer avec les parents pour comprendre le contexte de vie de l'enfant.",
  },
  {
    icon: Globe,
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-500",
    title: "Bilinguisme / Plurilinguisme",
    description: "La pratique de plusieurs langues peut influencer le développement du langage écrit et oral.",
    signes: [
      "Langue principale différente du français",
      "Mélanges de langues dans les productions orales",
      "Retard apparent de langage en français uniquement",
      "Confusions orthographiques liées à une autre langue",
    ],
    pistes: "Distinguer ce qui relève du bilinguisme normal et ce qui signale une difficulté réelle. L'évaluation doit tenir compte du contexte linguistique.",
  },
  {
    icon: Calendar,
    color: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-500",
    title: "Absentéisme / Trajectoire scolaire",
    description: "Un parcours scolaire chaotique ou interrompu laisse des lacunes importantes dans les apprentissages.",
    signes: [
      "Absences répétées ou injustifiées",
      "Changements fréquents d'école",
      "Classe de niveau non adapté à l'âge",
      "Retard scolaire cumulé sur plusieurs années",
    ],
    pistes: "Faire le point sur les lacunes réelles via une évaluation des acquis. Mettre en place un plan de soutien individualisé (PPRE, PAP…).",
  },
  {
    icon: TrendingDown,
    color: "bg-red-50 border-red-200",
    iconColor: "text-red-500",
    title: "Événements stressants / Changements",
    description: "Des événements de vie récents peuvent fragiliser l'élève et impacter fortement ses capacités d'apprentissage.",
    signes: [
      "Déménagement ou changement d'école récent",
      "Naissance d'un frère/sœur, maladie dans la famille",
      "Rupture de lien affectif important",
      "Situation de harcèlement ou de conflit",
    ],
    pistes: "Un soutien psychologique peut aider l'enfant à traverser la période. L'enseignant peut adapter les exigences sur le court terme.",
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