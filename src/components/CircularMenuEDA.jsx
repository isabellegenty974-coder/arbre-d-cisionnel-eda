import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  BookOpen,
  Heart,
  Sprout,
  Home,
  Brain,
  BarChart2,
  UserPlus,
  Users,
} from 'lucide-react';

const MENU_ITEMS = [
  { label: 'Apprentissages', icon: BookOpen, target: '/items-apprentissages', color: 'from-blue-300 to-blue-500' },
  { label: 'Comportement', icon: Heart, target: '/items-comportement', color: 'from-purple-300 to-purple-500' },
  { label: 'Développement', icon: Sprout, target: '/items-developpement', color: 'from-cyan-300 to-cyan-500' },
  { label: 'Contexte', icon: Home, target: '/items-contexte', color: 'from-emerald-300 to-emerald-500' },
  { label: 'Analyse', icon: Brain, target: '/analyse-eda', color: 'from-pink-300 to-pink-500' },
  { label: 'Statistiques', icon: BarChart2, target: '/stats-annuelles', color: 'from-yellow-300 to-yellow-500' },
  { label: 'Nouvel élève', icon: UserPlus, target: '/fiche-eleve', color: 'from-orange-300 to-orange-500' },
  { label: 'Élèves', icon: Users, target: '/liste-eleves', color: 'from-red-300 to-red-500' },
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
    <div className="relative w-full h-full flex items-center justify-center rounded-3xl bg-gradient-to-br from-blue-400 via-blue-500 to-slate-600">
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
                  className={`flex flex-col items-center justify-center gap-2 w-20 h-20 rounded-full bg-gradient-to-br ${item.color} text-white border border-white/60 shadow-lg hover:shadow-xl transition-all`}
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