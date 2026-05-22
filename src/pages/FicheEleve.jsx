import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import ScreenLayout from '@/components/tree/ScreenLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ClipboardList, Users, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import { useForm } from 'react-hook-form';
import { eleveValidationRules } from '@/lib/formValidation';

export default function FicheEleve() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const { register, handleSubmit, formState: { errors, isValid }, watch } = useForm({
    mode: 'onChange',
    defaultValues: { prenom: '', nom: '', age: '', classe: '' },
    resolver: undefined
  });

  const onSubmit = async (data) => {
    const created = await base44.entities.FicheEleve.create({
      nom: data.nom,
      prenom: data.prenom,
      age: data.age ? Number(data.age) : undefined,
      classe: data.classe,
      date: new Date().toISOString().split('T')[0],
    });
    setSavedId(created.id);
    setSaved(true);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const form = document.querySelector('form');
        if (form) form.requestSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HamburgerMenu />
      <ScreenLayout title="👤 Créer une fiche élève">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-primary/5 border-2 border-primary/20 space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Prénom *</label>
              <Input
                {...register('prenom', eleveValidationRules.prenom)}
                placeholder="Prénom"
                className={errors.prenom ? 'border-destructive' : ''}
              />
              {errors.prenom && (
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-destructive">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.prenom.message}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Nom *</label>
              <Input
                {...register('nom', eleveValidationRules.nom)}
                placeholder="Nom"
                className={errors.nom ? 'border-destructive' : ''}
              />
              {errors.nom && (
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-destructive">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.nom.message}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Âge</label>
              <Input
                {...register('age', { ...eleveValidationRules.age, valueAsNumber: true })}
                type="number"
                placeholder="Âge (2-25 ans)"
                className={errors.age ? 'border-destructive' : ''}
              />
              {errors.age && (
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-destructive">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.age.message}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Classe</label>
              <Input
                {...register('classe', eleveValidationRules.classe)}
                placeholder="Ex: CM2"
                className={errors.classe ? 'border-destructive' : ''}
              />
              {errors.classe && (
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-destructive">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.classe.message}
                </div>
              )}
            </div>
          </motion.div>

          {!saved ? (
            <Button
              type="submit"
              disabled={!isValid}
              className="w-full gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </form>
      </ScreenLayout>
    </div>
  );
}