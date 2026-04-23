import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import FlipCard from "@/components/FlipCard";

export default function Accueil() {
  const modules = [
    { label: "Apprentissage", emoji: "📘", to: "/apprentissage", color: "from-primary/20 to-primary/10" },
    { label: "Comportement", emoji: "🌧️", to: "/comportement", color: "from-accent/20 to-accent/10" },
    { label: "Développement", emoji: "🧠", to: "/developpement", color: "from-chart-2/20 to-chart-2/10" },
    { label: "Contexte", emoji: "🏠", to: "/contexte", color: "from-chart-4/20 to-chart-4/10" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, #f0f4fb 0%, #f7f8fa 55%, #efefef 100%)",
      }}
    >
      <HamburgerMenu />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
          <Brain className="w-3.5 h-3.5" />
          Psychologue EN – EDA
        </div>
        <div className="mb-3 flex justify-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/15 flex items-center justify-center shadow-sm">
            <span
              className="text-2xl font-light text-primary"
              style={{ fontFamily: "Georgia, serif", letterSpacing: "0.05em" }}
            >
              Ψ
            </span>
          </div>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">
          Arbre décisionnel
        </h1>
        <p className="mt-2 text-muted-foreground text-base max-w-xs mx-auto">
          Analyse guidée des situations d'élèves
        </p>
      </motion.div>

      {/* Flip Cards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-2xl px-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {modules.map((mod, idx) => (
            <motion.div
              key={mod.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
            >
              <FlipCard {...mod} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}