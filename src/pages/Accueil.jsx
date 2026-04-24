import { motion } from "framer-motion";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import CircularMenu from "@/components/CircularMenu";
import CircularMenuPro from "@/components/CircularMenuPro";

export default function Accueil() {
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
        {/* Logo / Title — fadeIn intro animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="text-center mb-12"
          id="logoEDA"
        >
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight mb-2">
            Arbre décisionnel
          </h1>
          <p className="text-xl text-gray-200">Psychologue EN-EDA</p>
        </motion.div>

        {/* Circular Menu EDA — fadeIn intro animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
          id="accueil"
        >
          <CircularMenu />
        </motion.div>

        {/* Circular Menu Pro — fadeIn delay */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
          className="mt-4"
        >
          <CircularMenuPro />
        </motion.div>
      </div>
    </div>
  );
}