import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import ScreenLayout from '@/components/tree/ScreenLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ClipboardList, Users, AlertCircle, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import { useForm } from 'react-hook-form';
import { eleveValidationRules } from '@/lib/formValidation';
import PhotoEEUpload from '@/components/PhotoEEUpload';

export default function FicheEleve() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [ecole, setEcole] = useState('');
  const ECOLES = ['Célimène', 'Malraux', 'Lacaussade élémentaire', 'Lacaussade maternelle', 'Lorraine', 'Vergès', 'Julenon', 'Joron', 'Jamin', 'Langevin'];
  const [dateNaissance, setDateNaissance] = useState('');
  const [ageCalcule, setAgeCalcule] = useState(null);
  const [savedId, setSavedId] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);

  const [jourNaissance, setJourNaissance] = useState('');
  const [moisNaissance, setMoisNaissance] = useState('');
  const [anneeNaissance, setAnneeNaissance] = useState('');

  const handleDateNaissance = (jour, mois, annee) => {
    if (!jour || !mois || !annee) { setDateNaissance(''); setAgeCalcule(null); return; }
    const isoDate = `${annee}-${mois.padStart(2,'0')}-${jour.padStart(2,'0')}`;
    setDateNaissance(isoDate);
    const today = new Date();
    const birth = new Date(isoDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    setAgeCalcule(age >= 0 ? age : null);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 3 - i);
  const months = [
    { v: '1', l: 'Janvier' }, { v: '2', l: 'Février' }, { v: '3', l: 'Mars' },
    { v: '4', l: 'Avril' }, { v: '5', l: 'Mai' }, { v: '6', l: 'Juin' },
    { v: '7', l: 'Juillet' }, { v: '8', l: 'Août' }, { v: '9', l: 'Septembre' },
    { v: '10', l: 'Octobre' }, { v: '11', l: 'Novembre' }, { v: '12', l: 'Décembre' },
  ];
  const daysInMonth = (mois, annee) => {
    if (!mois || !annee) return 31;
    return new Date(Number(annee), Number(mois), 0).getDate();
  };
  const { register, handleSubmit, formState: { errors, isValid }, watch } = useForm({
    mode: 'onChange',
    defaultValues: { prenom: '', nom: '', age: '', classe: '' },
    resolver: undefined
  });

  const onSubmit = async (data) => {
    const user = await base44.auth.me();
    const fullName = user.full_name || 'Utilisateur';
    const profession = user.profession || 'Profession non renseignée';
    
    const created = await base44.entities.FicheEleve.create({
      nom: data.nom,
      prenom: data.prenom,
      age: ageCalcule !== null ? ageCalcule : undefined,
      date_naissance: dateNaissance || undefined,
      classe: data.classe,
      ecole: ecole || undefined,
      date: new Date().toISOString().split('T')[0],
      createdByName: fullName,
      createdByProfession: profession,
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
    <div className="min-h-screen bg-[#FAFAF8]">
      <HamburgerMenu />
      <ScreenLayout title="👤 Créer une fiche élève">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-[#F5F0E8] border-2 border-[#D4A574]/30 space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-[#0F172A] block mb-2">Prénom *</label>
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
              <label className="text-sm font-medium text-[#0F172A] block mb-2">Nom *</label>
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
              <label className="text-sm font-medium text-[#0F172A] block mb-2">Date de naissance</label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={jourNaissance}
                  onChange={e => { setJourNaissance(e.target.value); handleDateNaissance(e.target.value, moisNaissance, anneeNaissance); }}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Jour</option>
                  {Array.from({ length: daysInMonth(moisNaissance, anneeNaissance) }, (_, i) => i + 1).map(d => (
                    <option key={d} value={String(d)}>{d}</option>
                  ))}
                </select>
                <select
                  value={moisNaissance}
                  onChange={e => { setMoisNaissance(e.target.value); handleDateNaissance(jourNaissance, e.target.value, anneeNaissance); }}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Mois</option>
                  {months.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                </select>
                <select
                  value={anneeNaissance}
                  onChange={e => { setAnneeNaissance(e.target.value); handleDateNaissance(jourNaissance, moisNaissance, e.target.value); }}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Année</option>
                  {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
                </select>
              </div>
              {ageCalcule !== null && (
                <p className="text-xs text-[#0F172A]/60 mt-1.5">→ Âge calculé : <strong>{ageCalcule} ans</strong></p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-[#0F172A] block mb-2">École</label>
              <select
                value={ecole}
                onChange={e => setEcole(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">-- Sélectionner une école --</option>
                {ECOLES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#0F172A] block mb-2">Classe</label>
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
              className="w-full gap-2 bg-[#D4A574] hover:bg-[#C49464] disabled:opacity-50 disabled:cursor-not-allowed text-white"
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
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 rounded-lg bg-[#E8DCC8]/20 border border-[#D4A574]"
              >
                <PhotoEEUpload 
                  ficheId={savedId} 
                  initialPhotoUrl={photoUrl}
                  onPhotoUploaded={setPhotoUrl}
                />
              </motion.div>
              
              <Button
                onClick={() => navigate(`/diagnostic-eleve?id=${savedId}`)}
                className="w-full gap-2 bg-[#D4A574] hover:bg-[#C49464] text-white"
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