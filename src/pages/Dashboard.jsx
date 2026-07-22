import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { usePresence } from '@/lib/usePresence';
import { titleCase } from '@/lib/utils';
import { timeAgo } from '@/lib/time';

// ── Helpers ────────────────────────────────────────────────────────────────

function anneeScolaire() {
  const now = new Date();
  const y = now.getFullYear();
  return now.getMonth() >= 8 ? `${y}–${y + 1}` : `${y - 1}–${y}`;
}

function todayLabel() {
  const s = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Supprime les mentions de salle (" Salle X") d'un nom de classe — affichage uniquement
function cleanClassName(c) {
  if (!c) return '';
  return c.replace(/\s*Salle\s+\S+/gi, '').replace(/\s+/g, ' ').trim();
}

const PROF_COLOR = { 'Psy EN EDA': '#3B82C4', 'MaDR': '#1E7A52', 'MaDP': '#B85C1A' };
const PROF_LABEL = { 'Psy EN EDA': 'Psychologue de l\'Éducation Nationale · Spécialité EDA', 'MaDR': 'Maître à Dominante Relationnelle (MaDR)', 'MaDP': 'Maître à Dominante Pédagogique (MaDP)' };
const PROF_BG    = { 'Psy EN EDA': '#EAF2FB', 'MaDR': '#E4F4ED', 'MaDP': '#FEF0E4' };
const PROF_TEXT  = { 'Psy EN EDA': '#254D7A', 'MaDR': '#1E7A52', 'MaDP': '#B85C1A' };
const PROF_BADGE = { 'Psy EN EDA': 'Psy-EN EDA', 'MaDR': 'MaDR', 'MaDP': 'MaDP' };

// ── Nav items ──────────────────────────────────────────────────────────────

const NAV = [
  { section: 'Principal' },
  { label: 'Tableau de bord', ico: '🏠', to: '/dashboard' },
  { label: 'Mes écoles',      ico: '🏫', to: '/mes-ecoles' },
  { label: 'Élèves suivis',   ico: '👤', to: '/liste-eleves' },
  { section: 'Gestion' },
  { label: 'Importer PDF',    ico: '📄', to: '/import-pdf' },
  { label: 'Équipe RASED',    ico: '👥', to: '/equipe-rased' },
  { label: 'Notifications',   ico: '🔔', to: '/notifications', badge: true },
  { section: 'Rapports' },
  { label: 'Statistiques',    ico: '📊', to: '/stats-annuelles' },
  { label: 'Export annuel',   ico: '📥', to: '/export-annuel' },
  { label: 'Paramètres',      ico: '⚙️', to: '/parametres' },
];

// ── Sidebar ────────────────────────────────────────────────────────────────

function Sidebar({ membres, notifications, membresEnLigne = [], loading = false, totalAlertes = 0 }) {
  const location = window.location.pathname;

  return (
    <aside style={{
      width: 230, flexShrink: 0, background: '#1A3353',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', inset: '0 auto 0 0', zIndex: 30,
    }}>
      {/* Brand */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: '#fff', letterSpacing: '.01em', lineHeight: 1.1 }}>
          Suivis RASED
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, fontSize: 10.5, color: 'rgba(255,255,255,.45)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
          📍 Circonscription de La Possession
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 10px', flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {NAV.map((item, i) => {
          if (item.section) {
             return (
               <div key={i} style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.28)', padding: '14px 8px 4px' }}>
                 {item.section}
               </div>
             );
           }
           const isActive = location === item.to;
           const alertCount = item.label === 'Tableau de bord' ? (loading ? 0 : totalAlertes) : 0;
           const inner = (
             <div style={{
               display: 'flex', alignItems: 'center', gap: 9,
               padding: '8px 10px', borderRadius: 7, fontSize: 13, marginBottom: 1, cursor: 'pointer',
               background: isActive ? '#3B82C4' : 'transparent',
               color: isActive ? '#fff' : 'rgba(255,255,255,.62)',
               fontWeight: isActive ? 600 : 400,
               transition: 'all .14s',
            }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,.07)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isActive ? '#fff' : 'rgba(255,255,255,.62)'; }}
            >
              <span style={{ fontSize: 15, width: 20, textAlign: 'center', flexShrink: 0 }}>{item.ico}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {alertCount > 0 && (
                <span style={{ background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10 }}>
                  🔴 {alertCount}
                </span>
              )}
              {item.badge && notifications > 0 && (
                <span style={{ background: '#B85C1A', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10 }}>
                  {notifications}
                </span>
              )}
            </div>
          );
          if (!item.to) return <div key={i}>{inner}</div>;
          return <Link key={i} to={item.to} style={{ textDecoration: 'none' }}>{inner}</Link>;
        })}
      </nav>

      {/* Membres avec présence réelle */}
      {membres.length > 0 && (
        <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(255,255,255,.3)', marginBottom: 8 }}>
            Équipe RASED
          </div>
          {membres.slice(0, 4).map((m, i) => {
            const bg = PROF_COLOR[m.profession] || '#3B82C4';
            const init = `${m.prenom?.[0] || ''}${m.nom?.[0] || ''}`;
            const isOnline = membresEnLigne.some(p =>
              p.user_name === `${m.prenom} ${m.nom}` ||
              p.user_profession === m.profession
            );
            const shortProf = m.profession === 'Psy EN EDA' ? 'Psy-EN EDA' : m.profession;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0, position: 'relative', opacity: isOnline ? 1 : 0.5 }}>
                  {init}
                  <span style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderRadius: '50%', background: isOnline ? bg : '#6B7280', border: '1.5px solid #1A3353' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,.9)' }}>{m.prenom} {m.nom?.[0]}.</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '.03em', background: PROF_BG[m.profession], color: PROF_TEXT[m.profession] }}>
                      {shortProf}
                    </span>
                    <span style={{ fontSize: 9, color: isOnline ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.35)' }}>
                      {isOnline ? '🟢' : '⚫'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser]       = useState(null);
  const [fiches, setFiches]   = useState([]);
  const [ecoles, setEcoles]   = useState([]);
  const [elevesR, setElevesR] = useState([]);
  const [membres, setMembres] = useState([]);
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [annees, setAnnees]   = useState([]);
  const [anneeActive, setAnneeActive] = useState(null);
  const [showNotifs, setShowNotifs] = useState(false);

  // Présence temps réel (qui est en ligne)
  const { online: membresEnLigne } = usePresence(null);

  useEffect(() => {
    async function load() {
      const [u, f, ec, el, mb, no, an] = await Promise.all([
        base44.auth.me().catch(() => null),
        base44.entities.FicheEleve.list('-updated_date', 200).catch(() => []),
        base44.entities.EcoleRased.list('-created_date', 100).catch(() => []),
        base44.entities.EleveRased.list('-created_date', 500).catch(() => []),
        base44.entities.MembreEquipe.list('-created_date', 100).catch(() => []),
        base44.entities.Notification.filter({ lu: false }).catch(() => []),
        base44.entities.AnneeScolaire.list('-libelle', 20).catch(() => []),
      ]);
      setUser(u); setFiches(f); setEcoles(ec);
      setElevesR(el); setMembres(mb); setNotifs(no);
      setAnnees(an);
      const active = an.find(a => a.active) || an[0] || null;
      setAnneeActive(active?.id || null);
      setLoading(false);
    }
    load();

    // Souscription temps réel sur FicheEleve (fil d'activité live)
    const unsub = base44.entities.FicheEleve.subscribe((event) => {
      if (event.type === 'create') {
        setFiches(prev => [event.data, ...prev].slice(0, 200));
      } else if (event.type === 'update') {
        setFiches(prev => prev.map(f => f.id === event.data.id ? { ...f, ...event.data } : f));
      } else if (event.type === 'delete') {
        setFiches(prev => prev.filter(f => f.id !== event.entity_id));
      }
    });
    return unsub;
  }, []);

  const now   = Date.now();
  const MS30  = 30 * 86400000;
  const startMonth = new Date(); startMonth.setDate(1); startMonth.setHours(0, 0, 0, 0);

  // Filtrage par année scolaire sélectionnée
  const anneeSelectionnee = annees.find(a => a.id === anneeActive);
  const fichesFiltrees = (() => {
    if (!anneeSelectionnee) return fiches;
    const libelle = anneeSelectionnee.libelle;
    // 1. Fiches explicitement rattachées à cette année via le champ annee_scolaire
    //    (champ de référence, ne dépend pas de la date de création)
    const parChamp = fiches.filter(f => f.annee_scolaire === libelle);
    // 2. Fiches sans annee_scolaire renseignée : rattachement par date de création
    const sansChamp = fiches.filter(f => !f.annee_scolaire);
    const debut = anneeSelectionnee.date_debut
      ? new Date(anneeSelectionnee.date_debut)
      : new Date(`${libelle.split('-')[0]}-08-01`);
    const fin = anneeSelectionnee.date_fin
      ? new Date(anneeSelectionnee.date_fin)
      : new Date(`${libelle.split('-')[1] || String(parseInt(libelle.split('-')[0]) + 1)}-07-31`);
    const parDate = sansChamp.filter(f => {
      const d = new Date(f.created_date);
      return d >= debut && d <= fin;
    });
    return [...parChamp, ...parDate];
  })();

  // "Élèves suivis" = fiches non clôturées (Nouveau / Suivi actif / En attente) pour l'année en cours.
  // "Suivis clôturés" = fiches au statut "Clôturé" pour l'année en cours.
  // Les deux dérivent de fichesFiltrees (abonné en temps réel via FicheEleve.subscribe),
  // donc ils se rafraîchissent automatiquement dès qu'un statut est modifié.
  // "Élèves suivis" : fiches non clôturées ET complètes (école + classe renseignées)
  // Élèves du secteur attribués à l'année sélectionnée (via la fiche liée ou la date de création)
  const debutAnnee = anneeSelectionnee?.date_debut
    ? new Date(anneeSelectionnee.date_debut)
    : (anneeSelectionnee ? new Date(`${anneeSelectionnee.libelle.split('-')[0]}-08-15`) : null);
  const finAnnee = anneeSelectionnee?.date_fin
    ? new Date(anneeSelectionnee.date_fin)
    : (anneeSelectionnee ? new Date(`${(anneeSelectionnee.libelle.split('-')[1] || String(parseInt(anneeSelectionnee.libelle.split('-')[0]) + 1))}-07-15`) : null);
  const fichesFiltreesIds = new Set(fichesFiltrees.map(f => f.id));
  // "Élèves du secteur (imports PDF)" : ne compte que les élèves effectivement
  // rattachés à un import PDF réalisé (marqueur origine_import_pdf), pour l'année sélectionnée.
  const elevesAnnee = elevesR.filter(e => {
    if (!e.origine_import_pdf) return false;
    if (e.fiche_eleve_id) return fichesFiltreesIds.has(e.fiche_eleve_id);
    if (!debutAnnee || !finAnnee) return true;
    const d = new Date(e.created_date);
    return d >= debutAnnee && d <= finAnnee;
  });

  const totalEleves    = fichesFiltrees.filter(f => f.statut !== 'Clôturé' && f.ecole && f.classe).length;
  // "Qui fait quoi en ce moment" : élèves en suivi actif dont la fiche est complète (école + classe)
  const suivisActifsComplets = elevesR.filter(e => {
    if (e.statut !== 'Suivi actif') return false;
    const f = fiches.find(x => x.id === e.fiche_eleve_id);
    return f && f.ecole && f.classe;
  });
  const alertesFiches  = fichesFiltrees.filter(e => (now - new Date(e.updated_date || e.created_date).getTime()) > MS30);
  const elevesClotured = fichesFiltrees.filter(f => f.statut === 'Clôturé').length;

  // Critères pour alertes : fiche, notes ou interventions non mise à jour depuis 30j
  // Filtrer sur statut "Suivi actif" ou "En attente" seulement
  const alertesFichesRefined = fichesFiltrees.filter(f => {
    const eleveLinked = elevesR.find(e => e.fiche_eleve_id === f.id);
    if (!eleveLinked || !['Suivi actif', 'En attente'].includes(eleveLinked.statut)) return false;

    const lastUpdate = new Date(f.updated_date || f.created_date).getTime();
    const lastIntervention = f.interventions?.length > 0 ? new Date(Math.max(...f.interventions.map(i => new Date(i.date).getTime()))).getTime() : 0;
    const lastNote = f.notes ? lastUpdate : 0;

    const mostRecentActivity = Math.max(lastUpdate, lastIntervention, lastNote);
    return (now - mostRecentActivity) > MS30;
  });

  // Détecter fiches incomplètes
  const fichesIncompletes = fichesFiltrees.filter(f => {
    const eleveLinked = elevesR.find(e => e.fiche_eleve_id === f.id);
    if (!eleveLinked || !['Suivi actif', 'En attente'].includes(eleveLinked.statut)) return false;

    const missing = [];
    if (!f.motif_signalement && !f.observations) missing.push('Motif');
    if ((!f.intervenants || f.intervenants.length === 0) && !f.createdByName) missing.push('Intervenant');
    if (!f.date_naissance) missing.push('Date naiss.');
    return missing.length > 0;
  }).map(f => {
    const missing = [];
    if (!f.motif_signalement && !f.observations) missing.push('Motif');
    if ((!f.intervenants || f.intervenants.length === 0) && !f.createdByName) missing.push('Intervenant');
    if (!f.date_naissance) missing.push('Date naiss.');
    return { ...f, missing };
  });

  const totalAlertes = alertesFichesRefined.length + fichesIncompletes.length;

  const recentActivity = [...fichesFiltrees]
    .sort((a, b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date))
    .slice(0, 5);

  const alertes5 = [...alertesFichesRefined]
    .sort((a, b) => new Date(a.updated_date || a.created_date) - new Date(b.updated_date || b.created_date))
    .slice(0, 5);

  const ecolesStats = ecoles.map(ec => {
    const nbEl = elevesR.filter(e => e.ecole_id === ec.id).length;
    const nbAl = elevesR.filter(e => e.ecole_id === ec.id && (now - new Date(e.date_derniere_action || e.created_date).getTime()) > MS30).length;
    return { ...ec, nbEl, nbAl };
  });

  const prenom = user?.full_name?.split(' ')[0] || 'vous';

  // ── Styles inline partagés ──────────────────────────────────────────────

  const S = {
    card: { background: '#fff', border: '1px solid #D8E1EE', borderRadius: 12, overflow: 'hidden' },
    cardHead: { padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #D8E1EE' },
    cardTitle: { fontSize: 13, fontWeight: 700, color: '#182840' },
    cardLink: { fontSize: 11.5, color: '#3B82C4', cursor: 'pointer', fontWeight: 500, textDecoration: 'none' },
    row: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderBottom: '1px solid #F0F3F8', cursor: 'pointer', transition: 'background .1s', background: 'transparent' },
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F0F3F8', height: '100vh', display: 'flex', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap');
        .db-row:hover { background: #F8FAFD !important; }
        .db-ec:hover  { background: #F0F3F8 !important; }
        .db-nav:hover { background: rgba(255,255,255,.07); color: #fff; }
        .db-content {
          height: calc(100vh - 54px) !important;
          overflow-y: auto !important;
          padding-bottom: 60px !important;
        }
        @media (max-width: 900px) {
          .db-sidebar    { display: none !important; }
          .db-main       { margin-left: 0 !important; }
          .db-stats      { grid-template-columns: 1fr 1fr !important; }
          .db-raccourcis { grid-template-columns: 1fr 1fr !important; }
          .db-twocol     { grid-template-columns: 1fr !important; }
          .db-topbar-actions { display: none !important; }
          .db-topbar-year { max-width: 130px !important; font-size: 11px !important; padding: 5px 8px !important; }
          .db-hero       { flex-direction: column !important; align-items: flex-start !important; }
          .db-hero-btns  { flex-direction: row !important; width: 100% !important; }
          .db-content    { padding: 12px 12px 80px !important; }
          .db-topbar     { padding: 0 12px !important; height: auto !important; min-height: 54px !important; flex-wrap: wrap !important; gap: 6px !important; padding-top: 8px !important; padding-bottom: 8px !important; }
        }
      `}</style>

      {/* SIDEBAR */}
      <div className="db-sidebar">
        <Sidebar membres={membres} notifications={notifs.length} membresEnLigne={membresEnLigne} loading={loading} totalAlertes={totalAlertes} />
      </div>

      {/* MAIN */}
      <div className="db-main" style={{ marginLeft: 230, flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

        {/* TOPBAR */}
        <div className="db-topbar" style={{ background: '#fff', borderBottom: '1px solid #D8E1EE', height: 54, padding: '0 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#182840', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Équipe RASED · La Possession</div>
            <div style={{ fontSize: 11, color: '#566880', marginTop: 1 }}>{todayLabel()}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* Sélecteur d'année scolaire — toujours visible */}
            {annees.length > 0 && (
              <select className="db-topbar-year" value={anneeActive || ''} onChange={e => setAnneeActive(e.target.value)}
                style={{ padding: '6px 10px', fontSize: 12, fontWeight: 600, border: '1px solid #3B82C4', borderRadius: 8, background: '#EAF2FB', color: '#1A3353', cursor: 'pointer', outline: 'none', maxWidth: 160 }}>
                {[...annees].sort((a, b) => b.libelle.localeCompare(a.libelle)).map(a => (
                  <option key={a.id} value={a.id}>
                    {a.libelle}{(a.est_active || a.active) ? ' ★' : ''}
                  </option>
                ))}
              </select>
            )}
            {/* Actions masquées sur mobile */}
            <div className="db-topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button type="button" onClick={() => setShowNotifs(!showNotifs)} style={{ position: 'relative', width: 36, height: 36, borderRadius: 9, background: '#F0F3F8', border: '1px solid #D8E1EE', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, padding: 0 }}>
                🔔
                {notifs.length > 0 && <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: '50%', background: '#B85C1A', border: '1.5px solid #fff' }} />}
              </button>
              <Link to="/import-pdf" title="Importer PDF" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', border: '1px solid #D8E1EE', background: 'transparent', color: '#182840', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                📄 Importer PDF
              </Link>
            </div>
          </div>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifs && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ position: 'fixed', inset: 0, zIndex: 200 }} onClick={() => setShowNotifs(false)} />
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  style={{ position: 'fixed', top: 62, right: 26, width: 320, maxHeight: 400, background: '#fff', border: '1px solid #D8E1EE', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 201 }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0F3F8', fontWeight: 600, fontSize: 14, color: '#182840' }}>Notifications ({notifs.length})</div>
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    {notifs.length === 0 ? (
                      <p style={{ textAlign: 'center', padding: '20px', fontSize: 12, color: '#566880' }}>Aucune notification</p>
                    ) : (
                      notifs.map(n => (
                        <div key={n.id} onClick={() => { navigate(n.fiche_id ? `/detail-fiche?id=${n.fiche_id}` : '/dashboard'); setShowNotifs(false); }}
                          style={{ padding: '12px 14px', borderBottom: '1px solid #F0F3F8', cursor: 'pointer', transition: 'background .1s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#F8FAFD'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div style={{ fontWeight: 500, fontSize: 13, color: '#182840', marginBottom: 4 }}>{n.titre}</div>
                          <div style={{ fontSize: 12, color: '#566880', marginBottom: 4 }}>{n.message}</div>
                          <div style={{ fontSize: 11, color: '#94A3B8' }}>
                            {new Date(n.created_date).toLocaleDateString('fr-FR', { day: 'short', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* CONTENT */}
        <div className="db-content" style={{ padding: '24px 26px 140px', flex: 1, overflowY: 'auto' }}>

          {/* HERO */}
          <div className="db-hero" style={{ background: '#1A3353', borderRadius: 14, padding: '18px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, overflow: 'hidden', position: 'relative', boxSizing: 'border-box', width: '100%' }}>
            <div style={{ position: 'absolute', right: -60, top: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,196,.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.45)', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 18, height: 2, background: '#3B82C4', borderRadius: 1 }} />
                Suivis RASED · La Possession · La Réunion
              </div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 25, color: '#fff', lineHeight: 1.25, marginBottom: 8 }}>
                L'équipe suit{' '}
                <em style={{ fontStyle: 'italic', color: '#7EC8F0' }}>{loading ? '…' : `${totalEleves} élève${totalEleves !== 1 ? 's' : ''}`}</em>
                <br />{anneeSelectionnee ? `en ${anneeSelectionnee.libelle.replace('-', '–')}` : 'cette année scolaire'}.
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.55)' }}>
                {totalAlertes > 0
                  ? `⚠️ ${totalAlertes} élève${totalAlertes > 1 ? 's' : ''} nécessitent votre attention`
                  : `✅ Tous les dossiers sont à jour`}
              </div>
            </div>
            <div className="db-hero-btns" style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', zIndex: 1, flexShrink: 0 }}>
              <Link to="/mes-ecoles" style={{ padding: '9px 16px', borderRadius: 9, fontSize: 13, fontWeight: 500, background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.8)', border: '1px solid rgba(255,255,255,.18)', cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', textAlign: 'center' }}>
                Mes écoles →
              </Link>
            </div>
          </div>

          {/* STATS */}
          <div className="db-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 13, marginBottom: 20 }}>
            {[
               { val: elevesAnnee.length, lbl: 'Élèves du secteur',     ico: '🏫', ibg: '#EAF2FB', trend: 'imports PDF',            warn: false, to: '/mes-ecoles' },
               { val: totalEleves,        lbl: 'Élèves suivis',         ico: '👤', ibg: '#E4F4ED', trend: '↑ depuis août',        warn: false, to: '/liste-eleves' },
              { val: alertesFiches.length, lbl: 'Fiches sans mise à jour depuis 30 jours', ico: '⏰', ibg: '#FEF0E4', trend: 'À relancer',           warn: true,  to: '/liste-eleves' },
              { val: elevesClotured,     lbl: 'Suivis clôturés',       ico: '✅', ibg: '#E4F4ED', trend: 'depuis août',           warn: false, to: '/mes-ecoles' },
            ].map((c, i) => (
              <Link key={i} to={c.to} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#fff', border: `1px solid #D8E1EE`, borderRadius: 12, padding: '16px 18px', cursor: 'pointer', transition: 'box-shadow .15s, transform .15s', borderTop: c.warn && c.val > 0 ? '3px solid #B85C1A' : undefined }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 18px rgba(26,51,83,.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                  {c.ico && <div style={{ width: 34, height: 34, borderRadius: 8, background: c.ibg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, marginBottom: 11 }}>{c.ico}</div>}
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 34, lineHeight: 1, color: c.warn && c.val > 0 ? '#B85C1A' : '#182840', marginBottom: 3 }}>{c.val === null ? '📖' : loading ? '—' : c.val}</div>
                  <div style={{ fontSize: 12, color: '#566880', marginBottom: 8 }}>{c.lbl}</div>
                  <div style={{ fontSize: 11, color: c.warn && c.val > 0 ? '#B85C1A' : '#1E7A52', fontWeight: 500 }}>{c.trend}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* ALERTES CARD */}
          <div style={{ ...S.card, marginBottom: 20 }}>
            <div style={S.cardHead}>
              <span style={S.cardTitle}>⚠️ Alertes et suivi</span>
            </div>

            {/* Section 1 : Sans mise à jour +30j */}
            <div style={{ padding: '14px 0', borderBottom: '1px solid #F0F3F8' }}>
              <div style={{ padding: '0 18px 12px', fontSize: 12.5, fontWeight: 600, color: '#182840' }}>⏰ Fiches sans mise à jour depuis 30 jours</div>
              {alertesFichesRefined.length === 0
                ? <p style={{ padding: '14px 18px', fontSize: 13, color: '#1E7A52', background: '#E4F4ED', marginLeft: 10, marginRight: 10, borderRadius: 10 }}>✅ Tous les dossiers sont à jour</p>
                : alertesFichesRefined.slice(0, 5).map((e, i) => {
                  const lastUpdate = new Date(e.updated_date || e.created_date).getTime();
                  const lastIntervention = e.interventions?.length > 0 ? Math.max(...e.interventions.map(i => new Date(i.date).getTime())) : 0;
                  const mostRecentActivity = Math.max(lastUpdate, lastIntervention);
                  const days = Math.floor((now - mostRecentActivity) / 86400000);
                  return (
                    <div key={e.id} className="db-row" style={{ ...S.row, borderBottom: i < Math.min(5, alertesFiches.length) - 1 ? '1px solid #F0F3F8' : 'none' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#182840' }}>{e.prenom} {e.nom}</div>
                        <div style={{ fontSize: 11, color: '#566880', marginTop: 1 }}>{[cleanClassName(e.classe), titleCase(e.ecole)].filter(Boolean).join(' · ') || '—'}</div>
                      </div>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#B85C1A', background: '#FEF0E4', padding: '2px 8px', borderRadius: 10, flexShrink: 0, marginRight: 8 }}>
                        +{days}j
                      </span>
                      <button onClick={() => navigate(`/detail-fiche?id=${e.id}`)} style={{ fontSize: 10.5, fontWeight: 700, color: '#3B82C4', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                        Voir →
                      </button>
                    </div>
                  );
                })}
              {alertesFichesRefined.length > 5 && (
                <div style={{ padding: '8px 18px', textAlign: 'right' }}>
                  <Link to="/liste-eleves" style={{ fontSize: 11.5, color: '#3B82C4', cursor: 'pointer', fontWeight: 500, textDecoration: 'none' }}>Voir tous les {alertesFichesRefined.length} →</Link>
                </div>
              )}
            </div>

            {/* Section 2 : Fiches incomplètes */}
            <div style={{ padding: '14px 0' }}>
              <div style={{ padding: '0 18px 12px', fontSize: 12.5, fontWeight: 600, color: '#182840' }}>📋 Fiches incomplètes</div>
              {fichesIncompletes.length === 0
                ? <p style={{ padding: '14px 18px', fontSize: 13, color: '#1E7A52', background: '#E4F4ED', marginLeft: 10, marginRight: 10, borderRadius: 10 }}>✅ Toutes les fiches sont complètes</p>
                : fichesIncompletes.slice(0, 5).map((e, i) => (
                  <div key={e.id} className="db-row" style={{ ...S.row, borderBottom: i < Math.min(5, fichesIncompletes.length) - 1 ? '1px solid #F0F3F8' : 'none' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#182840' }}>{e.prenom} {e.nom}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 5 }}>
                        {e.missing.map((m, j) => (
                          <span key={j} style={{ fontSize: 9.5, fontWeight: 700, color: '#fff', background: '#EF4444', padding: '1px 6px', borderRadius: 8 }}>
                            {m} manquant
                          </span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => navigate(`/detail-fiche?id=${e.id}&tab=suivi&highlight=motif`)} style={{ fontSize: 10.5, fontWeight: 700, color: '#3B82C4', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                      Compléter →
                    </button>
                  </div>
                ))}
              {fichesIncompletes.length > 5 && (
                <div style={{ padding: '8px 18px', textAlign: 'right' }}>
                  <a href="javascript:void(0)" onClick={() => window.location.href = '/liste-eleves'} style={{ fontSize: 11.5, color: '#3B82C4', cursor: 'pointer', fontWeight: 500, textDecoration: 'none' }}>Voir tous les {fichesIncompletes.length} →</a>
                </div>
              )}
            </div>
          </div>

          {/* RACCOURCIS */}
           <div className="db-raccourcis" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { ico: '📄', ibg: '#EAF2FB', lbl: 'Importer une liste PDF',  sub: 'Créer des fiches depuis Onde', to: '/import-pdf' },
              { ico: '👤', ibg: '#E4F4ED', lbl: 'Créer une fiche élève',   sub: 'Saisie manuelle',             to: '/fiche-eleve' },
              { ico: '📊', ibg: '#FEF0E4', lbl: 'Export annuel',           sub: 'Rapport pour l\'IEN',          to: '/export-annuel' },
            ].map((c, i) => {
              const inner = (
                <div style={{ background: '#fff', border: '1px solid #D8E1EE', borderRadius: 11, padding: '14px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all .14s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#3B82C4'; e.currentTarget.style.boxShadow = '0 3px 12px rgba(59,130,196,.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#D8E1EE'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: c.ibg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>{c.ico}</div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#182840' }}>{c.lbl}</div>
                    <div style={{ fontSize: 11, color: '#566880', marginTop: 2 }}>{c.sub}</div>
                  </div>
                </div>
              );
              if (c.action) return <div key={i} onClick={c.action}>{inner}</div>;
              return <Link key={i} to={c.to} style={{ textDecoration: 'none' }}>{inner}</Link>;
            })}
          </div>

          {/* TWO COL */}
          <div className="db-twocol" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 16 }}>

            {/* Col gauche */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* ACTIVITÉ RÉCENTE */}
              <div style={S.card}>
                <div style={S.cardHead}>
                  <span style={S.cardTitle}>Activité récente de l'équipe</span>
                  <Link to="/historique" style={S.cardLink}>Tout voir →</Link>
                </div>
                {recentActivity.length === 0
                  ? <p style={{ textAlign: 'center', padding: '32px 0', fontSize: 13, color: '#566880' }}>Aucune activité récente</p>
                  : recentActivity.map((e, i) => {
                    const isNew = !e.updated_date || e.updated_date === e.created_date;
                    return (
                      <div key={e.id} className="db-row" style={{ ...S.row, borderBottom: i < recentActivity.length - 1 ? '1px solid #F0F3F8' : 'none' }}
                        onClick={() => navigate(`/detail-fiche?id=${e.id}`)}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: isNew ? '#E4F4ED' : '#EAF2FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginTop: 1 }}>
                          {isNew ? '👤' : '🔍'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 500, color: '#182840', marginBottom: 2 }}>
                            {isNew ? 'Fiche créée' : 'Fiche mise à jour'} — <strong style={{ color: '#254D7A', fontWeight: 600 }}>{e.prenom} {e.nom}</strong>
                          </div>
                          <div style={{ fontSize: 11, color: '#566880', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {[cleanClassName(e.classe), titleCase(e.ecole)].filter(Boolean).join(' · ') || 'Fiche élève'}
                          </div>
                        </div>
                        <div style={{ fontSize: 10.5, color: '#566880', flexShrink: 0 }}>{timeAgo(e.updated_date || e.created_date)}</div>
                      </div>
                    );
                  })}
              </div>


            </div>

            {/* Col droite */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* ÉCOLES */}
              <div style={S.card}>
                <div style={S.cardHead}>
                  <span style={S.cardTitle}>Mes écoles</span>
                  <Link to="/mes-ecoles" style={S.cardLink}>Gérer →</Link>
                </div>
                <div style={{ padding: '6px 0' }}>
                  {ecolesStats.length === 0
                    ? <p style={{ textAlign: 'center', padding: '28px 0', fontSize: 13, color: '#566880' }}><Link to="/mes-ecoles" style={{ color: '#3B82C4' }}>Ajouter une école →</Link></p>
                    : ecolesStats.map((ec, i) => (
                      <div key={ec.id} className="db-ec" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 9, cursor: 'pointer', transition: 'background .1s', margin: '4px 6px' }}
                        onClick={() => navigate(`/detail-ecole?id=${ec.id}`)}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#1A3353', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🏫</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#182840', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{titleCase(ec.nom)}</div>
                          <div style={{ fontSize: 11, color: '#566880', marginTop: 1 }}>{ec.type || 'École'} · {ec.nbEl} élève{ec.nbEl !== 1 ? 's' : ''}</div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, flexShrink: 0, background: ec.nbAl > 0 ? '#FEF0E4' : '#E4F4ED', color: ec.nbAl > 0 ? '#B85C1A' : '#1E7A52' }}>
                          {ec.nbAl > 0 ? `${ec.nbAl} alerte${ec.nbAl > 1 ? 's' : ''}` : 'À jour'}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* BANDE ÉQUIPE */}
          {membres.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #D8E1EE', borderRadius: 12, padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#566880', flexShrink: 0 }}>👥 Équipe RASED</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flex: 1 }}>
                {membres.map(m => {
                  const bg = PROF_COLOR[m.profession] || '#3B82C4';
                  const init = `${m.prenom?.[0] || ''}${m.nom?.[0] || ''}`;
                  return (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#F8FAFD', border: `1.5px solid ${PROF_BG[m.profession]}`, borderRadius: 12, padding: '8px 12px' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', position: 'relative', flexShrink: 0 }}>
                        {init}
                        <span style={{ position: 'absolute', bottom: -1, right: -1, width: 9, height: 9, borderRadius: '50%', background: bg, border: '2px solid #F8FAFD' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#182840', margin: 0, marginBottom: 2 }}>{m.prenom} {m.nom}</div>
                        <div style={{ fontSize: 10.5, color: '#566880', lineHeight: 1.3 }}>{PROF_LABEL[m.profession] || m.profession}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              </div>
              )}

        </div>
      </div>





    </div>
  );
}