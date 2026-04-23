import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function FlipCard({ label, emoji, to, color }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setIsFlipped(true)}
      onHoverEnd={() => setIsFlipped(false)}
      className="cursor-pointer h-48"
      layout
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        style={{ perspective: 1000 }}
        className="relative w-full h-full"
      >
        {/* Front */}
        <motion.div
          animate={{ opacity: isFlipped ? 0 : 1, pointerEvents: isFlipped ? 'none' : 'auto' }}
          className={`absolute inset-0 rounded-xl bg-gradient-to-br ${color} border border-border flex flex-col items-center justify-center shadow-lg`}
        >
          <motion.span
            animate={{ scale: isFlipped ? 0.8 : 1 }}
            className="text-6xl mb-4"
          >
            {emoji}
          </motion.span>
          <p className="text-lg font-semibold text-foreground text-center px-4">{label}</p>
        </motion.div>

        {/* Back */}
        <motion.div
          animate={{ opacity: isFlipped ? 1 : 0, pointerEvents: isFlipped ? 'auto' : 'none' }}
          className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shadow-lg"
        >
          <Link
            to={to}
            className="text-center font-medium text-primary hover:text-primary/80 transition-colors px-6"
          >
            Accéder au module →
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}