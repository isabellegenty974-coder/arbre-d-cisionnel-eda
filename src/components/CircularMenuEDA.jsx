import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';

const MENU_ITEMS = [
  { label: 'Apprentissages', target: '/items-apprentissages', color: 'from-blue-400 to-blue-600', icon: '📚', description: 'Lecture, écriture, mathématiques' },
  { label: 'Comportement', target: '/items-comportement', color: 'from-rose-400 to-rose-600', icon: '💝', description: 'Comportement et émotions' },
  { label: 'Développement', target: '/items-developpement', color: 'from-teal-400 to-teal-600', icon: '🌱', description: 'Langage et motricité' },
  { label: 'Contexte', target: '/items-contexte', color: 'from-emerald-400 to-emerald-600', icon: '🏠', description: 'Famille et environnement' },
  { label: 'Analyse', target: '/analyse-eda', color: 'from-violet-400 to-violet-600', icon: '🧠', description: 'Résultats et hypothèses' },
  { label: 'Statistiques', target: '/stats-annuelles', color: 'from-amber-400 to-amber-600', icon: '📊', description: 'Vue d\'ensemble annuelle' },
  { label: 'Nouvel élève', target: '/fiche-eleve', color: 'from-indigo-400 to-indigo-600', icon: '👤', description: 'Créer une fiche élève' },
  { label: 'Élèves', target: '/liste-eleves', color: 'from-cyan-400 to-cyan-600', icon: '👥', description: 'Consulter les élèves' },
];

const RADIUS = 120;
const ANGLE_STEP = (2 * Math.PI) / MENU_ITEMS.length;

function MenuItem({ item, index, scrollY }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const getPosition = (idx) => {
    const angle = idx * ANGLE_STEP - Math.PI / 2;
    const x = Math.cos(angle) * RADIUS;
    const y = Math.sin(angle) * RADIUS;
    return { x, y };
  };

  const { x, y } = getPosition(index);
  const parallaxY = scrollY * 0.3 * (index % 2 === 0 ? 1 : -1);

  return (
    <motion.div
      key={index}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration: 0.4,
        delay: index * 0.04,
        ease: 'easeOut',
      }}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        x: x,
        y: y + parallaxY,
        marginLeft: -40,
        marginTop: -40,
      }}
      className="pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={item.target}>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className={`flex flex-col items-center justify-center gap-1 w-20 h-20 rounded-full bg-gradient-to-br ${item.color} text-white border-2 border-white/50 shadow-lg hover:shadow-xl transition-all`}
        >
          <span className="text-2xl">{item.icon}</span>
          <span className="text-[8px] font-bold text-center leading-tight">
            {item.label}
          </span>
        </motion.button>
      </Link>

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: -50, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3 py-2 rounded-lg bg-white/95 backdrop-blur text-slate-800 text-xs font-medium whitespace-nowrap shadow-lg z-50 pointer-events-none"
          >
            {item.description}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-white/95 transform rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CircularMenuEDA() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800">
      {/* Menu Items */}
      <motion.div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {MENU_ITEMS.map((item, index) => (
          <MenuItem key={index} item={item} index={index} scrollY={scrollY} />
        ))}
      </motion.div>

      {/* Center Button with Luminescent Border */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-20 w-20 h-20 rounded-full bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-md text-slate-600 hover:from-white/50 hover:to-white/30 transition-all flex flex-col items-center justify-center gap-1 border-2 border-white/60 shadow-lg pointer-events-auto"
        style={{
          boxShadow: '0 0 20px rgba(147, 197, 253, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        }}
        disabled
      >
        <Menu className="w-5 h-5" />
        <span className="text-[8px] font-medium">Menu</span>
      </motion.button>
    </div>
  );
}