import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  const [isOpen, setIsOpen] = useState(false);

  const getPosition = (index) => {
    const angle = index * ANGLE_STEP - Math.PI / 2;
    const x = Math.cos(angle) * RADIUS;
    const y = Math.sin(angle) * RADIUS;
    return { x, y };
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Center Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-20 w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-soft-lg hover:shadow-soft-lg transition-shadow flex items-center justify-center"
      >
        <Menu className="w-6 h-6" />
      </motion.button>

      {/* Menu Items */}
      {isOpen && (
        <motion.div className="absolute inset-0 pointer-events-none">
          {MENU_ITEMS.map((item, index) => {
            const { x, y } = getPosition(index);
            const Icon = item.icon;

            return (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05,
                  ease: 'easeOut',
                }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  x: x - 28,
                  y: y - 28,
                }}
                className="pointer-events-auto"
              >
                <Link to={item.target} onClick={() => setIsOpen(false)}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-1 w-14 p-2 rounded-full bg-accent text-accent-foreground shadow-soft hover:shadow-soft-md transition-shadow"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] font-medium text-center leading-tight whitespace-nowrap">
                      {item.label.split(' ')[0]}
                    </span>
                  </motion.button>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}