import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, Check, X } from 'lucide-react';

// ── Assistant de rentrée ────────────────────────────────────────────────────
function AssistantRentree({ annee, ecolesPrecedentes, onClose }) {
  const [step, setStep] = useState(1);
  const [reconduireEcoles, setReconduireEcoles] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleReconduire = async (oui) => {
    setReconduireEcoles(oui);
    if (oui && ecolesPrecedentes.length > 0) {
      setSaving(true);
      // Les écoles sont déjà dans la base, pas besoin de les dupliquer
      setSaving(false);
    }
    setStep(2);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 20, maxWidth: 440, width: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
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
              <p style={{ fontSize: 14, color: '#182840', lineHeight: 1.7, marginBottom: 20 }}>
                L'année <strong>{annee?.libelle}</strong> est maintenant active.<br />
                Voulez-vous reconduire les <strong>{ecolesPrecedentes.length} école{ecolesPrecedentes.length !== 1 ? 's' : ''}</strong> de l'année précédente ?
              </p>
              <p style={{ fontSize: 12.5, color: '#566880', lineHeight: 1.6, marginBottom: 22, padding: '10px 14px', background: '#FEF0E4', borderRadius: 10 }}>
                ⚠️ Les élèves ne sont <strong>pas reconduits automatiquement</strong>. Ils devront être importés via PDF pour cette nouvelle année.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => handleReconduire(false)} disabled={saving}
                  style={{ flex: 1, padding: '12px', border: '1px solid #D8E1EE', borderRadius: 10, background: '#fff', color: '#566880', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                  Non, pas maintenant
                </button>
                <button onClick={() => handleReconduire(true)} disabled={saving}
                  style={{ flex: 1, padding: '12px', background: '#1A3353', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  {saving ? 'En cours…' : 'Oui, reconduire'}
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>{reconduireEcoles ? '🏫' : '✅'}</div>
                <p style={{ fontSize: 14, color: '#182840', lineHeight: 1.7 }}>
                  {reconduireEcoles
                    ? `Les écoles ont bien été conservées pour ${annee?.libelle}.`
                    : 'Parfait. Vous pouvez gérer vos écoles depuis le menu dédié.'}
                </p>
              </div>
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
  const valid = libelle.trim().length > 0;

  const handleSubmit = () => {
    if (!valid) return;
    onSave({ libelle: libelle.trim(), statut, est_active: false, active: false });
  };

  return (
    <div style={{ marginBottom: 20, padding: '18px', background: '#F8FAFD', borderRadius: 14, border: '1px solid #D8E1EE' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#182840', marginBottom: 14 }}>Nouvelle année scolaire</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: '#566880', display: 'block', marginBottom: 5 }}>Libellé *</label>
          <input autoFocus value={libelle} onChange={e => setLibelle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Ex : 2026-2027"
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #D8E1EE', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: '#566880', display: 'block', marginBottom: 5 }}>Statut</label>
          <select value={statut} onChange={e => setStatut(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #D8E1EE', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
            <option value="a_venir">À venir</option>
            <option value="en_cours">En cours</option>
            <option value="archivee">Archivée</option>
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
        .map(a => base44.entities.AnneeScolaire.update(a.id, { est_active: false, active: false, statut: 'archivee' }))
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
    archivee: { label: 'Archivée',  badgeBg: '#E2E8F0', badgeColor: '#64748B' },
    // compat anciens statuts
    active:   { label: 'En cours',  badgeBg: '#4ADE80', badgeColor: '#fff' },
    future:   { label: 'À venir',   badgeBg: '#EEE9FF', badgeColor: '#5B3FA6' },
  };

  const getStatut = (a) => {
    if (a.est_active || a.active) return 'en_cours';
    return a.statut || 'a_venir';
  };

  const isActive = (a) => a.est_active || a.active;

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
                    {userMembre.profession === 'Psy EN EDA' 
                      ? 'Psychologue de l\'Éducation Nationale · Spécialité EDA'
                      : userMembre.profession === 'MaDR'
                      ? 'Maître à Dominante Relationnelle (MaDR)'
                      : userMembre.profession === 'MaDP'
                      ? 'Maître à Dominante Pédagogique (MaDP)'
                      : userMembre.profession}
                  </div>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: 
                    userMembre.profession === 'Psy EN EDA' ? '#3B82C4' :
                    userMembre.profession === 'MaDR' ? '#1E7A52' :
                    userMembre.profession === 'MaDP' ? '#B85C1A' : '#D8E1EE'
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
          Gérez vos années scolaires. Une seule peut être active à la fois. Quand vous activez une nouvelle année, l'ancienne est automatiquement archivée.
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
                const statut = getStatut(a);
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
                      background: active ? '#1A3353' : isSelected ? '#EAF2FB' : statut === 'archivee' ? '#F8F9FB' : '#fff',
                      border: active ? 'none' : isSelected ? '2px solid #3B82C4' : statut === 'a_venir' ? '2px dashed #D8E1EE' : '1px solid #E8EDF5',
                      transition: 'all .15s',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 17, fontWeight: 700, color: active ? '#fff' : statut === 'archivee' ? '#94A3B8' : '#182840', lineHeight: 1.2 }}>
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
                        {!active && statut !== 'archivee' && (
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
                    <td style={{ padding: '13px 14px', fontSize: 13.5, fontWeight: active ? 700 : 500, color: active ? '#1A3353' : getStatut(a) === 'archivee' ? '#94A3B8' : '#182840' }}>
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

      </div>

      {/* Assistant de rentrée */}
      {assistantAnnee && (
        <AssistantRentree
          annee={assistantAnnee}
          ecolesPrecedentes={ecoles}
          onClose={() => { setAssistantAnnee(null); load(); }}
        />
      )}
    </div>
  );
}