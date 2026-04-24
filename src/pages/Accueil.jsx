import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import CircularMenu from "@/components/CircularMenu";
import { Plus, Users, BarChart2 } from "lucide-react";

const NAV_CARDS = [
  { label: "Nouvelle fiche élève", icon: Plus, to: "/fiche-eleve", highlight: true },
  { label: "Liste des élèves", icon: Users, to: "/liste-eleves" },
  { label: "Statistiques annuelles", icon: BarChart2, to: "/stats-annuelles" },
];

export default function Accueil() {
  const navigate = useNavigate();
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #001a4d 0%, #1a0a4d 30%, #5a1080 70%, #c41e7b 100%)",
      }}
    >
      {/* Animated background glows */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 right-10 w-40 h-40 bg-cyan-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-40 left-10 w-60 h-60 bg-pink-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-purple-600 rounded-full blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <HamburgerMenu />

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo / Title — fadeIn 0.9s */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight mb-2">
            Arbre décisionnel
          </h1>
          <p className="text-xl text-gray-200">Psychologue EN-EDA</p>
        </motion.div>

        {/* Circular Menu — fadeIn 0.9s, slight delay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
        >
          <CircularMenu />
        </motion.div>

        {/* Dashboard cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
          className="mt-10 w-full max-w-sm px-4 space-y-3"
        >
          {NAV_CARDS.map(({ label, icon: Icon, to, highlight }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border transition-all text-left ${
                highlight
                  ? "bg-white/20 border-white/40 hover:bg-white/30 text-white"
                  : "bg-white/10 border-white/20 hover:bg-white/20 text-white/90"
              }`}
            >
              <div className={`p-2 rounded-lg ${highlight ? "bg-white/20" : "bg-white/10"}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-sm">{label}</span>
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}