import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Heart, Brain, Globe, ChevronRight } from "lucide-react";

const entries = [
  { label: "Difficultés d'apprentissage", to: "/apprentissage", icon: BookOpen, color: "bg-primary/10 text-primary border-primary/20" },
  { label: "Difficultés comportementales / émotionnelles", to: "/comportement", icon: Heart, color: "bg-destructive/10 text-destructive border-destructive/20" },
  { label: "Difficultés liées au développement", to: "/developpement", icon: Brain, color: "bg-accent/10 text-accent border-accent/20" },
  { label: "Facteurs contextuels / environnementaux", to: "/contexte", icon: Globe, color: "bg-chart-2/10 text-chart-2 border-chart-2/20" },
];

export default function Accueil() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-5">
            <Brain className="w-3.5 h-3.5" />
            Psychologue EN – EDA
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            Arbre décisionnel
          </h1>
          <p className="mt-3 text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
            Analyse guidée des situations d'élèves
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-3 sm:gap-4">
          {entries.map((entry, i) => {
            const Icon = entry.icon;
            return (
              <motion.div
                key={entry.to}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i }}
              >
                <Link
                  to={entry.to}
                  className="group flex items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-card border border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${entry.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors text-sm sm:text-base">
                      {entry.label}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}