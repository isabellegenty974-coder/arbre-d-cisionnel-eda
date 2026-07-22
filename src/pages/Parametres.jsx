import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, Check, X, LogOut } from 'lucide-react';

// ── Assistant de rentrée ────────────────────────────────────────────────────
function AssistantRentree({ annee, ecolesPrecedentes, fiches = [], elevesR = [], diags = [], annees = [], currentUserName, currentUserProfession, onClose }) {
  const [step, setStep] = useState(1);
  const [reconduire, setReconduire] = useState(null);
  const [saving, setSaving] = useState(false);
  const [reconduitCount, setReconduitCount] = useState(0);

  // Année précédente (libellé)
  const newLibelle = annee?.libelle;
  const prevStartYear = newLibelle ? parseInt(newLibelle.split('-')[0]) - 1 : null;
  const prevLibelle = prevStartYear ? `${prevStartYear}-${prevStartYear + 1}` : null;
  const prevAnnee = annees.find(a => a.libelle === prevLibelle);

  // Élèves à reconduire : fiches de l'année précédente non clôturées
  const fichesAReconduire = fiches.filter(f => {
    if (f.statut === 'Clôturé') return false;
    if (!prevAnnee) return false;
    if (f.annee_scolaire) return f.annee_scolaire === prevLibelle;
    const d = new Date(f.created_date);
    const debut = new Date(prevAnnee.date_debut || `${prevStartYear}-08-15`);
    const fin = new Date(prevAnnee.date_fin || `${prevStartYear + 1}-07-15`);
    return d >= debut && d <= fin;
  });

  const handleReconduire = async (oui) => {
    setReconduire(oui);
    if (oui) {
      setSaving(true);
      try {
        const today = new Date().toISOString().slice(0, 10);

        // 1. Copie complète des fiches élèves (statut remis à "Nouveau")
        const newFichesData = fichesAReconduire.map(f => ({
          nom: f.nom, prenom: f.prenom, classe: f.classe, ecole: f.ecole, age: f.age,
          date_naissance: f.date_naissance,
          observations: f.observations, notes: f.notes,
          interventions: f.interventions || [],
          intervenants: f.intervenants || [],
          score_apprentissages: f.score_apprentissages,
          score_comportement: f.score_comportement,
          score_developpement: f.score_developpement,
          score_contexte: f.score_contexte,
          hypotheses: f.hypotheses || [],
          recommandations: f.recommandations || [],
          date: today,
          annee_scolaire: newLibelle,
          createdByName: currentUserName,
          createdByProfession: currentUserProfession,
          photo_ee_url: f.photo_ee_url,
          rapport: f.rapport,
          statut: 'Nouveau',
          documents: f.documents || [],
          problematiques: f.problematiques || {},
          responsable1: f.responsable1,
          responsable2: f.responsable2,
          langue_maison: f.langue_maison,
          autorisation_parentale: f.autorisation_parentale,
          date_autorisation: f.date_autorisation,
        }));
        const createdFiches = newFichesData.length
          ? await base44.entities.FicheEleve.bulkCreate(newFichesData)
          : [];

        // 2. Copie des EleveRased liés (motif conservé, statut "Nouveau")
        const newElevesData = createdFiches.map((nf, i) => {
          const oldFiche = fichesAReconduire[i];
          const oldEleve = elevesR.find(e => e.fiche_eleve_id === oldFiche.id);
          return {
            nom: nf.nom, prenom: nf.prenom, date_naissance: nf.date_naissance,
            classe_id: oldEleve?.classe_id,
            ecole_id: oldEleve?.ecole_id,
            statut: 'Nouveau',
            fiche_eleve_id: nf.id,
            motif_signalement: oldEleve?.motif_signalement,
          };
        }).filter(e => e.fiche_eleve_id);
        if (newElevesData.length) await base44.entities.EleveRased.bulkCreate(newElevesData);

        // 3. Copie de l'historique EDA (conservé et accessible dans la nouvelle année)
        const newHistorique = [];
        createdFiches.forEach((nf, i) => {
          const oldFiche = fichesAReconduire[i];
          diags.filter(d => d.eleve_id === oldFiche.id).forEach(rec => {
            newHistorique.push({
              eleve_id: nf.id, date: rec.date, domaine: rec.domaine, sous_domaine: rec.sous_domaine,
              hypotheses: rec.hypotheses, recommandations: rec.recommandations, scores: rec.scores, diagnostic_id: rec.diagnostic_id,
            });
          });
        });
        if (newHistorique.length) await base44.entities.HistoriqueEDA.bulkCreate(newHistorique);

        setReconduitCount(createdFiches.length);
      } catch (e) {
        console.error('Reconduction erreur:', e);
      } finally {
        setSaving(false);
      }
    }
    setStep(2);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 20, maxWidth: 460, width: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
        {/* Header */}
        <div style={{ background: '#1A3353', padding: '22px 24px 18px' }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.5)', marginBottom: 6 }}>
            Nouvelle rentrée · {annee?.libelle}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>🎒 Assistant de démarrage</div>
        </div>

        <div style={{ padding: '24px' }}>
          {step === 1 && (
            <>
              <p style={{ fontSize: 14, color: '#182840', lineHeight: 1.7, marginBottom: 16 }}>
                L'année <strong>{annee?.libelle}</strong> est maintenant active.
              </p>
              {fichesAReconduire.length > 0 ? (
                <>
                  <p style={{ fontSize: 14, color: '#182840', lineHeight: 1.7, marginBottom: 16 }}>
                    Voulez-vous reconduire les <strong>{fichesAReconduire.length} élève{fichesAReconduire.length !== 1 ? 's' : ''}</strong> suivi{fichesAReconduire.length !== 1 ? 's' : ''} de l'année précédente ({prevLibelle}) ?
                  </p>
                  <div style={{ fontSize: 12, color: '#566880', lineHeight: 1.6, marginBottom: 20, padding: '10px 14px', background: '#EAF2FB', borderRadius: 10, borderLeft: '3px solid #3B82C4' }}>
                    📋 Chaque fiche est recopiée intégralement : motif, problématiques, intervenants, séances, documents et historique.
                    Seul le statut est remis à <strong>« Nouveau »</strong> pour la nouvelle année.
                    Les {ecolesPrecedentes.length} école{ecolesPrecedentes.length !== 1 ? 's' : ''} sont conservées automatiquement.
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => handleReconduire(false)} disabled={saving}
                      style={{ flex: 1, padding: '12px', border: '1px solid #D8E1EE', borderRadius: 10, background: '#fff', color: '#566880', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                      Non, pas maintenant
                    </button>
                    <button onClick={() => handleReconduire(true)} disabled={saving}
                      style={{ flex: 1, padding: '12px', background: '#1A3353', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                      {saving ? 'Reconduction…' : `Oui, reconduire (${fichesAReconduire.length})`}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 14, color: '#566880', lineHeight: 1.7, marginBottom: 20, padding: '12px 14px', background: '#F8FAFD', borderRadius: 10 }}>
                    Aucun élève suivi à reconduire depuis {prevLibelle || 'l\'année précédente'}. Les écoles sont conservées automatiquement.
                  </p>
                  <button onClick={() => handleReconduire(false)}
                    style={{ width: '100%', padding: '12px', background: '#1A3353', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Continuer
                  </button>
                </>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 18 }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>{reconduire && reconduitCount > 0 ? '🎓' : '✅'}</div>
                <p style={{ fontSize: 14, color: '#182840', lineHeight: 1.7 }}>
                  {reconduire && reconduitCount > 0
                    ? <>Les fiches complètes de <strong>{reconduitCount} élève{reconduitCount !== 1 ? 's' : ''}</strong> ont été recopiées pour {annee?.libelle}. Le statut de chaque suivi a été remis à « Nouveau ».</>
                    : 'Parfait. Les écoles sont conservées pour cette nouvelle année.'}
                </p>
              </div>
              {reconduire && reconduitCount > 0 && (
                <p style={{ fontSize: 12.5, color: '#566880', lineHeight: 1.6, marginBottom: 16, padding: '10px 14px', background: '#FEF0E4', borderRadius: 10 }}>
                  ℹ️ Pensez à mettre à jour l'école ou la classe des élèves ayant changé d'affectation.
                </p>
              )}
              <p style={{ fontSize: 13.5, color: '#182840', fontWeight: 600, marginBottom: 14 }}>
                Voulez-vous importer les nouvelles listes de classes en PDF ?
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={onClose}
                  style={{ flex: 1, padding: '12px', border: '1px solid #D8E1EE', borderRadius: 10, background: '#fff', color: '#566880', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                  Plus tard
                </button>
                <Link to="/import-pdf" onClick={onClose}
                  style={{ flex: 1, padding: '12px', background: '#3B82C4', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  📄 Importer des listes
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Formulaire ajout année ──────────────────────────────────────────────────
// Dates par défaut pour La Réunion : 15 août (rentrée) → 15 juillet (été) l'année suivante
function libelleToDates(lib) {
  const startYear = parseInt((lib || '').split('-')[0]);
  if (isNaN(startYear)) return { date_debut: '', date_fin: '' };
  return {
    date_debut: `${startYear}-08-15`,
    date_fin: `${startYear + 1}-07-15`,
  };
}

function FormAjoutAnnee({ onSave, onCancel, saving, anneesExistantes = [] }) {
  // Propose l'année suivante la plus haute existante, ou l'an prochain par défaut
  const suggestLibelle = () => {
    const now = new Date();
    const baseYear = now.getMonth() >= 8 ? now.getFullYear() + 1 : now.getFullYear();
    const years = anneesExistantes
      .map(a => parseInt(a.libelle?.split('-')[0]))
      .filter(y => !isNaN(y));
    const maxYear = years.length > 0 ? Math.max(...years) : baseYear - 1;
    const nextYear = maxYear + 1;
    return `${nextYear}-${nextYear + 1}`;
  };

  const [libelle, setLibelle] = useState(suggestLibelle);
  const [statut, setStatut]   = useState('a_venir');
  const [dates, setDates]     = useState(() => libelleToDates(suggestLibelle()));
  const valid = libelle.trim().length > 0;

  const handleLibelleChange = (val) => {
    setLibelle(val);
    setDates(libelleToDates(val));
  };

  const handleSubmit = () => {
    if (!valid) return;
    onSave({
      libelle: libelle.trim(),
      statut,
      est_active: false,
      active: false,
      date_debut: dates.date_debut,
      date_fin: dates.date_fin,
    });
  };

  return (
    <div style={{ marginBottom: 20, padding: '18px', background: '#F8FAFD', borderRadius: 14, border: '1px solid #D8E1EE' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#182840', marginBottom: 14 }}>Nouvelle année scolaire</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: '#566880', display: 'block', marginBottom: 5 }}>Libellé *</label>
          <input autoFocus value={libelle} onChange={e => handleLibelleChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Ex : 2026-2027"
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #D8E1EE', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: '#566880', display: 'block', marginBottom: 5 }}>Début (rentrée)</label>
            <input type="date" value={dates.date_debut}
              onChange={e => setDates(d => ({ ...d, date_debut: e.target.value }))}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #D8E1EE', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: '#566880', display: 'block', marginBottom: 5 }}>Fin (vacances d'été)</label>
            <input type="date" value={dates.date_fin}
              onChange={e => setDates(d => ({ ...d, date_fin: e.target.value }))}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #D8E1EE', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: '#566880', display: 'block', marginBottom: 5 }}>Statut</label>
          <select value={statut} onChange={e => setStatut(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #D8E1EE', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
            <option value="a_venir">À venir</option>
            <option value="en_cours">En cours</option>
            <option value="passee">Passée</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel}
            style={{ padding: '9px 16px', background: 'transparent', color: '#566880', border: '1px solid #D8E1EE', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={saving || !valid}
            style={{ padding: '9px 18px', background: '#1A3353', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, opacity: !valid || saving ? .5 : 1 }}>
            {saving ? 'Création…' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ─────────────────────────────────────────────────────────
export default function Parametres() {
  const navigate    = useNavigate();
  const { logout }  = useAuth();
  const [annees, setAnnees]     = useState([]);
  const [fiches, setFiches]     = useState([]);
  const [diags, setDiags]       = useState([]);
  const [elevesR, setElevesR]   = useState([]);
  const [ecoles, setEcoles]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [selected, setSelected] = useState(null);
  const [assistantAnnee, setAssistantAnnee] = useState(null); // annee activée → ouvre assistant
  const [user, setUser] = useState(null);
  const [userMembre, setUserMembre] = useState(null);

  const load = async () => {
    const [u, ans, f, d, el, ec] = await Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.AnneeScolaire.list('libelle', 50).catch(() => []),
      base44.entities.FicheEleve.list('-created_date', 500).catch(() => []),
      base44.entities.HistoriqueEDA.list('-date', 1000).catch(() => []),
      base44.entities.EleveRased.list('-created_date', 500).catch(() => []),
      base44.entities.EcoleRased.list('-created_date', 100).catch(() => []),
    ]);
    setUser(u);
    setAnnees(ans);
    setFiches(f);
    setDiags(d);
    setElevesR(el);
    setEcoles(ec);
    const active = ans.find(a => a.est_active || a.active);
    if (active && !selected) setSelected(active.id);
    
    // Récupérer le profil MembreEquipe du user
    if (u && u.email) {
      const membres = await base44.entities.MembreEquipe.filter({ email: u.email }).catch(() => []);
      if (membres.length > 0) setUserMembre(membres[0]);
    }
    
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (data) => {
    setSaving(true);
    await base44.entities.AnneeScolaire.create(data);
    setShowAdd(false);
    setSaving(false);
    load();
  };

  const handleSetActive = async (annee) => {
    setSaving(true);
    // Archiver toutes les autres
    await Promise.all(
      annees
        .filter(a => a.id !== annee.id && (a.est_active || a.active))
        .map(a => base44.entities.AnneeScolaire.update(a.id, { est_active: false, active: false, statut: 'passee' }))
    );
    await base44.entities.AnneeScolaire.update(annee.id, { est_active: true, active: true, statut: 'en_cours' });
    setSaving(false);
    setAssistantAnnee(annee); // ouvrir l'assistant
    load();
  };

  // Stats par année (basé sur les dates de l'année ou les champs annee_scolaire_id)
  const statsParAnnee = (annee) => {
    const debut = annee.date_debut ? new Date(annee.date_debut) : new Date(`${annee.libelle.split('-')[0]}-08-01`);
    const fin   = annee.date_fin   ? new Date(annee.date_fin)   : new Date(`${(annee.libelle.split('-')[1] || String(parseInt(annee.libelle.split('-')[0]) + 1))}-07-31`);
    const fichesAnnee = fiches.filter(f => {
      if (f.annee_scolaire_id) return f.annee_scolaire_id === annee.id;
      const d = new Date(f.created_date);
      return d >= debut && d <= fin;
    });
    const diagsAnnee = diags.filter(d2 => {
      const d = new Date(d2.date || d2.created_date);
      return d >= debut && d <= fin;
    });
    const clotures = elevesR.filter(e =>
      e.statut === 'Clôturé' && e.date_derniere_action &&
      new Date(e.date_derniere_action) >= debut && new Date(e.date_derniere_action) <= fin
    );
    return { eleves: fichesAnnee.length, hypotheses: diagsAnnee.length, clotures: clotures.length };
  };

  const anneeConsultee = annees.find(a => a.id === selected);

  const statutConfig = {
    en_cours: { label: 'En cours',  badgeBg: '#4ADE80', badgeColor: '#fff' },
    a_venir:  { label: 'À venir',   badgeBg: '#EEE9FF', badgeColor: '#5B3FA6' },
    passee:   { label: 'Passée',    badgeBg: '#E2E8F0', badgeColor: '#64748B' },
  };

  const computeStatut = (a) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Statut basé sur les dates réelles de l'année (calendrier La Réunion : 15/08 → 15/07)
    if (a.date_debut && a.date_fin) {
      const debut = new Date(a.date_debut);
      const fin = new Date(a.date_fin);
      if (today >= debut && today <= fin) return 'en_cours';
      if (today > fin) return 'passee';
      return 'a_venir';
    }
    // Fallback : 15/08 → 15/07 déduit du libellé
    const startYear = parseInt(a.libelle.split('-')[0]);
    if (isNaN(startYear)) return 'a_venir';
    const debut = new Date(`${startYear}-08-15`);
    const fin = new Date(`${startYear + 1}-07-15`);
    if (today >= debut && today <= fin) return 'en_cours';
    if (today > fin) return 'passee';
    return 'a_venir';
  };

  const isActive = (a) => computeStatut(a) === 'en_cours';

  return (
    <div style={{ minHeight: '100vh', background: '#F0F3F8', fontFamily: 'Inter, sans-serif', paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ background: '#1A3353', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 14px' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-.01em' }}>Suivis RASED</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>La Possession · La Réunion</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.12)', padding: '7px 14px', borderRadius: 20 }}>
            <Calendar size={14} style={{ color: '#fff' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Paramètres</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 16px' }}>

        {/* Retour */}
        <button onClick={() => navigate('/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#566880', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, marginBottom: 20 }}>
          <ArrowLeft size={14} /> Tableau de bord
        </button>

        {/* Mon profil */}
        {user && userMembre && (
          <div style={{ background: '#fff', borderRadius: 18, padding: '20px', boxShadow: '0 2px 16px rgba(0,0,0,.06)', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#182840', marginBottom: 14 }}>👤 Mon profil</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#566880', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Nom complet</div>
                <div style={{ fontSize: 14, color: '#182840' }}>{userMembre.prenom} {userMembre.nom}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#566880', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Rôle dans l'équipe</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#182840' }}>
                    {user.profession === 'Psy EN EDA'
                      ? 'Psychologue de l\'Éducation Nationale · Spécialité EDA'
                      : user.profession === 'MaDR'
                      ? 'Maître à Dominante Relationnelle (MaDR)'
                      : user.profession === 'MaDP'
                      ? 'Maître à Dominante Pédagogique (MaDP)'
                      : user.profession}
                  </div>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background:
                    user.profession === 'Psy EN EDA' ? '#3B82C4' :
                    user.profession === 'MaDR' ? '#1E7A52' :
                    user.profession === 'MaDP' ? '#B85C1A' : '#D8E1EE'
                  }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#566880', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Email</div>
                <div style={{ fontSize: 14, color: '#182840' }}>{user.email}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 12, paddingTop: 12, borderTop: '1px solid #F0F3F8' }}>
              ℹ️ Ces informations ont été définies lors de votre inscription et ne peuvent pas être modifiées ici.
            </div>
          </div>
        )}

        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#182840', margin: '0 0 6px' }}>Années scolaires</h1>
        <p style={{ fontSize: 13, color: '#566880', margin: '0 0 28px', lineHeight: 1.6 }}>
          Gérez vos années scolaires. Une seule peut être active à la fois. Quand vous activez une nouvelle année, l'ancienne passe automatiquement en statut Passée.
        </p>

        {/* Formulaire ajout */}
        {showAdd && (
          <FormAjoutAnnee onSave={handleAdd} onCancel={() => setShowAdd(false)} saving={saving} anneesExistantes={annees} />
        )}

        {/* Carte liste des années */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '20px', boxShadow: '0 2px 16px rgba(0,0,0,.06)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#182840' }}>Toutes les années</span>
            {!showAdd && (
              <button onClick={() => setShowAdd(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', background: '#3B82C4', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 12.5, fontWeight: 600 }}>
                <Plus size={13} /> Ajouter une année
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#566880' }}>Chargement…</div>
          ) : annees.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
              <p style={{ fontSize: 13 }}>Aucune année scolaire créée</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...annees].sort((a, b) => a.libelle.localeCompare(b.libelle) * -1).map(a => {
                const statut = computeStatut(a);
                const cfg = statutConfig[statut] || statutConfig.a_venir;
                const active = isActive(a);
                const isSelected = selected === a.id;

                return (
                  <div key={a.id}
                    onClick={() => setSelected(a.id)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 14,
                      cursor: 'pointer',
                      background: active ? '#1A3353' : isSelected ? '#EAF2FB' : statut === 'passee' ? '#F8F9FB' : '#fff',
                      border: active ? 'none' : isSelected ? '2px solid #3B82C4' : statut === 'a_venir' ? '2px dashed #D8E1EE' : '1px solid #E8EDF5',
                      transition: 'all .15s',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 17, fontWeight: 700, color: active ? '#fff' : statut === 'passee' ? '#94A3B8' : '#182840', lineHeight: 1.2 }}>
                          {a.libelle.replace('-', '–')}
                        </div>
                        {(a.date_debut || a.date_fin) && (
                          <div style={{ fontSize: 11, color: active ? 'rgba(255,255,255,.5)' : '#94A3B8', marginTop: 3 }}>
                            {a.date_debut && new Date(a.date_debut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                            {a.date_debut && a.date_fin && ' → '}
                            {a.date_fin && new Date(a.date_fin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 10, background: cfg.badgeBg, color: cfg.badgeColor, whiteSpace: 'nowrap' }}>
                          {active ? 'En cours' : cfg.label}
                        </span>
                        {!active && (
                          <button onClick={e => { e.stopPropagation(); handleSetActive(a); }} disabled={saving}
                            style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, background: '#3B82C4', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, opacity: saving ? .6 : 1, whiteSpace: 'nowrap' }}>
                            Définir comme active
                          </button>
                        )}
                        {active && (
                          <Check size={14} style={{ color: '#4ADE80' }} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bandeau info année consultée */}
        {anneeConsultee && (
          <div style={{ background: '#EAF2FB', border: '1px solid #BFD9F2', borderRadius: 14, padding: '14px 18px', marginBottom: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18 }}>ℹ️</span>
            <div style={{ fontSize: 13, color: '#254D7A', lineHeight: 1.6 }}>
              <strong>Année sélectionnée : {anneeConsultee.libelle.replace('-', '–')}</strong><br />
              Les statistiques ci-dessous correspondent à cette période.
              {isActive(anneeConsultee) && ' C\'est l\'année en cours.'}
            </div>
          </div>
        )}

        {/* Tableau récapitulatif */}
        <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F3F8' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#182840' }}>Récapitulatif par année</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F0F3F8' }}>
                {['Année', 'Élèves suivis', 'Hypothèses', 'Clôturés'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Année' ? 'left' : 'center', fontSize: 10.5, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...annees].sort((a, b) => a.libelle.localeCompare(b.libelle) * -1).map((a, i, arr) => {
                const s = statsParAnnee(a);
                const active = isActive(a);
                const isSelected = selected === a.id;
                return (
                  <tr key={a.id} onClick={() => setSelected(a.id)}
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid #F0F3F8' : 'none', cursor: 'pointer', background: isSelected ? '#F0F7FF' : 'transparent', transition: 'background .1s' }}>
                    <td style={{ padding: '13px 14px', fontSize: 13.5, fontWeight: active ? 700 : 500, color: active ? '#1A3353' : computeStatut(a) === 'passee' ? '#94A3B8' : '#182840' }}>
                      {a.libelle.replace('-', '–')}
                    </td>
                    {[s.eleves, s.hypotheses, s.clotures].map((v, j) => (
                      <td key={j} style={{ padding: '13px 14px', textAlign: 'center', fontSize: 15, fontWeight: active ? 700 : 400, color: v > 0 ? '#182840' : '#CBD5E1' }}>
                        {v > 0 ? v : '—'}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {annees.length === 0 && (
                <tr><td colSpan={4} style={{ padding: '28px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>Aucune donnée</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Déconnexion manuelle */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '20px', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,.05)', textAlign: 'center' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#182840', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <LogOut size={16} /> Déconnexion
          </h3>
          <p style={{ fontSize: 13, color: '#566880', margin: '0 0 14px', lineHeight: 1.6 }}>
            Vous restez connecté·e tant que vous ne cliquez pas ici. La déconnexion est uniquement manuelle.
          </p>
          <button
            onClick={logout}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 24px', background: '#B85C1A', color: '#fff',
              borderRadius: 10, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
            }}
          >
            <LogOut size={15} /> Se déconnecter
          </button>
        </div>

        {/* RGPD & PROTECTION DES DONNÉES */}
        <div style={{ marginTop: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#182840', margin: '0 0 20px' }}>🔒 Protection des données (RGPD)</h2>

          {/* Informations légales */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '20px', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#182840', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📋</span> Informations légales
            </h3>
            <div style={{ fontSize: 13, color: '#566880', lineHeight: 1.7, background: '#F8FAFD', padding: '14px', borderRadius: 10, borderLeft: '3px solid #3B82C4' }}>
              <p style={{ margin: '0 0 10px 0' }}>
                Les données enregistrées dans cette application concernent des élèves mineurs et sont soumises au Règlement Général sur la Protection des Données (RGPD) ainsi qu'aux règles de confidentialité de l'Éducation Nationale.
              </p>
              <ul style={{ margin: '0', paddingLeft: '20px' }}>
                <li><strong>Responsable du traitement :</strong> Circonscription de La Possession, La Réunion</li>
                <li><strong>Finalité :</strong> suivi des élèves en difficulté par l'équipe RASED</li>
                <li><strong>Accès aux données :</strong> réservé aux 3 membres de l'équipe RASED connectés</li>
                <li><strong>Durée de conservation :</strong> données archivées par année scolaire, supprimables sur demande</li>
                <li><strong>Données collectées :</strong> nom, prénom, date de naissance, école, classe, notes de suivi — aucune donnée médicale au sens strict</li>
              </ul>
            </div>
          </div>

          {/* Droits des personnes */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '20px', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#182840', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚖️</span> Droits des personnes
            </h3>
            <div style={{ fontSize: 13, color: '#566880', lineHeight: 1.7, background: '#F8FAFD', padding: '14px', borderRadius: 10, borderLeft: '3px solid #1E7A52' }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 600 }}>Conformément au RGPD, les familles des élèves concernés disposent des droits suivants :</p>
              <ul style={{ margin: '0', paddingLeft: '20px' }}>
                <li>Droit d'accès à leurs données</li>
                <li>Droit de rectification</li>
                <li>Droit à l'effacement</li>
                <li>Droit d'opposition</li>
              </ul>
              <p style={{ margin: '10px 0 0 0', fontSize: 12 }}>
                Pour exercer ces droits, contacter le Délégué à la Protection des Données (DPO) de l'académie de La Réunion.
              </p>
            </div>
          </div>

          {/* Bonnes pratiques */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '20px', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#182840', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>✅</span> Bonnes pratiques pour l'équipe
            </h3>
            <div style={{ fontSize: 13, color: '#566880', lineHeight: 1.7, background: '#F8FAFD', padding: '14px', borderRadius: 10, borderLeft: '3px solid #B85C1A' }}>
              <ul style={{ margin: '0', paddingLeft: '20px' }}>
                <li>Ne jamais partager vos identifiants</li>
                <li>Ne pas noter de données médicales détaillées dans les fiches</li>
                <li>Utiliser uniquement sur des appareils sécurisés</li>
                <li>Se déconnecter après chaque session sur un appareil partagé</li>
                <li>En cas de perte ou vol d'appareil, contacter immédiatement l'administratrice pour révoquer l'accès</li>
              </ul>
            </div>
          </div>

          {/* Suppression de données (admin) */}
          {user?.role === 'admin' && (
            <div style={{ background: '#FEF0E4', borderRadius: 16, padding: '20px', marginBottom: 16, border: '1px solid #B85C1A' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#B85C1A', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>⚠️</span> Suppression de données (administratrice)
              </h3>
              <p style={{ fontSize: 13, color: '#B85C1A', marginBottom: 14 }}>Vous pouvez supprimer définitivement les données d'une année scolaire archivée.</p>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: '#B85C1A', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 8 }}>
                  Sélectionner l'année à supprimer
                </label>
                <select 
                  style={{ 
                    width: '100%', 
                    padding: '10px 12px', 
                    border: '1px solid #B85C1A', 
                    borderRadius: 8, 
                    fontSize: 13, 
                    outline: 'none',
                    marginBottom: 12,
                    background: '#fff',
                    color: '#182840'
                  }}
                  onChange={e => {
                    if (e.target.value && window.confirm(`Cette action est irréversible. Toutes les fiches élèves de l'année ${e.target.value} seront supprimées définitivement.\n\nConfirmer la suppression ?`)) {
                      // TODO: Implémenter la suppression des données
                      alert('Suppression en cours... (À implémenter)');
                    }
                    e.target.value = '';
                  }}
                >
                  <option value="">-- Sélectionner une année archivée --</option>
                  {annees
                    .filter(a => computeStatut(a) === 'passee')
                    .map(a => <option key={a.id} value={a.id}>{a.libelle}</option>)
                  }
                </select>
              </div>
            </div>
          )}

          {/* Politique de confidentialité */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '20px', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,.05)', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#566880', margin: '0 0 12px' }}>
              Consulter notre politique complète
            </p>
            <a href="/politique-confidentialite" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 6, 
                padding: '10px 20px', 
                background: '#3B82C4', 
                color: '#fff', 
                borderRadius: 10, 
                fontSize: 13, 
                fontWeight: 600, 
                textDecoration: 'none',
                cursor: 'pointer',
                border: 'none'
              }}>
              📄 Politique de confidentialité complète
            </a>
          </div>
        </div>

      </div>

      {/* Assistant de rentrée */}
      {assistantAnnee && (
        <AssistantRentree
          annee={assistantAnnee}
          ecolesPrecedentes={ecoles}
          fiches={fiches}
          elevesR={elevesR}
          diags={diags}
          annees={annees}
          currentUserName={userMembre ? `${userMembre.prenom} ${userMembre.nom}` : (user?.full_name || '')}
          currentUserProfession={user?.profession || userMembre?.profession || ''}
          onClose={() => { setAssistantAnnee(null); load(); }}
        />
      )}
    </div>
  );
}