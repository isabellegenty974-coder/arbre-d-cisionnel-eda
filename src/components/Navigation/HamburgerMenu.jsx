import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Home as HomeIcon, FileText, User, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EleveModal from './EleveModal';
import FlipCard from '@/components/FlipCard';
import { useDiagnostic } from '@/lib/DiagnosticContext';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
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
        className="fixed top-4 right-4 z-40 p-2 rounded-lg bg-card border border-border hover:bg-secondary transition-colors"
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
              transition={{ duration: 0.15 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 z-30"
            />
            <motion.div
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed left-0 top-0 h-screen w-80 bg-card border-r border-border z-40 overflow-y-auto p-6"
            >
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-xl font-display font-semibold text-foreground">Suivis RASED</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Équipe RASED · Circonscription de La Possession</p>
                {eleve?.prenom && (
                  <p className="text-sm text-muted-foreground mt-1">{eleve.prenom} {eleve.nom}</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-1.5 mb-8">
                <Link to="/" onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-foreground font-medium">
                  <HomeIcon className="w-4 h-4" /> Accueil
                </Link>
                <Link to="/dashboard" onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-foreground font-medium"
                  title="Tableau de bord">
                  <User className="w-4 h-4" /> Tableau de bord
                </Link>
                <Link to="/fiche-eleve" onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-foreground font-medium">
                  <FileText className="w-4 h-4" /> Nouvelle observation
                </Link>
                <Link to="/evaluation-domains" onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-foreground font-medium">
                  <BarChart2 className="w-4 h-4" /> Domaines d'évaluation
                </Link>
                <Link to="/stats-annuelles" onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-foreground font-medium">
                  <BarChart2 className="w-4 h-4" /> Statistiques
                </Link>
                <Link to="/tableau-synthese" onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-foreground font-medium">
                  <BarChart2 className="w-4 h-4" /> Tableau de synthèse
                </Link>
                <Link to="/mes-ecoles" onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-foreground font-medium">
                  <User className="w-4 h-4" /> Mes écoles
                </Link>
                <Link to="/equipe-rased" onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-foreground font-medium">
                  <User className="w-4 h-4" /> Équipe RASED
                </Link>
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