import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CENTER_ITEM = { label: 'Tableau de bord', target: '/dashboard', color: 'from-cyan-400 to-cyan-600', icon: '📋' };

const MENU_ITEMS = [
  { label: 'Apprentissages', target: '/items-apprentissages', color: 'from-blue-400 to-blue-600', icon: '📚' },
  { label: 'Comportement', target: '/items-comportement', color: 'from-rose-400 to-rose-600', icon: '💝' },
  { label: 'Développement', target: '/items-developpement', color: 'from-teal-400 to-teal-600', icon: '🌱' },
  { label: 'Contexte', target: '/items-contexte', color: 'from-emerald-400 to-emerald-600', icon: '🏠' },
  { label: 'Analyse', target: '/analyse-eda', color: 'from-violet-400 to-violet-600', icon: '🧠' },
  { label: 'Statistiques', target: '/stats-annuelles', color: 'from-amber-400 to-amber-600', icon: '📊' },
  { label: 'Nouvel élève', target: '/fiche-eleve', color: 'from-indigo-400 to-indigo-600', icon: '👤' },
];

const RADIUS = 120;
const ANGLE_STEP = (2 * Math.PI) / MENU_ITEMS.length;

export default function CircularMenuEDA() {
  return (
    <div className="relative w-full h-full flex items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800">
      {/* Menu Items */}
      <div className="absolute inset-0 flex items-center justify-center">
        {MENU_ITEMS.map((item, index) => {
          const angle = index * ANGLE_STEP - Math.PI / 2;
          const x = Math.cos(angle) * RADIUS;
          const y = Math.sin(angle) * RADIUS;
          return (
            <motion.div
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: index * 0.04, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                x: x,
                y: y,
                marginLeft: -40,
                marginTop: -40,
              }}
            >
              <Link to={item.target}>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className={`flex flex-col items-center justify-center gap-1 w-20 h-20 rounded-full bg-gradient-to-br ${item.color} text-white border-2 border-white/50 shadow-lg hover:shadow-xl transition-all`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[8px] font-bold text-center leading-tight">{item.label}</span>
                </motion.button>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Center Item */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-20"
      >
        <Link to={CENTER_ITEM.target}>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className={`flex flex-col items-center justify-center gap-1 w-20 h-20 rounded-full bg-gradient-to-br ${CENTER_ITEM.color} text-white border-2 border-white/50 shadow-lg hover:shadow-xl transition-all`}
          >
            <span className="text-2xl">{CENTER_ITEM.icon}</span>
            <span className="text-[8px] font-bold text-center leading-tight">{CENTER_ITEM.label}</span>
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}