import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { usePresence } from '@/lib/usePresence';

// ── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (h < 1) return "à l'instant";
  if (h < 24) return `il y a ${h}h`;
  if (d === 1) return 'hier';
  return `il y a ${d}j`;
}

function daysSince(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function anneeScolaire() {
  const now = new Date();
  const y = now.getFullYear();
  return now.getMonth() >= 8 ? `${y}–${y + 1}` : `${y - 1}–${y}`;
}

function todayLabel() {
  const s = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const PROF_COLOR = { 'Psy EN EDA': '#3B82C4', 'MaDR': '#1E7A52', 'MaDP': '#B85C1A' };
const PROF_LABEL = { 'Psy EN EDA': 'Psy-EN', 'MaDR': 'Maître G', 'MaDP': 'Maître E' };
const PROF_BG    = { 'Psy EN EDA': '#EAF2FB', 'MaDR': '#E4F4ED', 'MaDP': '#FEF0E4' };
const PROF_TEXT  = { 'Psy EN EDA': '#254D7A', 'MaDR': '#1E7A52', 'MaDP': '#B85C1A' };

// ── Nav items ──────────────────────────────────────────────────────────────

const NAV = [
  { section: 'Principal' },
  { label: 'Tableau de bord', ico: '🏠', to: '/dashboard' },
  { label: 'Mes écoles',      ico: '🏫', to: '/mes-ecoles' },
  { label: 'Élèves suivis',   ico: '👤', to: '/liste-eleves' },
  { label: 'Hypothèses EDA',  ico: '🔍', to: '/hypotheses-eleve', diag: true },
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

function Sidebar({ membres, notifications, onDiagClick, membresEnLigne = [] }) {
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
      <nav style={{ padding: '12px 10px', flex: 1, overflowY: 'auto' }}>
        {NAV.map((item, i) => {
          if (item.section) {
            return (
              <div key={i} style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.28)', padding: '14px 8px 4px' }}>
                {item.section}
              </div>
            );
          }
          const isActive = location === item.to;
          const handleClick = item.diag ? onDiagClick : undefined;
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
              {item.badge && notifications > 0 && (
                <span style={{ background: '#B85C1A', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10 }}>
                  {notifications}
                </span>
              )}
            </div>
          );
          if (handleClick) return <div key={i} onClick={handleClick}>{inner}</div>;
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
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0, position: 'relative', opacity: isOnline ? 1 : 0.5 }}>
                  {init}
                  <span style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderRadius: '50%', background: isOnline ? '#4ADE80' : '#6B7280', border: '1.5px solid #1A3353' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: isOnline ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.4)' }}>{m.prenom} {m.nom?.[0]}.</div>
                  <div style={{ fontSize: 10, color: isOnline ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.25)' }}>{isOnline ? '● En ligne' : '○ Hors ligne'} · {PROF_LABEL[m.profession] || m.profession}</div>
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
  const [diagModal, setDiagModal] = useState(false);
  const [search, setSearch]   = useState('');
  const [annees, setAnnees]   = useState([]);
  const [anneeActive, setAnneeActive] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
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
      
      // Afficher le message de bienvenue si on vient d'une inscription
      const params = new URLSearchParams(window.location.search);
      if (params.get('welcome') === 'true') {
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 5000);
      }
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
    // Si des fiches ont un annee_scolaire_id, filtrer dessus
    const avecId = fiches.filter(f => f.annee_scolaire_id);
    if (avecId.length > 0) {
      return fiches.filter(f => !f.annee_scolaire_id || f.annee_scolaire_id === anneeActive);
    }
    // Sinon filtrer par dates
    const debut = anneeSelectionnee.date_debut
      ? new Date(anneeSelectionnee.date_debut)
      : new Date(`${anneeSelectionnee.libelle.split('-')[0]}-08-01`);
    const fin = anneeSelectionnee.date_fin
      ? new Date(anneeSelectionnee.date_fin)
      : new Date(`${anneeSelectionnee.libelle.split('-')[1] || String(parseInt(anneeSelectionnee.libelle.split('-')[0]) + 1)}-07-31`);
    return fiches.filter(f => {
      const d = new Date(f.created_date);
      return d >= debut && d <= fin;
    });
  })();

  const totalEleves    = fichesFiltrees.length;
  const alertesFiches  = fichesFiltrees.filter(e => (now - new Date(e.updated_date || e.created_date).getTime()) > MS30);
  const elevesClotured = elevesR.filter(e => e.statut === 'Clôturé').length;

  const recentActivity = [...fichesFiltrees]
    .sort((a, b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date))
    .slice(0, 5);

  const alertes5 = [...alertesFiches]
    .sort((a, b) => new Date(a.updated_date || a.created_date) - new Date(b.updated_date || b.created_date))
    .slice(0, 5);

  const ecolesStats = ecoles.map(ec => {
    const nbEl = elevesR.filter(e => e.ecole_id === ec.id).length;
    const nbAl = elevesR.filter(e => e.ecole_id === ec.id && (now - new Date(e.date_derniere_action || e.created_date).getTime()) > MS30).length;
    return { ...ec, nbEl, nbAl };
  });

  const searchRes = fichesFiltrees.filter(e =>
    `${e.prenom} ${e.nom}`.toLowerCase().includes(search.toLowerCase()) ||
    (e.ecole || '').toLowerCase().includes(search.toLowerCase())
  );

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
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F0F3F8', minHeight: '100vh', display: 'flex' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap');
        .db-row:hover { background: #F8FAFD !important; }
        .db-ec:hover  { background: #F0F3F8 !important; }
        .db-nav:hover { background: rgba(255,255,255,.07); color: #fff; }
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
          .db-content    { padding: 12px 12px 100px !important; }
          .db-topbar     { padding: 0 12px !important; height: auto !important; min-height: 54px !important; flex-wrap: wrap !important; gap: 6px !important; padding-top: 8px !important; padding-bottom: 8px !important; }
        }
      `}</style>

      {/* SIDEBAR */}
      <div className="db-sidebar">
        <Sidebar membres={membres} notifications={notifs.length} onDiagClick={() => setDiagModal(true)} membresEnLigne={membresEnLigne} />
      </div>

      {/* MAIN */}
      <div className="db-main" style={{ marginLeft: 230, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

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
              <button onClick={() => setDiagModal(true)} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', border: 'none', background: '#3B82C4', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                + Nouvelles hypothèses
              </button>
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
        <div className="db-content" style={{ padding: '24px 26px 100px' }}>

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
                {alertesFiches.length > 0
                  ? `${alertesFiches.length} élève${alertesFiches.length > 1 ? 's' : ''} sans mise à jour depuis plus de 30 jours · ${membres.length} membre${membres.length !== 1 ? 's' : ''} actif${membres.length !== 1 ? 's' : ''}`
                  : `✅ Tous les dossiers sont à jour · ${membres.length} membre${membres.length !== 1 ? 's' : ''} actif${membres.length !== 1 ? 's' : ''}`}
              </div>
            </div>
            <div className="db-hero-btns" style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', zIndex: 1, flexShrink: 0 }}>
              <Link to="/liste-eleves" style={{ padding: '9px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: '#3B82C4', color: '#fff', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', textAlign: 'center' }}>
                ⚠️ Alertes
              </Link>
              <Link to="/mes-ecoles" style={{ padding: '9px 16px', borderRadius: 9, fontSize: 13, fontWeight: 500, background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.8)', border: '1px solid rgba(255,255,255,.18)', cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', textAlign: 'center' }}>
                Mes écoles →
              </Link>
            </div>
          </div>

          {/* STATS */}
          <div className="db-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 13, marginBottom: 20 }}>
            {[
              { val: totalEleves,        lbl: 'Élèves suivis',         ico: '👤', ibg: '#EAF2FB', trend: '↑ depuis août',        warn: false, to: '/liste-eleves' },
              { val: null, lbl: 'Ressources', ico: '📖', ibg: '#EEE9FF', trend: 'RASED · Professionnels · Structures', warn: false, to: '/items-professionnels' },
              { val: alertesFiches.length, lbl: 'Sans mise à jour +30j', ico: '⏰', ibg: '#FEF0E4', trend: 'À relancer',           warn: true,  to: '/liste-eleves' },
              { val: elevesClotured,     lbl: 'Suivis clôturés',       ico: '✅', ibg: '#E4F4ED', trend: 'depuis août',           warn: false, to: '/mes-ecoles' },
            ].map((c, i) => (
              <Link key={i} to={c.to} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#fff', border: `1px solid #D8E1EE`, borderRadius: 12, padding: '16px 18px', cursor: 'pointer', transition: 'box-shadow .15s, transform .15s', borderTop: c.warn && c.val > 0 ? '3px solid #B85C1A' : undefined }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 18px rgba(26,51,83,.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: c.ibg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, marginBottom: 11 }}>{c.ico}</div>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 34, lineHeight: 1, color: c.warn && c.val > 0 ? '#B85C1A' : '#182840', marginBottom: 3 }}>{c.val === null ? '📖' : loading ? '—' : c.val}</div>
                  <div style={{ fontSize: 12, color: '#566880', marginBottom: 8 }}>{c.lbl}</div>
                  <div style={{ fontSize: 11, color: c.warn && c.val > 0 ? '#B85C1A' : '#1E7A52', fontWeight: 500 }}>{c.trend}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* RACCOURCIS */}
          <div className="db-raccourcis" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { ico: '🔍', ibg: '#EEE9FF', lbl: 'Nouvelles hypothèses',   sub: 'Lancer l\'arbre EDA',         action: () => setDiagModal(true) },
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
                    const prof = e.createdByProfession;
                    return (
                      <div key={e.id} className="db-row" style={{ ...S.row, borderBottom: i < recentActivity.length - 1 ? '1px solid #F0F3F8' : 'none' }}
                        onClick={() => navigate(`/detail-fiche?id=${e.id}`)}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: isNew ? '#E4F4ED' : '#EAF2FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginTop: 1 }}>
                          {isNew ? '👤' : '🔍'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                            {prof && (
                              <span style={{ fontSize: 9.5, fontWeight: 700, padding: '1px 6px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: '.04em', background: PROF_BG[prof] || '#EAF2FB', color: PROF_TEXT[prof] || '#254D7A' }}>
                                {PROF_LABEL[prof] || prof}
                              </span>
                            )}
                            {e.createdByName && <span style={{ fontSize: 11, color: '#566880' }}>{e.createdByName}</span>}
                          </div>
                          <div style={{ fontSize: 12.5, fontWeight: 500, color: '#182840', marginBottom: 2 }}>
                            {isNew ? 'Fiche créée' : 'Fiche mise à jour'} — <strong style={{ color: '#254D7A', fontWeight: 600 }}>{e.prenom} {e.nom}</strong>
                          </div>
                          <div style={{ fontSize: 11, color: '#566880', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {[e.classe, e.ecole].filter(Boolean).join(' · ') || 'Fiche élève'}
                          </div>
                        </div>
                        <div style={{ fontSize: 10.5, color: '#566880', flexShrink: 0 }}>{timeAgo(e.updated_date || e.created_date)}</div>
                      </div>
                    );
                  })}
              </div>

              {/* QUI FAIT QUOI */}
              <div style={S.card}>
                <div style={S.cardHead}>
                  <span style={S.cardTitle}>Qui fait quoi en ce moment</span>
                  <Link to="/liste-eleves" style={S.cardLink}>Voir tous →</Link>
                </div>
                {elevesR.filter(e => e.statut === 'Suivi actif').slice(0, 4).map((e, i, arr) => {
                  const fiche = fiches.find(f => f.id === e.fiche_eleve_id);
                  const prof = fiche?.createdByProfession;
                  const bg = PROF_COLOR[prof] || '#3B82C4';
                  const init = `${e.prenom?.[0] || ''}${e.nom?.[0] || ''}`;
                  const pillMap = { 'Suivi actif': { bg: '#E4F4ED', c: '#1E7A52', lbl: 'Suivi actif' }, 'En attente': { bg: '#FEF0E4', c: '#B85C1A', lbl: 'En attente' }, 'Nouveau': { bg: '#EAF2FB', c: '#3B82C4', lbl: 'Hypothèses' } };
                  const pill = pillMap[e.statut] || { bg: '#EEE9FF', c: '#5B3FA6', lbl: e.statut };
                  return (
                    <div key={e.id} className="db-row" style={{ ...S.row, borderBottom: i < arr.length - 1 ? '1px solid #F0F3F8' : 'none' }}
                      onClick={() => navigate(`/detail-eleve?id=${e.id}`)}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{init}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#182840' }}>{e.prenom} {e.nom}</div>
                        <div style={{ fontSize: 11, color: '#566880', marginTop: 1 }}>{[e.classe, e.ecole_id].filter(Boolean).join(' · ')}</div>
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, flexShrink: 0, background: pill.bg, color: pill.c }}>{pill.lbl}</div>
                    </div>
                  );
                })}
                {elevesR.filter(e => e.statut === 'Suivi actif').length === 0 && (
                  <p style={{ textAlign: 'center', padding: '28px 0', fontSize: 13, color: '#566880' }}>Aucun suivi actif</p>
                )}
              </div>
            </div>

            {/* Col droite */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* ALERTES */}
              <div style={S.card}>
                <div style={S.cardHead}>
                  <span style={S.cardTitle}>⚠️ À relancer</span>
                  <Link to="/liste-eleves" style={S.cardLink}>Voir tous →</Link>
                </div>
                {alertes5.length === 0
                  ? <p style={{ textAlign: 'center', padding: '28px 0', fontSize: 13, color: '#566880' }}>✅ Aucune alerte</p>
                  : alertes5.map((e, i) => (
                    <div key={e.id} className="db-row" style={{ ...S.row, borderBottom: i < alertes5.length - 1 ? '1px solid #F0F3F8' : 'none' }}
                      onClick={() => navigate(`/detail-fiche?id=${e.id}`)}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#B85C1A', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#182840' }}>{e.prenom} {e.nom}</div>
                        <div style={{ fontSize: 11, color: '#566880', marginTop: 1 }}>{[e.classe, e.ecole].filter(Boolean).join(' · ') || '—'}</div>
                      </div>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#B85C1A', background: '#FEF0E4', padding: '2px 8px', borderRadius: 10, flexShrink: 0 }}>
                        +{daysSince(e.updated_date || e.created_date)}j
                      </span>
                    </div>
                  ))}
              </div>

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
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#182840', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ec.nom}</div>
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
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#566880', flexShrink: 0 }}>Équipe RASED</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flex: 1 }}>
                {membres.map(m => {
                  const bg = PROF_COLOR[m.profession] || '#3B82C4';
                  const init = `${m.prenom?.[0] || ''}${m.nom?.[0] || ''}`;
                  return (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#F0F3F8', border: '1px solid #D8E1EE', borderRadius: 20, padding: '5px 12px 5px 5px' }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', position: 'relative', flexShrink: 0 }}>
                        {init}
                        <span style={{ position: 'absolute', bottom: 0, right: 0, width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', border: '1.5px solid #F0F3F8' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: '#182840' }}>{m.prenom} {m.nom}</div>
                        <div style={{ fontSize: 10, color: '#566880' }}>{PROF_LABEL[m.profession] || m.profession}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link to="/invite-users" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid #D8E1EE', background: 'transparent', color: '#182840', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                + Inviter un membre
              </Link>
            </div>
          )}

        </div>
      </div>



      {/* MESSAGE DE BIENVENUE */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 500, background: '#1E7A52', color: '#fff', borderRadius: 12, padding: '16px 24px', boxShadow: '0 8px 24px rgba(0,0,0,.2)' }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>✅ Bienvenue dans l'équipe RASED de La Possession !</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.85)', marginTop: 4 }}>Votre compte a été créé avec succès.</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL HYPOTHÈSES */}
      <AnimatePresence>
        {diagModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
            onClick={() => setDiagModal(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 640, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 -8px 40px rgba(0,0,0,.15)' }}>
              <div style={{ width: 36, height: 4, background: '#D8E1EE', borderRadius: 2, margin: '12px auto 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 10px', borderBottom: '1px solid #F0F3F8' }}>
                <p style={{ fontWeight: 600, fontSize: 15, color: '#182840' }}>🔍 Nouvelles hypothèses — Choisir un élève</p>
                <button onClick={() => setDiagModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X className="w-4 h-4" /></button>
              </div>
              <div style={{ padding: '10px 14px 6px' }}>
                <div style={{ position: 'relative' }}>
                  <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94A3B8' }} />
                  <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un élève..."
                    style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10, fontSize: 14, border: '1px solid #D8E1EE', borderRadius: 12, outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 20px' }}>
                {searchRes.length === 0
                  ? <p style={{ textAlign: 'center', padding: '32px 0', fontSize: 13, color: '#566880' }}>Aucun élève trouvé</p>
                  : searchRes.slice(0, 20).map(e => (
                    <button key={e.id} onClick={() => { setDiagModal(false); navigate(`/hypotheses-eleve?id=${e.id}`); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={ev => ev.currentTarget.style.background = '#F8FAFD'}
                      onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#3B82C4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {e.prenom?.[0]}{e.nom?.[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#182840', margin: 0 }}>{e.prenom} {e.nom}</p>
                        <p style={{ fontSize: 12, color: '#566880', margin: 0 }}>{e.classe || ''}{e.ecole ? ` · ${e.ecole}` : ''}</p>
                      </div>
                    </button>
                  ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}