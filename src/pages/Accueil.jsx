import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import CircularMenuEDA from "@/components/CircularMenuEDA";


export default function Accueil() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-20">
      <HamburgerMenu />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-block px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/40 mb-4">
            <p className="text-sm font-medium text-blue-300">Plateforme EDA</p>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-white mb-4">
            Tableau de bord d'analyse
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Solution professionnelle intégrée pour l'évaluation dynamique et l'analyse du profil d'apprentissage
          </p>
        </motion.div>

        {/* Menu Circulaire EDA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="flex justify-center h-96 mb-12"
        >
          <CircularMenuEDA />
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-white mb-2">Analyses pointues</h3>
            <p className="text-sm text-slate-400">Quatre domaines d'évaluation détaillés</p>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-white mb-2">Recommandations</h3>
            <p className="text-sm text-slate-400">Propositions d'action personnalisées</p>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="font-semibold text-white mb-2">Suivi annuel</h3>
            <p className="text-sm text-slate-400">Vue d'ensemble et statistiques</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}