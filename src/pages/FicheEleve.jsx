import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import ScreenLayout from '@/components/tree/ScreenLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ClipboardList, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';

export default function FicheEleve() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ prenom: '', nom: '', age: '', classe: '' });
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState(null);

  const handleEleveChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    if (formData.prenom && formData.nom) {
      const created = await base44.entities.FicheEleve.create({
        nom: formData.nom,
        prenom: formData.prenom,
        age: formData.age ? Number(formData.age) : undefined,
        classe: formData.classe,
        date: new Date().toISOString().split('T')[0],
      });
      setSavedId(created.id);
      setSaved(true);
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



          {!saved ? (
            <Button
              onClick={handleSave}
              className="w-full gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              Enregistrer
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <p className="text-center text-sm font-medium text-chart-2">✓ Fiche créée !</p>
              <Button
                onClick={() => navigate(`/diagnostic-eleve?id=${savedId}`)}
                className="w-full gap-2 bg-primary hover:bg-primary/90"
              >
                <ClipboardList className="w-4 h-4" />
                Démarrer l'observation
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="w-full gap-2"
              >
                <Users className="w-4 h-4" />
                Voir mes élèves
              </Button>
            </motion.div>
          )}
        </motion.div>
      </ScreenLayout>
    </div>
  );
}