import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Book,
  Smile,
  Baby,
  Home,
  Brain,
  BarChart2,
  Plus,
  Users,
} from 'lucide-react';

const MENU_ITEMS = [
  { label: 'Apprentissages', icon: Book, target: '/items-apprentissages' },
  { label: 'Comportement', icon: Smile, target: '/items-comportement' },
  { label: 'Développement', icon: Baby, target: '/items-developpement' },
  { label: 'Contexte', icon: Home, target: '/items-contexte' },
  { label: 'Analyse', icon: Brain, target: '/analyse-eda' },
  { label: 'Statistiques', icon: BarChart2, target: '/stats-annuelles' },
  { label: 'Nouvel élève', icon: Plus, target: '/fiche-eleve' },
  { label: 'Élèves', icon: Users, target: '/liste-eleves' },
];

const RADIUS = 120;
const ANGLE_STEP = (2 * Math.PI) / MENU_ITEMS.length;

export default function CircularMenuEDA() {
  const getPosition = (index) => {
    const angle = index * ANGLE_STEP - Math.PI / 2;
    const x = Math.cos(angle) * RADIUS;
    const y = Math.sin(angle) * RADIUS;
    return { x, y };
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center rounded-3xl bg-gradient-to-br from-blue-400 via-blue-500 to-slate-600 p-8">
      {/* Menu Items - Fixed */}
      <motion.div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {MENU_ITEMS.map((item, index) => {
          const { x, y } = getPosition(index);
          const Icon = item.icon;

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
                x: x - 40,
                y: y - 40,
              }}
              className="pointer-events-auto"
            >
              <Link to={item.target}>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="flex flex-col items-center justify-center gap-2 w-20 h-20 rounded-full bg-gradient-to-br from-white/35 to-white/15 backdrop-blur-md text-slate-700 border border-white/40 shadow-lg hover:from-white/45 hover:to-white/25 transition-all"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] font-medium text-center leading-tight">
                    {item.label}
                  </span>
                </motion.button>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Center Button with Luminescent Border */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-20 w-20 h-20 rounded-full bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-md text-slate-600 hover:from-white/50 hover:to-white/30 transition-all flex items-center justify-center border-2 border-white/60 shadow-lg pointer-events-auto"
        style={{
          boxShadow: '0 0 20px rgba(147, 197, 253, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        }}
        disabled
      >
        <Menu className="w-7 h-7" />
      </motion.button>
    </div>
  );
}