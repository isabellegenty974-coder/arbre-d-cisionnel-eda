import { useDiagnostic } from '@/lib/DiagnosticContext';
import ScreenLayout from '@/components/tree/ScreenLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';

export default function FicheEleve() {
  const { setCurrentEleve } = useDiagnostic();
  const [formData, setFormData] = useState({ prenom: '', nom: '', age: '', classe: '' });
  const [saved, setSaved] = useState(false);

  const handleEleveChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    if (formData.prenom && formData.nom) {
      setCurrentEleve(formData);
      setFormData({ prenom: '', nom: '', age: '', classe: '' });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HamburgerMenu />
      <ScreenLayout title="👤 Créer une fiche élève">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto space-y-6"
        >
          <div className="p-6 rounded-xl bg-primary/5 border-2 border-primary/20 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Prénom</label>
              <Input
                value={formData.prenom}
                onChange={(e) => handleEleveChange('prenom', e.target.value)}
                placeholder="Prénom"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Nom</label>
              <Input
                value={formData.nom}
                onChange={(e) => handleEleveChange('nom', e.target.value)}
                placeholder="Nom"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Âge</label>
              <Input
                type="number"
                value={formData.age}
                onChange={(e) => handleEleveChange('age', e.target.value)}
                placeholder="Âge"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Classe</label>
              <Input
                value={formData.classe}
                onChange={(e) => handleEleveChange('classe', e.target.value)}
                placeholder="Ex: CM2"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            className={`w-full gap-2 transition-all ${
              saved
                ? 'bg-chart-2 hover:bg-chart-2/90'
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            <Plus className="w-4 h-4" />
            {saved ? '✓ Enregistré' : 'Enregistrer'}
          </Button>
        </motion.div>
      </ScreenLayout>
    </div>
  );
}