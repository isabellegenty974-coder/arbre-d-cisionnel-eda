import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, ClipboardList, TreePine, BarChart2, BookOpen, Shield, ChevronRight } from "lucide-react";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";

const MAIN_ACTIONS = [
  {
    icon: Users,
    label: "Mes élèves",
    desc: "Fiches et historique des diagnostics",
    to: "/dashboard",
    gradient: "from-blue-500 to-indigo-600",
    glow: "shadow-blue-200",
    light: "bg-blue-50",
    text: "text-blue-600",
    tag: "Gestion",
  },
  {
    icon: ClipboardList,
    label: "Nouvelle observation",
    desc: "Créer une fiche élève et observer",
    to: "/fiche-eleve",
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-200",
    light: "bg-emerald-50",
    text: "text-emerald-600",
    tag: "Créer",
  },
  {
    icon: TreePine,
    label: "Arbre décisionnel",
    desc: "Analyse approfondie par domaine",
    to: "/evaluation-domains",
    gradient: "from-amber-500 to-orange-500",
    glow: "shadow-amber-200",
    light: "bg-amber-50",
    text: "text-amber-600",
    tag: "Analyse",
  },
];

const SECONDARY_ACTIONS = [
  { icon: BarChart2, label: "Statistiques", to: "/stats-annuelles" },
  { icon: BookOpen, label: "Ressources", to: "/items-professionnels" },
  { icon: Shield, label: "Confidentialité", to: "/politique-confidentialite" },
];

export default function Accueil() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <HamburgerMenu />

      <div className="max-w-lg mx-auto px-5 pt-12 sm:pt-16">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          {/* Logo badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-soft-lg mb-5"
          >
            <span className="text-white text-3xl font-bold select-none" style={{fontFamily: 'serif'}}>Ψ</span>
          </motion.div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Arbre décisionnel EDA
          </h1>
          <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-xs mx-auto leading-relaxed">
            Outil d’aide à la formulation d’hypothèses diagnostiques pour les enseignants
          </p>
        </motion.div>

        {/* Main Actions */}
        <div className="space-y-3 mb-10">
          {MAIN_ACTIONS.map((action, i) => (
            <motion.div
              key={action.to}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.09, duration: 0.4 }}
            >
              <Link to={action.to} className="group block">
                <div className={`relative overflow-hidden flex items-center gap-4 p-4 sm:p-5 rounded-2xl border border-border bg-card hover:shadow-soft-md transition-all duration-200 hover:scale-[1.01]`}>

                  {/* Subtle gradient accent top-right */}
                  <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${action.gradient} opacity-[0.07] blur-xl`} />

                  {/* Icon */}
                  <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} shadow-soft flex items-center justify-center`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {action.label}
                      </p>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${action.light} ${action.text}`}>
                        {action.tag}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-snug">{action.desc}</p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium">Autres sections</span>
          <div className="flex-1 h-px bg-border" />
        </motion.div>

        {/* Secondary Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="grid grid-cols-3 gap-3"
        >
          {SECONDARY_ACTIONS.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary border border-border hover:border-border/80 transition-all duration-200 hover:shadow-soft"
            >
              <div className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center group-hover:border-primary/30 transition-colors">
                <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground text-center transition-colors leading-tight">
                {action.label}
              </span>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}