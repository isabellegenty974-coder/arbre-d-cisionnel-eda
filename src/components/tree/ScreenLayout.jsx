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
            className="p-2 rounded-lg text-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            title="Accueil"
          >
            <Home className="w-4 h-4" />
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