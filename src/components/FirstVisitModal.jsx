import { motion } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FirstVisitModal({ isOpen, onClose, onGoToTeam }) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Bienvenue</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Avant de commencer, veuillez vous enregistrer dans la section <strong>Équipe RASED</strong> pour compléter votre profil professionnel.
        </p>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Plus tard
          </Button>
          <Button onClick={onGoToTeam} className="flex-1">
            Aller à Équipe RASED
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}