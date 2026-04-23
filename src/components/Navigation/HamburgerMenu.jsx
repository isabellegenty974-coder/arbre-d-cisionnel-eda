import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, BookOpen, Cloud, Brain, Home as HomeIcon, FileText, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EleveModal from './EleveModal';
import { useDiagnostic } from '@/lib/DiagnosticContext';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFlipped, setIsFlipped] = useState({});
  const [showEleveModal, setShowEleveModal] = useState(false);
  const { eleve } = useDiagnostic();

  const modules = [
    { label: 'Apprentissage', emoji: '📘', to: '/apprentissage', color: 'from-primary/20 to-primary/10' },
    { label: 'Comportement', emoji: '🌧️', to: '/comportement', color: 'from-accent/20 to-accent/10' },
    { label: 'Développement', emoji: '🧠', to: '/developpement', color: 'from-chart-2/20 to-chart-2/10' },
    { label: 'Contexte', emoji: '🏠', to: '/contexte', color: 'from-chart-4/20 to-chart-4/10' },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-card border border-border hover:bg-secondary transition-colors"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </motion.button>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 z-30"
            />
            <motion.div
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-screen w-80 bg-card border-r border-border z-40 overflow-y-auto p-6"
            >
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-xl font-display font-semibold text-foreground">Arbre EDA</h2>
                {eleve?.prenom && (
                  <p className="text-sm text-muted-foreground mt-1">{eleve.prenom} {eleve.nom}</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-2 mb-8">
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-foreground font-medium"
                >
                  <HomeIcon className="w-4 h-4" />
                  Accueil
                </Link>
                <Link
                  to="/resume"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-foreground font-medium"
                >
                  <FileText className="w-4 h-4" />
                  Résumé
                </Link>
                <button
                  onClick={() => {
                    setShowEleveModal(true);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-foreground font-medium"
                >
                  <Settings className="w-4 h-4" />
                  Élève
                </button>
              </div>

              {/* Modules */}
              <div>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-4">Modules</h3>
                <div className="space-y-3">
                  {modules.map((mod, idx) => (
                    <motion.div
                      key={mod.to}
                      onClick={() => setIsFlipped(prev => ({ ...prev, [idx]: !prev[idx] }))}
                      className="cursor-pointer"
                      layout
                    >
                      <motion.div
                        animate={{ rotateY: isFlipped[idx] ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ perspective: 1000 }}
                        className="relative h-32"
                      >
                        {/* Front */}
                        <motion.div
                          animate={{ opacity: isFlipped[idx] ? 0 : 1 }}
                          className="absolute inset-0 p-4 rounded-lg bg-gradient-to-br border border-border flex flex-col items-center justify-center"
                          style={{
                            backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                            '--tw-gradient-stops': `var(--${mod.color.split(' ')[0]})`,
                            backfaceVisibility: 'hidden'
                          }}
                        >
                          <span className="text-4xl mb-2">{mod.emoji}</span>
                          <p className="text-sm font-medium text-foreground text-center">{mod.label}</p>
                        </motion.div>

                        {/* Back */}
                        <motion.div
                          animate={{ opacity: isFlipped[idx] ? 1 : 0 }}
                          className="absolute inset-0 p-4 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center"
                        >
                          <Link
                            to={mod.to}
                            onClick={() => setIsOpen(false)}
                            className="text-center text-sm font-medium text-primary hover:underline"
                          >
                            Accéder au module →
                          </Link>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Eleve Modal */}
      <EleveModal isOpen={showEleveModal} onClose={() => setShowEleveModal(false)} />
    </>
  );
}