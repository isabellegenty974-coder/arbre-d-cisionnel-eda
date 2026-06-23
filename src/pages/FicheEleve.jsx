import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import ScreenLayout from '@/components/tree/ScreenLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ClipboardList, Users, AlertCircle, Camera, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import PhotoEEUpload from '@/components/PhotoEEUpload';

export default function FicheEleve() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [prenom, setPrenom] = useState(urlParams.get('prenom') || '');
  const [nom, setNom] = useState(urlParams.get('nom') || '');
  const [ecole, setEcole] = useState(urlParams.get('ecole') || '');
  const [classe, setClasse] = useState(urlParams.get('classe') || '');
  const [enseignant, setEnseignant] = useState(urlParams.get('enseignant') || '');
  const [dateNaissance, setDateNaissance] = useState(urlParams.get('date_naissance') || '');
  const [motif, setMotif] = useState('');
  const [ageCalcule, setAgeCalcule] = useState(null);
  const [savedId, setSavedId] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [anneeActive, setAnneeActive] = useState(null);
  const [errors, setErrors] = useState({});

  // Déterminer l'année scolaire active au montage si pas déjà chargée
  useEffect(() => {
    if (!anneeActive) {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const computed = month >= 7 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
      setAnneeActive(computed);
    }
  }, [anneeActive]);

  const [jourNaissance, setJourNaissance] = useState('');
  const [moisNaissance, setMoisNaissance] = useState('');
  const [anneeNaissance, setAnneeNaissance] = useState('');

  useEffect(() => {
    Promise.all([
      base44.entities.AnneeScolaire.filter({ est_active: true }).catch(() => [])
    ]).then(([annees]) => {
      if (annees.length > 0) setAnneeActive(annees[0].libelle);
    }).catch(() => {});

    // Pré-remplir la date de naissance si elle est passée en paramètre
    const dnParam = urlParams.get('date_naissance');
    if (dnParam) {
      const d = new Date(dnParam);
      setJourNaissance(String(d.getDate()));
      setMoisNaissance(String(d.getMonth() + 1));
      setAnneeNaissance(String(d.getFullYear()));
      setDateNaissance(dnParam);
      const age = Math.floor((new Date() - d) / 31536000000);
      setAgeCalcule(age >= 0 ? age : null);
    }

    // Récupérer le nom de l'enseignant·e depuis les données de la classe (import PDF)
    const eleveRasedId = urlParams.get('eleve_rased_id');
    if (eleveRasedId) {
      base44.entities.EleveRased.get(eleveRasedId).then(eleve => {
        if (eleve?.classe_id) {
          return base44.entities.ClasseEcole.get(eleve.classe_id);
        }
        return null;
      }).then(classeRec => {
        if (classeRec?.enseignant) {
          setEnseignant(classeRec.enseignant);
        }
      }).catch(() => {});
    }
  }, []);

  const handleDateNaissance = (jour, mois, annee) => {
    setJourNaissance(jour);
    setMoisNaissance(mois);
    setAnneeNaissance(annee);
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

  const canSubmit = prenom.trim() && nom.trim() && ecole.trim();

  const validate = () => {
    const errs = {};
    if (!prenom.trim()) errs.prenom = 'Le prénom est obligatoire';
    else if (prenom.trim().length < 2) errs.prenom = 'Au minimum 2 caractères';
    if (!nom.trim()) errs.nom = 'Le nom est obligatoire';
    else if (nom.trim().length < 2) errs.nom = 'Au minimum 2 caractères';
    if (!ecole.trim()) errs.ecole = "L'école est obligatoire";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const ensureEcoleExists = async (ecoleNom) => {
    if (!ecoleNom) return null;
    const existing = await base44.entities.EcoleRased.filter({ nom: ecoleNom }).catch(() => []);
    if (existing.length > 0) return existing[0].id;
    const created = await base44.entities.EcoleRased.create({ nom: ecoleNom });
    return created.id;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      // Utiliser l'utilisateur du contexte, sinon tenter une récupération à la volée
      let user = currentUser;
      if (!user) {
        try { user = await base44.auth.me(); } catch { user = null; }
      }

      const fullName = user?.full_name || '';
      let profession = '';
      try {
        if (user?.email) {
          const membres = await base44.entities.MembreEquipe.filter({ email: user.email });
          profession = membres.length > 0 ? membres[0].profession : '';
        }
      } catch {}

      // S'assurer que l'école existe dans la base
      if (ecole) {
        try {
          await ensureEcoleExists(ecole.trim());
        } catch (e) {
          console.warn('ensureEcoleExists failed:', e);
        }
      }

      const created = await base44.entities.FicheEleve.create({
        nom: nom.trim(),
        prenom: prenom.trim(),
        age: ageCalcule !== null ? ageCalcule : undefined,
        date_naissance: dateNaissance || undefined,
        classe: classe || undefined,
        ecole: ecole || undefined,
        observations: motif.trim() || undefined,
        notes: enseignant ? `Enseignant·e : ${enseignant}` : undefined,
        date: new Date().toISOString().split('T')[0],
        annee_scolaire: anneeActive || undefined,
        createdByName: fullName,
        createdByProfession: profession,
      });
      setSavedId(created.id);

      // Mettre à jour l'élève RASED importé : lier la fiche + passer en "Suivi actif"
      const eleveRasedId = urlParams.get('eleve_rased_id');
      if (eleveRasedId) {
        await base44.entities.EleveRased.update(eleveRasedId, {
          fiche_eleve_id: created.id,
          statut: 'Suivi actif',
          date_derniere_action: new Date().toISOString().split('T')[0],
        }).catch(() => {});
      }

      setSaved(true);
      // Rediriger vers la fiche détaillée après un court délai pour afficher le message de succès
      setTimeout(() => {
        navigate(`/detail-fiche?id=${created.id}&success=true`);
      }, 1500);
    } catch (error) {
      console.error('Erreur création fiche:', error);
      const msg = error?.response?.data?.detail || error?.message || error?.data?.detail || '';
      if (msg.includes('auth') || msg.includes('token') || msg.includes('401') || error?.status === 401) {
        setErrorMsg("Votre session a expiré. Vous allez être redirigé vers la page de connexion.");
        setTimeout(() => base44.auth.redirectToLogin(window.location.href), 2000);
      } else {
        setErrorMsg(msg || "Une erreur est survenue lors de la création de la fiche.");
      }
    } finally {
      setSubmitting(false);
    }
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

  const inputCls = (field) => `rounded-lg ${errors[field] ? 'border-destructive ring-1 ring-destructive' : ''}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAF8] to-[#F5F0E8]">
      <HamburgerMenu />
      <ScreenLayout title="📋 Nouvelle observation" subtitle="Complétez les informations de l'élève">
        <form onSubmit={onSubmit} className="max-w-2xl mx-auto">
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
                  value={prenom}
                  onChange={e => setPrenom(e.target.value)}
                  placeholder="Prénom"
                  className={inputCls('prenom')}
                />
                {errors.prenom && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-destructive">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.prenom}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0F172A] block mb-2">Nom *</label>
                <Input
                  value={nom}
                  onChange={e => setNom(e.target.value)}
                  placeholder="Nom"
                  className={inputCls('nom')}
                />
                {errors.nom && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-destructive">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.nom}
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
                      onChange={e => handleDateNaissance(e.target.value, moisNaissance, anneeNaissance)}
                      className="h-10 rounded-lg border border-input bg-background px-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">Jour</option>
                      {Array.from({ length: daysInMonth(moisNaissance, anneeNaissance) }, (_, i) => i + 1).map(d => (
                        <option key={d} value={String(d)}>{d}</option>
                      ))}
                    </select>
                    <select
                      value={moisNaissance}
                      onChange={e => handleDateNaissance(jourNaissance, e.target.value, anneeNaissance)}
                      className="h-10 rounded-lg border border-input bg-background px-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">Mois</option>
                      {months.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                    </select>
                    <select
                      value={anneeNaissance}
                      onChange={e => handleDateNaissance(jourNaissance, moisNaissance, e.target.value)}
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
                {dateNaissance && urlParams.get('date_naissance') && <p className="text-xs text-gray-500 mt-1">✓ Préremplie</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0F172A] block mb-2">Classe</label>
                <Input
                  value={classe}
                  onChange={e => setClasse(e.target.value)}
                  placeholder="Ex: CM2"
                  className="rounded-lg"
                />
                {classe && urlParams.get('classe') && <p className="text-xs text-gray-500 mt-1">✓ Préremplie</p>}
              </div>

              <div>
                <label className="text-sm font-semibold text-[#0F172A] block mb-2">Enseignant·e</label>
                <Input
                  type="text"
                  value={enseignant}
                  onChange={e => setEnseignant(e.target.value)}
                  placeholder="Nom de l'enseignant·e"
                  className="rounded-lg"
                />
                {enseignant && urlParams.get('enseignant') && <p className="text-xs text-gray-500 mt-1">✓ Préremplie</p>}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-[#0F172A] block mb-2">
                  École <span className="text-xs text-gray-400">🔒 verrouillé</span>
                </label>
                {ecole ? (
                  <div className="h-10 flex items-center px-3 rounded-lg border border-input bg-gray-50 text-sm text-gray-700 font-medium">
                    {ecole}
                  </div>
                ) : (
                  <select
                    value={ecole}
                    onChange={e => setEcole(e.target.value)}
                    className={`w-full h-10 rounded-lg border ${errors.ecole ? 'border-destructive ring-1 ring-destructive' : 'border-input'} bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring`}
                  >
                    <option value="">-- Sélectionner une école --</option>
                    {['Célimène', 'Malraux', 'Lacaussade élémentaire', 'Lacaussade maternelle', 'Lorraine', 'Vergès', 'Julenon', 'Joron', 'Jamin', 'Langevin'].map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                )}
                {errors.ecole && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-destructive">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.ecole}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0F172A] block mb-2">
                  Classe <span className="text-xs text-gray-400">🔒 verrouillé</span>
                </label>
                <div className="h-10 flex items-center px-3 rounded-lg border border-input bg-gray-50 text-sm text-gray-700 font-medium">
                  {classe || '—'}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0F172A] block mb-2">
                  Année scolaire <span className="text-xs text-gray-400">🔒 verrouillé</span>
                </label>
                <div className="h-10 flex items-center px-3 rounded-lg border border-input bg-gray-50 text-sm text-gray-700 font-medium">
                  {anneeActive || '—'}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section Motif du signalement */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6 p-6 rounded-2xl bg-white border border-[#D4A574]/20 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-[#D4A574]/10 flex items-center justify-center">
                <span className="text-lg">📌</span>
              </div>
              <h2 className="font-bold text-lg text-[#0F172A]">Motif du signalement</h2>
            </div>
            <textarea
              value={motif}
              onChange={e => setMotif(e.target.value)}
              placeholder="Décrivez le motif de signalement (difficultés observées, demandes de l'enseignant·e, contexte familial...)"
              className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-y"
            />
          </motion.div>

          {/* Message d'erreur */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-2xl bg-destructive/5 border border-destructive/30"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-destructive">Erreur lors de la création</p>
                  <p className="text-xs text-destructive/80 mt-0.5">{errorMsg}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          {!saved ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                type="submit"
                disabled={submitting || !canSubmit}
                className="w-full gap-2 h-11 bg-[#D4A574] hover:bg-[#C49464] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-soft"
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Création en cours…</>
                ) : (
                  <><Plus className="w-5 h-5" /> Créer la fiche</>
                )}
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
                  <span className="text-lg">✅</span>
                  Fiche de {prenom} {nom} créée avec succès !
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