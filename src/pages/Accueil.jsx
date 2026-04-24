import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import CircularMenuEDA from "@/components/CircularMenuEDA";


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

        {/* Menu Circulaire EDA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex justify-center h-96"
        >
          <CircularMenuEDA />
        </motion.div>
      </div>
    </div>
  );
}