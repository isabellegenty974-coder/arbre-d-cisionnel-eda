import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import CircularMenuEDA from "@/components/CircularMenuEDA";
import { Plus, Users, BarChart2 } from "lucide-react";

function Card({ icon: Icon, title, subtitle, to, highlight = false }) {
  return (
    <Link to={to}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileHover={{ scale: 1.02 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-xl border transition-all cursor-pointer ${
          highlight
            ? "bg-primary text-primary-foreground border-primary shadow-soft-md"
            : "bg-card border-border hover:border-primary/40 hover:shadow-soft"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${highlight ? "bg-primary-foreground/20" : "bg-primary/10"}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-base">{title}</h3>
            <p className={`text-sm mt-1 ${highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
              {subtitle}
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function Accueil() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <HamburgerMenu />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-3">
            Tableau de bord EDA
          </h1>
          <p className="text-lg text-muted-foreground">
            Outils professionnels d'analyse et de suivi
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, staggerChildren: 0.1 }}
          className="grid gap-6 mb-8"
        >
          <Card
            icon={Plus}
            title="Nouvelle fiche élève"
            subtitle="Créer une nouvelle évaluation"
            to="/fiche-eleve"
            highlight
          />
          <Card
            icon={Users}
            title="Élèves"
            subtitle="Consulter, modifier, exporter"
            to="/liste-eleves"
          />
          <Card
            icon={BarChart2}
            title="Statistiques annuelles"
            subtitle="Synthèse et rapport annuel"
            to="/stats-annuelles"
          />
        </motion.div>

        {/* Menu Circulaire EDA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex justify-center mt-12 mb-8 h-96"
        >
          <CircularMenuEDA />
        </motion.div>
      </div>
    </div>
  );
}