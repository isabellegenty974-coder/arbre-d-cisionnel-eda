import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, ClipboardList, TreePine, BarChart2, BookOpen, Shield } from "lucide-react";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";

const MAIN_ACTIONS = [
  {
    icon: Users,
    label: "Mes élèves",
    desc: "Gérer les fiches et diagnostics",
    to: "/dashboard",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: ClipboardList,
    label: "Nouvelle observation",
    desc: "Créer une fiche et observer",
    to: "/fiche-eleve",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: TreePine,
    label: "Arbre décisionnel",
    desc: "Analyse approfondie par domaine",
    to: "/evaluation-domains",
    color: "from-amber-500 to-orange-500",
  },
];

const SECONDARY_ACTIONS = [
  { icon: BarChart2, label: "Statistiques", to: "/stats-annuelles" },
  { icon: BookOpen, label: "Fiches ressources", to: "/items-professionnels" },
  { icon: Shield, label: "Confidentialité", to: "/politique-confidentialite" },
];

export default function Accueil() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <HamburgerMenu />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Arbre EDA
          </h1>
          <p className="text-muted-foreground text-base">
            Évaluation dynamique des apprentissages
          </p>
        </motion.div>

        {/* Main Actions */}
        <div className="space-y-4 mb-10">
          {MAIN_ACTIONS.map((action, i) => (
            <motion.div
              key={action.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <Link
                to={action.to}
                className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-soft transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shrink-0`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {action.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">{action.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Secondary Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          {SECONDARY_ACTIONS.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/60 hover:bg-secondary text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <action.icon className="w-4 h-4" />
              {action.label}
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}