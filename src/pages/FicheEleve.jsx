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
  const urlParams = new URLSearchParams(window.location.search);
  const [saved, setSaved] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [ecole, setEcole] = useState(urlParams.get('ecole') || '');
  const [classe, setClasse] = useState(urlParams.get('classe') || '');
  const ECOLES = ['Célimène', 'Malraux', 'Lacaussade élémentaire', 'Lacaussade maternelle', 'Lorraine', 'Vergès', 'Julenon', 'Joron', 'Jamin', 'Langevin'];
  const [dateNaissance, setDateNaissance] = useState('');
  const [ageCalcule, setAgeCalcule] = useState(null);
  const [savedId, setSavedId] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [anneeActive, setAnneeActive] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.AnneeScolaire.filter({ est_active: true }).catch(() => [])
    ]).then(([u, annees]) => {
      setCurrentUser(u);
      if (annees.length > 0) setAnneeActive(annees[0].libelle);
    }).catch(() => {});
  }, []);

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
    defaultValues: { 
      prenom: urlParams.get('prenom') || '', 
      nom: urlParams.get('nom') || '', 
      age: '', 
      classe: classe
    },
    resolver: undefined
  });

  const onSubmit = async (data) => {
    if (!currentUser) return;
    
    const fullName = currentUser.full_name || '';
    const membres = await base44.entities.MembreEquipe.filter({ email: currentUser.email }).catch(() => []);
    const profession = membres.length > 0 ? membres[0].profession : '';
    
    const created = await base44.entities.FicheEleve.create({
      nom: data.nom,
      prenom: data.prenom,
      age: ageCalcule !== null ? ageCalcule : undefined,
      date_naissance: dateNaissance || undefined,
      classe: classe || data.classe || undefined,
      ecole: ecole || undefined,
      date: new Date().toISOString().split('T')[0],
      annee_scolaire: anneeActive || undefined,
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
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAF8] to-[#F5F0E8]">
      <HamburgerMenu />
      <ScreenLayout title="📋 Nouvelle observation" subtitle="Complétez les informations de l'élève">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
          {/* Section Identité */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6 p-6 rounded-2xl bg-white border border-[#D4A574]/20 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-[#D4A574]/10 flex items-center justify-center">
                <span className="text-lg">👤</span>
              </div>
              <h2 className="font-bold text-lg text-[#0F172A]">Identité de l'élève</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-[#0F172A] block mb-2">Prénom *</label>
                <Input
                  {...register('prenom', eleveValidationRules.prenom)}
                  placeholder="Prénom"
                  className={`${errors.prenom ? 'border-destructive' : ''} rounded-lg`}
                />
                {errors.prenom && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-destructive">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.prenom.message}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0F172A] block mb-2">Nom *</label>
                <Input
                  {...register('nom', eleveValidationRules.nom)}
                  placeholder="Nom"
                  className={`${errors.nom ? 'border-destructive' : ''} rounded-lg`}
                />
                {errors.nom && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-destructive">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.nom.message}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#D4A574]/10 mt-4">
              <div>
                <label className="text-sm font-semibold text-[#0F172A] block mb-2">Date de naissance</label>
                <div className="flex items-center gap-2">
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    <select
                      value={jourNaissance}
                      onChange={e => { setJourNaissance(e.target.value); handleDateNaissance(e.target.value, moisNaissance, anneeNaissance); }}
                      className="h-10 rounded-lg border border-input bg-background px-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">Jour</option>
                      {Array.from({ length: daysInMonth(moisNaissance, anneeNaissance) }, (_, i) => i + 1).map(d => (
                        <option key={d} value={String(d)}>{d}</option>
                      ))}
                    </select>
                    <select
                      value={moisNaissance}
                      onChange={e => { setMoisNaissance(e.target.value); handleDateNaissance(jourNaissance, e.target.value, anneeNaissance); }}
                      className="h-10 rounded-lg border border-input bg-background px-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">Mois</option>
                      {months.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                    </select>
                    <select
                      value={anneeNaissance}
                      onChange={e => { setAnneeNaissance(e.target.value); handleDateNaissance(jourNaissance, moisNaissance, e.target.value); }}
                      className="h-10 rounded-lg border border-input bg-background px-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">Année</option>
                      {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
                    </select>
                  </div>
                  {ageCalcule !== null ? (
                    <span className="text-sm font-bold text-[#D4A574] whitespace-nowrap bg-[#D4A574]/10 px-3 py-2 rounded-lg">{ageCalcule} ans</span>
                  ) : (
                    <span className="text-sm text-[#0F172A]/30 whitespace-nowrap">— ans</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0F172A] block mb-2">Classe</label>
                <Input
                  {...register('classe', eleveValidationRules.classe)}
                  placeholder="Ex: CM2"
                  value={classe}
                  onChange={e => setClasse(e.target.value)}
                  className={`${errors.classe ? 'border-destructive' : ''} rounded-lg`}
                />
                {errors.classe && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-destructive">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.classe.message}
                  </div>
                )}
                {classe && urlParams.get('classe') && <p className="text-xs text-gray-500 mt-1">✓ Préremplie</p>}
              </div>
            </div>
          </motion.div>

          {/* Section Contexte Scolaire */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 p-6 rounded-2xl bg-white border border-[#D4A574]/20 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-[#D4A574]/10 flex items-center justify-center">
                <span className="text-lg">🏫</span>
              </div>
              <h2 className="font-bold text-lg text-[#0F172A]">Contexte scolaire</h2>
            </div>
            <div>
              <label className="text-sm font-semibold text-[#0F172A] block mb-2">École</label>
              <select
                value={ecole}
                onChange={e => setEcole(e.target.value)}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">-- Sélectionner une école --</option>
                {ECOLES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              {ecole && urlParams.get('ecole') && <p className="text-xs text-gray-500 mt-1">✓ Préremplie</p>}
            </div>
          </motion.div>

          {/* Actions */}
          {!saved ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                type="submit"
                className="w-full gap-2 h-11 bg-[#D4A574] hover:bg-[#C49464] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-soft"
              >
                <Plus className="w-5 h-5" />
                Créer la fiche
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">Ctrl+S pour enregistrer rapidement</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-2xl bg-gradient-to-r from-chart-2/10 to-chart-2/5 border border-chart-2/30">
                <p className="text-center text-sm font-semibold text-chart-2 flex items-center justify-center gap-2">
                  <span className="text-lg">✓</span>
                  Fiche créée avec succès !
                </p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="p-5 rounded-2xl bg-[#F5F0E8] border-2 border-[#D4A574]/20"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Camera className="w-5 h-5 text-[#D4A574]" />
                  <h3 className="font-semibold text-[#0F172A]">Photo synthèse (optionnel)</h3>
                </div>
                <PhotoEEUpload 
                  ficheId={savedId} 
                  initialPhotoUrl={photoUrl}
                  onPhotoUploaded={setPhotoUrl}
                />
              </motion.div>
              
              <Button
                onClick={() => navigate(`/detail-fiche?id=${savedId}`)}
                className="w-full gap-2 h-11 bg-[#D4A574] hover:bg-[#C49464] text-white font-semibold rounded-lg shadow-soft"
              >
                <ClipboardList className="w-5 h-5" />
                Voir la fiche complète
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="w-full gap-2 h-11 rounded-lg"
              >
                <Users className="w-5 h-5" />
                Retour au tableau de bord
              </Button>
            </motion.div>
          )}
        </form>
      </ScreenLayout>
    </div>
  );
}