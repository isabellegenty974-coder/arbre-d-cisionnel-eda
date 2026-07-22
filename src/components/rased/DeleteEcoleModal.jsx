import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Trash2, Loader } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { titleCase } from '@/lib/utils';

export default function DeleteEcoleModal({ ecole, eleveCount, onClose, onDeleted }) {
  const [step, setStep] = useState(1);
  const [typedName, setTypedName] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const nameMatches = typedName.trim().toLowerCase() === ecole?.nom?.trim().toLowerCase();

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await base44.entities.EleveRased.deleteMany({ ecole_id: ecole.id }).catch(() => {});
      await base44.entities.ClasseEcole.deleteMany({ ecole_id: ecole.id }).catch(() => {});
      await base44.entities.EcoleRased.delete(ecole.id);
      onDeleted();
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
      setDeleting(false);
    }
  };

  const handleClose = () => {
    if (deleting) return;
    setStep(1);
    setTypedName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={handleClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-md w-full"
      >
        {/* Étape 1 : Alerte de confirmation */}
        {step === 1 && (
          <div className="text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Supprimer cette école ?</h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Vous allez supprimer l'école <strong className="text-gray-900">{titleCase(ecole?.nom)}</strong>
              {' '}ainsi que toutes ses classes et les{' '}
              <strong className="text-red-600">{eleveCount}</strong>
              {' '}élève{eleveCount > 1 ? 's' : ''} associé{eleveCount > 1 ? 's' : ''}.
            </p>
            <p className="text-xs text-gray-400 mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleClose} disabled={deleting}>
                Annuler
              </Button>
              <Button onClick={() => setStep(2)} className="bg-red-600 hover:bg-red-700 text-white border-0">
                Continuer
              </Button>
            </div>
          </div>
        )}

        {/* Étape 2 : Saisie du nom */}
        {step === 2 && (
          <div>
            <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Confirmation finale</h3>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Tapez le nom de l'école pour confirmer la suppression :
            </p>
            <div className="bg-gray-50 rounded-xl px-4 py-2 mb-4 text-center">
              <p className="text-sm font-bold text-gray-900">{titleCase(ecole?.nom)}</p>
            </div>
            <input
              type="text"
              autoFocus
              value={typedName}
              onChange={e => setTypedName(e.target.value)}
              placeholder="Nom de l'école…"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
              disabled={deleting}
            />
            {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
            <p className="text-xs text-gray-400 mb-5">
              {nameMatches
                ? '✓ Le nom correspond. Vous pouvez supprimer.'
                : "Le bouton s'activera quand le nom correspondra."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleClose} disabled={deleting}>
                Annuler
              </Button>
              <Button
                onClick={handleDelete}
                disabled={!nameMatches || deleting}
                className="bg-red-600 hover:bg-red-700 text-white border-0 gap-1.5 disabled:opacity-40"
              >
                {deleting
                  ? <Loader className="w-4 h-4 animate-spin" />
                  : <Trash2 className="w-4 h-4" />}
                {deleting ? 'Suppression…' : 'Supprimer définitivement'}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}