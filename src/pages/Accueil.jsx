import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { Link } from "react-router-dom";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";

export default function Accueil() {
  const modules = [
    { 
      label: "Apprentissage", 
      to: "/apprentissage", 
      color: "from-cyan-400 to-cyan-500",
      bgColor: "bg-cyan-400",
      textColor: "text-white",
      image: "https://media.base44.com/images/public/69e918c1956306f5db6eaf3d/29b90f9eb_generated_image.png"
    },
    { 
      label: "Comportement", 
      to: "/comportement", 
      color: "from-yellow-300 to-orange-400",
      bgColor: "bg-yellow-300",
      textColor: "text-gray-900",
      image: "https://media.base44.com/images/public/69e918c1956306f5db6eaf3d/14a4d0ce0_generated_image.png"
    },
    { 
      label: "Développement", 
      to: "/developpement", 
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-500",
      textColor: "text-white",
      image: "https://media.base44.com/images/public/69e918c1956306f5db6eaf3d/af03dfdb8_generated_image.png"
    },
    { 
      label: "Contexte", 
      to: "/contexte", 
      color: "from-lime-400 to-green-500",
      bgColor: "bg-lime-400",
      textColor: "text-gray-900",
      image: "https://media.base44.com/images/public/69e918c1956306f5db6eaf3d/4a867233c_generated_image.png"
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #001a4d 0%, #1a0a4d 30%, #5a1080 70%, #c41e7b 100%)",
      }}
    >
      {/* Optional animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 right-10 w-40 h-40 bg-cyan-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-40 left-10 w-60 h-60 bg-pink-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-purple-600 rounded-full blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="relative z-10">
        <HamburgerMenu />

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 mt-8"
        >
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full border-2 border-cyan-300/50 flex items-center justify-center bg-white/10 backdrop-blur-sm">
              <span className="text-4xl font-light text-cyan-300">Ψ</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Arbre décisionnel
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-200 max-w-md mx-auto">
            Psychologue EN-EDA
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 gap-8 max-w-2xl px-6"
        >
          {modules.map((mod, idx) => (
            <motion.div
              key={mod.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="group"
            >
              <Link
                to={mod.to}
                className={`block h-36 rounded-3xl bg-gradient-to-br ${mod.color} p-4 shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-300 border-2 border-white/20 relative overflow-hidden cursor-pointer`}
              >
                {/* Background Image */}
                <div className="absolute inset-0 opacity-40">
                  <img src={mod.image} alt={mod.label} className="w-full h-full object-cover" />
                </div>
                
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center">
                  <p className={`text-base font-bold text-center leading-tight ${mod.textColor}`}>
                    {mod.label}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}