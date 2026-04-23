import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";
import HamburgerMenu from "../Navigation/HamburgerMenu";

export default function ScreenLayout({ title, subtitle, children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <HamburgerMenu />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Nav */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm"
            title="Retour à la page précédente"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg bg-card border border-border hover:bg-secondary transition-colors"
            title="Aller à l'accueil"
          >
            <Home className="w-4 h-4 text-muted-foreground" />
          </button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-foreground leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-muted-foreground text-base">{subtitle}</p>
          )}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}