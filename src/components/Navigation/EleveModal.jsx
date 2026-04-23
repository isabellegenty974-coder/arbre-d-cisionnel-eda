import { useState } from 'react';
import { useDiagnostic } from '@/lib/DiagnosticContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function EleveModal({ isOpen, onClose }) {
  const { eleve, setCurrentEleve } = useDiagnostic();
  const [formData, setFormData] = useState(eleve || { nom: '', prenom: '', age: '', classe: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentEleve(formData);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette fiche élève ?')) {
      setCurrentEleve(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-xl p-6 w-full max-w-sm mx-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Informations de l'élève</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Prénom</label>
            <Input
              type="text"
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              placeholder="Prénom"
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Nom</label>
            <Input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Nom"
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Âge</label>
            <Input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="Âge"
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Classe</label>
            <Input
              type="text"
              value={formData.classe}
              onChange={(e) => setFormData({ ...formData, classe: e.target.value })}
              placeholder="Ex: CM2"
              className="w-full"
            />
          </div>
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
                Enregistrer
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Annuler
              </Button>
            </div>
            {eleve?.prenom && (
              <Button type="button" variant="destructive" className="w-full" onClick={handleDelete}>
                Supprimer la fiche
              </Button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}