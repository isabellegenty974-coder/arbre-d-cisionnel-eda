import { useNavigate } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

const items = [
  { label: "Apprentissage", emoji: "📘", to: "/apprentissage", angle: -90 },
  { label: "Comportement",  emoji: "🌧️", to: "/comportement",  angle: 0   },
  { label: "Développement", emoji: "🧠", to: "/developpement", angle: 90  },
  { label: "Contexte",      emoji: "🏠", to: "/contexte",      angle: 180 },
];

const RADIUS = 170;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

export default function CircularMenu() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [clicked, setClicked] = useState(null);

  const handleClick = (item) => {
    setClicked(item.to);
    setTimeout(() => navigate(item.to), 220);
  };

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 500, height: 500 }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(74,144,226,0.10) 0%, rgba(74,144,226,0.03) 45%, transparent 70%)",
        }}
      />

      {/* Rotating ring */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        {items.map((item) => {
          const rad = toRad(item.angle);
          const x = RADIUS * Math.cos(rad);
          const y = RADIUS * Math.sin(rad);
          const isHovered = hovered === item.to;
          const isClicked = clicked === item.to;

          return (
            <motion.button
              key={item.to}
              onClick={() => handleClick(item)}
              onMouseEnter={() => setHovered(item.to)}
              onMouseLeave={() => setHovered(null)}
              animate={
                isClicked
                  ? { scale: 1.08, opacity: 0.7 }
                  : isHovered
                  ? { scale: 1.06 }
                  : { scale: 1, opacity: 1 }
              }
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 140,
                height: 140,
                borderRadius: "50%",
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                background: "rgba(255,255,255,0.92)",
                border: `1.5px solid ${isHovered ? "#4A90E2" : "#CCCCCC"}`,
                boxShadow: isHovered
                  ? "0 0 0 4px rgba(74,144,226,0.18), 0 4px 24px rgba(74,144,226,0.22), 0 4px 12px rgba(0,0,0,0.10)"
                  : "0 4px 12px rgba(0,0,0,0.15)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                cursor: "pointer",
                outline: "none",
                transition: "border-color 0.25s, box-shadow 0.25s",
              }}
            >
              {/* Counter-rotate so emoji stays upright */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
              >
                {/* Pulsing emoji */}
                <motion.span
                  animate={{ opacity: [1, 0.82, 1] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  style={{ fontSize: 48, lineHeight: 1 }}
                >
                  {item.emoji}
                </motion.span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: isHovered ? "#2563EB" : "#444",
                    letterSpacing: "0.02em",
                    transition: "color 0.25s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </span>
              </motion.div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Central glow dot */}
      <motion.div
        animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.08, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(74,144,226,0.5) 0%, transparent 80%)",
          boxShadow: "0 0 18px 6px rgba(74,144,226,0.18)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}