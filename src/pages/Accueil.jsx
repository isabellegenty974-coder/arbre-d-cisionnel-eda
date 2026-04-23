import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import NavCards from "@/components/tree/NavCards";

export default function Accueil() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, #f0f4fb 0%, #f7f8fa 55%, #efefef 100%)",
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
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

      {/* Menu */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-md"
      >
        <NavCards
          items={[
            { label: "📘 Apprentissage", to: "/apprentissage" },
            { label: "🌧️ Comportement", to: "/comportement" },
            { label: "🧠 Développement", to: "/developpement" },
            { label: "🏠 Contexte", to: "/contexte" },
          ]}
        />
      </motion.div>
    </div>
  );
}