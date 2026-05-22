import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";
import HamburgerMenu from "../Navigation/HamburgerMenu";

export default function ScreenLayout({ title, subtitle, children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleBack = () => {
    // Si on est dans un sous-module, retour au module parent
    const pathParts = pathname.split("/").filter(Boolean);
    if (pathParts.length > 1) {
      navigate(`/${pathParts[0]}`);
    } else {
      // Si on est dans un module racine, retour à l'Accueil
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-16">
      <HamburgerMenu />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Nav */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-2 mb-8"
        >
          <button
            onClick={handleBack}
            className="p-2.5 rounded-lg bg-[#D4A574]/10 text-[#D4A574] hover:bg-[#D4A574]/20 transition-colors"
            title="Retour"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg text-[#0F172A]/60 hover:text-[#0F172A] hover:bg-[#E8DCC8]/50 transition-colors"
            title="Accueil"
          >
            <Home className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.2 }}
          className="mb-8"
        >
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#0F172A] leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-[#0F172A]/70 text-base">{subtitle}</p>
          )}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.25 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}