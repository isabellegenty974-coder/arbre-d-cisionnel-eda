import { useDiagnostic } from '@/lib/DiagnosticContext';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import ScreenLayout from '@/components/tree/ScreenLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';

export default function FicheEleve() {
  const { setCurrentEleve, selections } = useDiagnostic();

  const DOMAIN_LABELS = {
    apprentissages: '📚 Apprentissages',
    comportement: '💝 Comportement',
    developpement: '🌱 Développement',
    contexte: '🏠 Contexte',
  };

  const hasSelections = Object.values(selections).some(arr => arr.length > 0);
  const [formData, setFormData] = useState({ prenom: '', nom: '', age: '', classe: '' });
  const [saved, setSaved] = useState(false);

  const handleEleveChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    if (formData.prenom && formData.nom) {
      setCurrentEleve(formData);
      await base44.entities.FicheEleve.create({
        nom: formData.nom,
        prenom: formData.prenom,
        age: formData.age ? Number(formData.age) : undefined,
        classe: formData.classe,
        date: new Date().toISOString().split('T')[0],
      });
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

          {hasSelections && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-xl bg-secondary/40 border border-border space-y-3"
            >
              <p className="text-sm font-semibold text-foreground">📝 Items cochés</p>
              {Object.entries(DOMAIN_LABELS).map(([key, label]) => {
                const items = selections[key] || [];
                if (!items.length) return null;
                return (
                  <div key={key}>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
                    <ul className="space-y-1">
                      {items.map((item, i) => (
                        <li key={i} className="text-sm text-foreground pl-2 border-l-2 border-primary/30">
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </motion.div>
          )}

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