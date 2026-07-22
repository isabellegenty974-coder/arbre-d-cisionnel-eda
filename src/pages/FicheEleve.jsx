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
  const [wasUpdated, setWasUpdated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [prenom, setPrenom] = useState(urlParams.get('prenom') || '');
  const [nom, setNom] = useState(urlParams.get('nom') || '');
  const [ecole, setEcole] = useState(urlParams.get('ecole') || '');
  const [classe, setClasse] = useState(urlParams.get('classe') || '');
  const [dateNaissance, setDateNaissance] = useState(urlParams.get('date_naissance') || '');
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

  }, []);

  // Debug: afficher les paramètres URL au montage
  useEffect(() => {
    console.log('[FicheEleve] URL params:', {
      eleve_rased_id: urlParams.get('eleve_rased_id'),
      classe: urlParams.get('classe'),
      ecole: urlParams.get('ecole'),
    });
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
    setWasUpdated(false);

    if (!validate()) return;

    setSubmitting(true);
    try {
      // Utiliser l'utilisateur du contexte, sinon tenter une récupération à la volée
      let user = currentUser;
      if (!user) {
        try { user = await base44.auth.me(); } catch { user = null; }
      }

      let fullName = user?.full_name || '';
      let profession = user?.profession || '';

      // Récupérer le vrai prénom/nom/profession depuis le profil RASED (MembreEquipe)
      try {
        const membres = await base44.entities.MembreEquipe.list('-created_date', 200).catch(() => []);
        const meMembre = membres.find(m => m.email && user?.email && m.email.toLowerCase() === user.email.toLowerCase());
        if (meMembre) {
          fullName = `${meMembre.prenom} ${meMembre.nom}`.trim();
          profession = meMembre.profession || profession;
        }
      } catch (e) { /* fallback sur le profil utilisateur */ }

      // S'assurer que l'école existe dans la base
      if (ecole) {
        try {
          await ensureEcoleExists(ecole.trim());
        } catch (e) {
          console.warn('ensureEcoleExists failed:', e);
        }
      }

      // ── Anti-doublon : rechercher un élève existant par nom + prénom ──
      // IMPORTANT : la recherche est restreinte à l'année scolaire active.
      // Une fiche appartient de façon permanente et immuable à l'année pour laquelle
      // elle a été créée : on ne modifie JAMAIS les fiches des années passées.
      const norm = s => (s || '').toLowerCase().trim();
      const existing = await base44.entities.FicheEleve.list('-created_date', 1000).catch(() => []);
      const matches = existing.filter(f =>
        f.annee_scolaire === anneeActive &&
        norm(f.nom) === norm(nom.trim()) && norm(f.prenom) === norm(prenom.trim())
      );

      let targetId = null;
      let updatedExisting = false;

      if (matches.length > 0) {
        // Même nom, prénom ET date de naissance → même élève : mettre à jour sans créer
        const sameBirth = dateNaissance
          ? matches.find(f => f.date_naissance && f.date_naissance === dateNaissance)
          : null;

        if (sameBirth) {
          targetId = sameBirth.id;
          updatedExisting = true;
        } else {
          // Nom + prénom correspondent mais date de naissance différente/absente → homonyme possible
          const detail = matches[0].date_naissance
            ? ` né(e) le ${new Date(matches[0].date_naissance).toLocaleDateString('fr-FR')}`
            : '';
          const confirmer = window.confirm(
            `Un élève « ${prenom.trim()} ${nom.trim()} » existe déjà en ${anneeActive}${detail}.\n\nS'agit-il du même élève ?\n• OK : mettre à jour la fiche de ${anneeActive} (classe, école).\n• Annuler : créer une nouvelle fiche (homonyme).`
          );
          if (confirmer) {
            targetId = matches[0].id;
            updatedExisting = true;
          }
        }
      }

      const eleveRasedId = urlParams.get('eleve_rased_id');

      if (updatedExisting && targetId) {
        // Mettre à jour la fiche de l'année active en conservant tout l'historique.
        // annee_scolaire n'est JAMAIS modifié : rattachement permanent à l'année de création.
        await base44.entities.FicheEleve.update(targetId, {
          classe: classe || undefined,
          ecole: ecole || undefined,
          age: ageCalcule !== null ? ageCalcule : undefined,
        });
        setSavedId(targetId);
        if (eleveRasedId) {
          await base44.entities.EleveRased.update(eleveRasedId, {
            fiche_eleve_id: targetId,
            statut: 'Suivi actif',
            date_derniere_action: new Date().toISOString().split('T')[0],
          }).catch(() => {});
        }
        setSaved(true);
        setTimeout(() => navigate(`/detail-fiche?id=${targetId}&success=true`), 1500);
      } else {
        // Aucun doublon ou homonyme confirmé différent : créer une nouvelle fiche
        const created = await base44.entities.FicheEleve.create({
          nom: nom.trim(),
          prenom: prenom.trim(),
          age: ageCalcule !== null ? ageCalcule : undefined,
          date_naissance: dateNaissance || undefined,
          classe: classe || undefined,
          ecole: ecole || undefined,
          date: new Date().toISOString().split('T')[0],
          annee_scolaire: anneeActive || undefined,
          createdByName: fullName,
          createdByProfession: profession,
        });
        setSavedId(created.id);
        if (eleveRasedId) {
          await base44.entities.EleveRased.update(eleveRasedId, {
            fiche_eleve_id: created.id,
            statut: 'Suivi actif',
            date_derniere_action: new Date().toISOString().split('T')[0],
          }).catch(() => {});
        }
        setSaved(true);
        setTimeout(() => navigate(`/detail-fiche?id=${created.id}&success=true`), 1500);
      }
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
                <div className="grid grid-cols-3 gap-2">
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
                {dateNaissance && urlParams.get('date_naissance') && <p className="text-xs text-gray-500 mt-1">✓ Préremplie</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0F172A] block mb-2">Âge</label>
                <div className="h-10 flex items-center px-3 rounded-lg border border-input bg-gray-50 text-sm font-semibold text-[#0F172A]">
                  {ageCalcule !== null ? `${ageCalcule} ans` : '—'}
                </div>
                <p className="text-xs text-gray-400 mt-1">Calculé automatiquement à partir de la date de naissance</p>
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
                <label className="text-sm font-semibold text-[#0F172A] block mb-2">École</label>
                <select
                  value={ecole}
                  onChange={e => setEcole(e.target.value)}
                  className={`w-full h-10 rounded-lg border ${errors.ecole ? 'border-destructive ring-1 ring-destructive' : 'border-input'} bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring`}
                >
                  <option value="">-- Sélectionner une école --</option>
                  {[...new Set(['Célimène', 'Malraux', 'Lacaussade élémentaire', 'Lacaussade maternelle', 'Lorraine', 'Vergès', 'Julenon', 'Joron', 'Jamin', 'Langevin', ecole].filter(Boolean))].map(e => <option key={e} value={e}>{e}</option>)}
                </select>
                {errors.ecole && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-destructive">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.ecole}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0F172A] block mb-2">Classe</label>
                <Input
                  value={classe}
                  onChange={e => setClasse(e.target.value)}
                  placeholder="Ex: CM2"
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0F172A] block mb-2">
                  Année scolaire <span className="text-xs text-gray-400">🔒 immuable</span>
                </label>
                <select
                  value={anneeActive || ''}
                  disabled
                  className="w-full h-10 rounded-lg border border-input bg-gray-50 px-3 text-sm text-gray-700 font-medium cursor-not-allowed"
                >
                  {anneeActive && <option value={anneeActive}>{anneeActive}</option>}
                </select>
              </div>
            </div>
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
                  Fiche de {prenom} {nom} enregistrée avec succès !
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