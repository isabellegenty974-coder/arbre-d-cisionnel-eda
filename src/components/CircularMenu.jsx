import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { BookOpen, Smile, Baby, Home, Brain } from "lucide-react";

const RADIUS = 180;

const items = [
  { label: "Apprentissages", icon: BookOpen, to: "/apprentissage", color: "#22d3ee", bg: "rgba(34,211,238,0.15)" },
  { label: "Comportement",   icon: Smile,    to: "/comportement",  color: "#facc15", bg: "rgba(250,204,21,0.15)" },
  { label: "Développement",  icon: Baby,     to: "/developpement", color: "#f472b6", bg: "rgba(244,114,182,0.15)" },
  { label: "Contexte",       icon: Home,     to: "/contexte",      color: "#a3e635", bg: "rgba(163,230,53,0.15)" },
];

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.4 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1 + 0.2, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] },
  }),
};

export default function CircularMenu() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  const handleClick = (item) => {
    setTimeout(() => navigate(item.to), 180);
  };

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: RADIUS * 2 + 180, height: RADIUS * 2 + 180 }}
    >
      {/* Subtle orbit ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: RADIUS * 2,
          height: RADIUS * 2,
          border: "1.5px dashed rgba(255,255,255,0.15)",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Items */}
      {items.map((item, index) => {
        const angleStep = 360 / items.length;
        const angle = index * angleStep - 90; // start from top
        const rad = toRad(angle);
        const x = RADIUS * Math.cos(rad);
        const y = RADIUS * Math.sin(rad);
        const isHovered = hovered === item.to;
        const Icon = item.icon;

        return (
          <motion.button
            key={item.to}
            custom={index}
            variants={fadeInScale}
            initial="hidden"
            animate="visible"
            onClick={() => handleClick(item)}
            onMouseEnter={() => setHovered(item.to)}
            onMouseLeave={() => setHovered(null)}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.95 }}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 100,
              height: 100,
              borderRadius: "50%",
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              background: isHovered
                ? `radial-gradient(circle at 40% 40%, ${item.color}33, ${item.color}18)`
                : "rgba(255,255,255,0.08)",
              border: `2px solid ${isHovered ? item.color : "rgba(255,255,255,0.2)"}`,
              boxShadow: isHovered
                ? `0 0 20px ${item.color}55, 0 4px 16px rgba(0,0,0,0.3)`
                : "0 4px 16px rgba(0,0,0,0.2)",
              backdropFilter: "blur(8px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              cursor: "pointer",
              outline: "none",
              transition: "border-color 0.25s, box-shadow 0.25s, background 0.25s",
              zIndex: 10,
            }}
          >
            <Icon
              style={{
                width: 28,
                height: 28,
                color: isHovered ? item.color : "rgba(255,255,255,0.85)",
                transition: "color 0.25s",
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: isHovered ? item.color : "rgba(255,255,255,0.85)",
                letterSpacing: "0.03em",
                textAlign: "center",
                lineHeight: 1.2,
                transition: "color 0.25s",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </span>
          </motion.button>
        );
      })}

      {/* Center brain icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.12)",
          border: "2px solid rgba(255,255,255,0.3)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 30px rgba(255,255,255,0.15), 0 4px 20px rgba(0,0,0,0.3)",
          zIndex: 20,
          position: "relative",
        }}
      >
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Brain style={{ width: 36, height: 36, color: "rgba(255,255,255,0.9)" }} />
        </motion.div>
      </motion.div>
    </div>
  );
}