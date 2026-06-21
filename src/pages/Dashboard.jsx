import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Brain } from 'lucide-react';

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

const S = {
  bleu: '#1E3A5F', bleuMid: '#2C5282', bleuCiel: '#4A90C4', bleuPale: '#EBF4FB',
  vert: '#276749', vertPale: '#E6F4ED', orange: '#C05621', orangePale: '#FEF0E6',
  ardoise: '#F1F4F8', bord: '#DDE4EE', texte: '#1A2E45', doux: '#5A6E87', blanc: '#FFFFFF',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [eleves, setEleves] = useState([]);
  const [diagnostics, setDiagnostics] = useState([]);
  const [ecoles, setEcoles] = useState([]);
  const [elevesRased, setElevesRased] = useState([]);
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDiagModal, setShowDiagModal] = useState(false);
  const [diagSearch, setDiagSearch] = useState('');

  const load = async () => {
    const [u, fiches, diags, ec, el, mb] = await Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.FicheEleve.list('-updated_date', 200).catch(() => []),
      base44.entities.Diagnostic.list('-created_date', 200).catch(() => []),
      base44.entities.EcoleRased.list('-created_date', 100).catch(() => []),
      base44.entities.EleveRased.list('-created_date', 500).catch(() => []),
      base44.entities.MembreEquipe.list('-created_date', 100).catch(() => []),
    ]);
    setUser(u);
    setEleves(fiches.filter(f => f.id));
    setDiagnostics(diags);
    setEcoles(ec);
    setElevesRased(el);
    setMembres(mb);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const u1 = base44.entities.FicheEleve.subscribe(() => load());
    const u2 = base44.entities.Diagnostic.subscribe(() => load());
    return () => { u1(); u2(); };
  }, []);

  const now = Date.now();
  const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0, 0, 0, 0);
  const thirtyDays = 30 * 24 * 3600 * 1000;

  const totalEleves = eleves.length;
  const diagsCeMois = diagnostics.filter(d => new Date(d.created_date) >= thisMonth).length;
  const elevesSansMAJ = eleves.filter(e => {
    const last = e.updated_date || e.created_date;
    return last && (now - new Date(last).getTime()) > thirtyDays;
  });
  const elevesClotured = elevesRased.filter(e => e.statut === 'Clôturé').length;

  const recentActivity = [...eleves]
    .sort((a, b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date))
    .slice(0, 6);

  const ecolesWithStats = ecoles.slice(0, 4).map(ec => {
    const ecEl = elevesRased.filter(e => e.ecole_id === ec.id);
    const alertes = ecEl.filter(e => {
      const d = e.date_derniere_action || e.created_date;
      return d && (now - new Date(d).getTime()) > thirtyDays;
    }).length;
    return { ...ec, nbEleves: ecEl.length, alertes };
  });

  const alertesEleves = elevesSansMAJ
    .sort((a, b) => new Date(a.updated_date || a.created_date) - new Date(b.updated_date || b.created_date))
    .slice(0, 5);

  const diagSearchFiltered = eleves.filter(e =>
    `${e.prenom} ${e.nom}`.toLowerCase().includes(diagSearch.toLowerCase()) ||
    e.ecole?.toLowerCase().includes(diagSearch.toLowerCase())
  );

  const prenomUser = user?.full_name?.split(' ')[0] || 'vous';
  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ME';
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const todayCap = today.charAt(0).toUpperCase() + today.slice(1);

  const navItems = [
    { label: 'Tableau de bord', ico: '🏠', to: '/dashboard', active: true, group: 'Principal' },
    { label: 'Mes écoles', ico: '🏫', to: '/mes-ecoles', group: 'Principal' },
    { label: 'Élèves suivis', ico: '👤', to: '/liste-eleves', group: 'Principal' },
    { label: 'Diagnostics EDA', ico: '🧠', to: '/historique', group: 'Principal' },
    { label: 'Importer PDF', ico: '📄', to: '/import-pdf', group: 'Gestion' },
    { label: 'Équipe RASED', ico: '👥', to: '/equipe-rased', group: 'Gestion' },
    { label: 'Statistiques', ico: '📊', to: '/stats-annuelles', group: 'Rapports' },
    { label: 'Export annuel', ico: '📥', to: '/export-annuel', group: 'Rapports' },
  ];

  const groups = ['Principal', 'Gestion', 'Rapports'];

  return (
    <>
      {/* Inject global styles to override BottomBar padding on this page */}
      <style>{`
        body { overflow: hidden; }
        #dashboard-root { position: fixed; inset: 0; display: flex; background: #F1F4F8; font-family: Inter, sans-serif; z-index: 100; }
        .db-sidebar { width: 220px; flex-shrink: 0; background: #1E3A5F; display: flex; flex-direction: column; height: 100%; overflow: hidden; }
        .db-main { flex: 1; display: flex; flex-direction: column; height: 100%; overflow: hidden; }
        .db-scroll { flex: 1; overflow-y: auto; padding: 26px 28px 40px; }
        @media(max-width:768px){ .db-sidebar{ display:none; } }
      `}</style>

      <div id="dashboard-root">
        {/* SIDEBAR */}
        <div className="db-sidebar">
          <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: '#fff', lineHeight: 1.2 }}>
              Arbre Décisionnel EDA
              <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>Psy-EN · RASED</span>
            </div>
          </div>

          <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
            {groups.map(group => (
              <div key={group}>
                <p style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', padding: '14px 8px 5px', fontWeight: 500 }}>{group}</p>
                {navItems.filter(n => n.group === group).map(item => (
                  <Link key={item.to} to={item.to}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 7,
                      fontSize: 13, color: item.active ? '#fff' : 'rgba(255,255,255,0.65)',
                      background: item.active ? '#4A90C4' : 'transparent',
                      fontWeight: item.active ? 500 : 400, marginBottom: 1,
                      textDecoration: 'none', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!item.active) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff'; } }}
                    onMouseLeave={e => { if (!item.active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; } }}
                  >
                    <span style={{ fontSize: 15, width: 18, textAlign: 'center', flexShrink: 0 }}>{item.ico}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#4A90C4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12.5, fontWeight: 500, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name || 'Utilisateur'}</p>
              <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)' }}>{membres.find(m => m.email === user?.email)?.profession || 'RASED'}</p>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="db-main">
          {/* TOPBAR */}
          <div style={{ background: '#fff', borderBottom: `1px solid ${S.bord}`, height: 56, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: S.texte }}>Bonjour, {prenomUser} 👋</p>
              <p style={{ fontSize: 12, color: S.doux }}>{todayCap}</p>
            </div>
            <button onClick={() => setShowDiagModal(true)}
              style={{ padding: '7px 15px', borderRadius: 8, fontSize: 12.5, fontWeight: 500, background: S.bleuCiel, color: '#fff', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = S.bleuMid}
              onMouseLeave={e => e.currentTarget.style.background = S.bleuCiel}>
              + Nouveau diagnostic
            </button>
          </div>

          {/* SCROLLABLE CONTENT */}
          <div className="db-scroll">

            {/* HERO */}
            <div style={{ background: S.bleu, borderRadius: 14, padding: '24px 28px', marginBottom: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, position: 'relative', overflow: 'hidden', flexWrap: 'wrap' }}>
              <div style={{ position: 'absolute', right: -40, top: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(74,144,196,0.15)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', right: 60, bottom: -80, width: 180, height: 180, borderRadius: '50%', background: 'rgba(74,144,196,0.08)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                  {ecoles.length > 0 ? `${ecoles.length} école${ecoles.length > 1 ? 's' : ''}` : 'RASED'}
                </p>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: '#fff', lineHeight: 1.2, marginBottom: 8 }}>
                  Vous suivez <em style={{ fontStyle: 'italic', color: '#93C5E8' }}>{loading ? '…' : totalEleves} élève{totalEleves !== 1 ? 's' : ''}</em><br />cette année scolaire.
                </p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                  {elevesSansMAJ.length > 0 ? `${elevesSansMAJ.length} élève${elevesSansMAJ.length > 1 ? 's' : ''} sans mise à jour depuis plus de 30 jours.` : 'Tous les dossiers sont à jour.'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
                {elevesSansMAJ.length > 0 && (
                  <Link to="/liste-eleves" style={{ padding: '10px 20px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: S.bleuCiel, color: '#fff', textDecoration: 'none' }}>Voir les alertes</Link>
                )}
                <Link to="/mes-ecoles" style={{ padding: '10px 20px', borderRadius: 9, fontSize: 13, fontWeight: 500, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.2)', textDecoration: 'none' }}>Mes écoles →</Link>
              </div>
            </div>

            {/* STAT CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}
              className="db-stats-grid">
              <style>{`.db-stats-grid { grid-template-columns: repeat(4,1fr); } @media(max-width:900px){.db-stats-grid{grid-template-columns:repeat(2,1fr);}}`}</style>
              {[
                { val: totalEleves, lbl: 'Élèves suivis', ico: '👤', bg: S.bleuPale, to: '/liste-eleves', warn: false },
                { val: diagsCeMois, lbl: 'Diagnostics ce mois', ico: '🧠', bg: S.vertPale, to: '/historique', warn: false },
                { val: elevesSansMAJ.length, lbl: 'Sans mise à jour +30j', ico: '⏰', bg: S.orangePale, to: '/liste-eleves', warn: true },
                { val: elevesClotured, lbl: 'Suivis clôturés', ico: '✅', bg: S.bleuPale, to: '/mes-ecoles', warn: false },
              ].map((c, i) => (
                <Link key={i} to={c.to} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#fff', border: `1px solid ${S.bord}`, borderRadius: 12, padding: '18px 20px', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'box-shadow 0.15s, transform 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 18px rgba(30,58,95,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}>
                    {(c.warn && c.val > 0) && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: S.orange, borderRadius: '12px 12px 0 0' }} />}
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 12 }}>{c.ico}</div>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: 32, color: c.warn && c.val > 0 ? S.orange : S.texte, lineHeight: 1, marginBottom: 3 }}>{loading ? '—' : c.val}</p>
                    <p style={{ fontSize: 12, color: S.doux }}>{c.lbl}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* ACCÈS RAPIDE */}
            <div style={{ display: 'grid', gap: 12, marginBottom: 24 }} className="db-quick-grid">
              <style>{`.db-quick-grid{grid-template-columns:repeat(4,1fr);}@media(max-width:900px){.db-quick-grid{grid-template-columns:repeat(2,1fr);}}`}</style>
              {[
                { ico: '🧠', label: 'Nouveau diagnostic EDA', sub: "Lancer l'arbre décisionnel", bg: S.bleuPale, action: () => setShowDiagModal(true) },
                { ico: '📄', label: 'Importer une liste PDF', sub: 'Créer des fiches depuis Onde', bg: '#F0EEFF', to: '/import-pdf' },
                { ico: '👤', label: 'Créer une fiche élève', sub: 'Saisie manuelle', bg: S.vertPale, to: '/fiche-eleve' },
                { ico: '📊', label: 'Export annuel', sub: 'Statistiques & rapport IEN', bg: S.orangePale, to: '/export-annuel' },
              ].map((c, i) => {
                const inner = (
                  <>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 8 }}>{c.ico}</div>
                    <p style={{ fontSize: 12.5, fontWeight: 600, color: S.texte, lineHeight: 1.3 }}>{c.label}</p>
                    <p style={{ fontSize: 11, color: S.doux, marginTop: 2 }}>{c.sub}</p>
                  </>
                );
                const cardStyle = { background: '#fff', border: `1px solid ${S.bord}`, borderRadius: 12, padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', transition: 'all 0.15s', textDecoration: 'none' };
                const onHoverIn = e => { e.currentTarget.style.borderColor = S.bleuCiel; e.currentTarget.style.boxShadow = '0 3px 14px rgba(74,144,196,0.12)'; };
                const onHoverOut = e => { e.currentTarget.style.borderColor = S.bord; e.currentTarget.style.boxShadow = ''; };
                return c.action
                  ? <button key={i} onClick={c.action} style={cardStyle} onMouseEnter={onHoverIn} onMouseLeave={onHoverOut}>{inner}</button>
                  : <Link key={i} to={c.to} style={cardStyle} onMouseEnter={onHoverIn} onMouseLeave={onHoverOut}>{inner}</Link>;
              })}
            </div>

            {/* TWO-COL */}
            <div style={{ display: 'grid', gap: 18, marginBottom: 18 }} className="db-twocol">
              <style>{`.db-twocol{grid-template-columns:1fr 340px;}@media(max-width:1000px){.db-twocol{grid-template-columns:1fr;}}`}</style>

              {/* ACTIVITÉ RÉCENTE */}
              <div style={{ background: '#fff', border: `1px solid ${S.bord}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${S.bord}` }}>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: S.texte }}>Activité récente</p>
                  <Link to="/historique" style={{ fontSize: 12, color: S.bleuCiel, textDecoration: 'none', fontWeight: 500 }}>Tout voir →</Link>
                </div>
                {recentActivity.length === 0
                  ? <p style={{ textAlign: 'center', padding: '40px 0', fontSize: 13, color: S.doux }}>Aucune activité</p>
                  : recentActivity.map((e, i) => {
                    const isNew = !e.updated_date || e.updated_date === e.created_date;
                    return (
                      <button key={e.id} onClick={() => navigate(`/detail-fiche?id=${e.id}`)}
                        style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 20px', borderBottom: i < recentActivity.length - 1 ? `1px solid ${S.ardoise}` : 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FAFCFF'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: isNew ? S.vertPale : S.bleuPale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginTop: 1 }}>
                          {isNew ? '👤' : '🧠'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: S.texte, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {isNew ? 'Fiche créée' : 'Fiche mise à jour'} — <strong style={{ color: S.bleuMid }}>{e.prenom} {e.nom}</strong>
                          </p>
                          <p style={{ fontSize: 11.5, color: S.doux }}>{[e.ecole, e.classe].filter(Boolean).join(' · ') || 'Fiche élève'}</p>
                        </div>
                        <p style={{ fontSize: 11, color: S.doux, flexShrink: 0, marginTop: 3 }}>{timeAgo(e.updated_date || e.created_date)}</p>
                      </button>
                    );
                  })}
              </div>

              {/* COLONNE DROITE */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* ALERTES */}
                <div style={{ background: '#fff', border: `1px solid ${S.bord}`, borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${S.bord}` }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: S.texte }}>⚠️ À relancer</p>
                    <Link to="/liste-eleves" style={{ fontSize: 12, color: S.bleuCiel, textDecoration: 'none', fontWeight: 500 }}>Voir tous →</Link>
                  </div>
                  {alertesEleves.length === 0
                    ? <p style={{ textAlign: 'center', padding: '30px 0', fontSize: 13, color: S.doux }}>✅ Aucune alerte</p>
                    : alertesEleves.map((e, i) => (
                      <button key={e.id} onClick={() => navigate(`/detail-fiche?id=${e.id}`)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', borderBottom: i < alertesEleves.length - 1 ? `1px solid ${S.ardoise}` : 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s' }}
                        onMouseEnter={ev => ev.currentTarget.style.background = '#FFFAF6'}
                        onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: S.orange, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 12.5, fontWeight: 500, color: S.texte }}>{e.prenom} {e.nom}</p>
                          <p style={{ fontSize: 11.5, color: S.doux, marginTop: 1 }}>{[e.classe, e.ecole].filter(Boolean).join(' · ') || '—'}</p>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: S.orange, background: S.orangePale, padding: '2px 8px', borderRadius: 10, flexShrink: 0 }}>+{daysSince(e.updated_date || e.created_date)}j</span>
                      </button>
                    ))}
                </div>

                {/* MES ÉCOLES */}
                <div style={{ background: '#fff', border: `1px solid ${S.bord}`, borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${S.bord}` }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: S.texte }}>Mes écoles</p>
                    <Link to="/mes-ecoles" style={{ fontSize: 12, color: S.bleuCiel, textDecoration: 'none', fontWeight: 500 }}>Gérer →</Link>
                  </div>
                  <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {ecolesWithStats.length === 0
                      ? <p style={{ textAlign: 'center', padding: '20px 0', fontSize: 13, color: S.doux }}><Link to="/mes-ecoles" style={{ color: S.bleuCiel }}>Ajouter une école →</Link></p>
                      : ecolesWithStats.map(ec => (
                        <button key={ec.id} onClick={() => navigate(`/detail-ecole?id=${ec.id}`)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px', borderRadius: 9, background: 'transparent', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'background 0.12s' }}
                          onMouseEnter={e => e.currentTarget.style.background = S.ardoise}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div style={{ width: 36, height: 36, borderRadius: 9, background: S.bleu, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>🏫</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12.5, fontWeight: 600, color: S.texte, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ec.nom}</p>
                            <p style={{ fontSize: 11, color: S.doux, marginTop: 1 }}>{ec.type || 'École'} · {ec.nbEleves} élève{ec.nbEleves !== 1 ? 's' : ''}</p>
                          </div>
                          <span style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 10, flexShrink: 0, background: ec.alertes > 0 ? S.orangePale : S.vertPale, color: ec.alertes > 0 ? S.orange : S.vert }}>
                            {ec.alertes > 0 ? `${ec.alertes} alerte${ec.alertes > 1 ? 's' : ''}` : 'À jour'}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ÉQUIPE RASED */}
            {membres.length > 0 && (
              <div style={{ background: '#fff', border: `1px solid ${S.bord}`, borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: S.doux, textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>Équipe RASED</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, flex: 1 }}>
                  {membres.map(m => {
                    const profColors = { 'Psy EN EDA': S.bleuCiel, 'MaDR': S.vert, 'MaDP': S.orange };
                    const bg = profColors[m.profession] || S.bleuCiel;
                    const init = `${m.prenom?.[0] || ''}${m.nom?.[0] || ''}`;
                    return (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 7, background: S.ardoise, border: `1px solid ${S.bord}`, borderRadius: 20, padding: '4px 12px 4px 5px' }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{init}</div>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 500, color: S.texte, lineHeight: 1 }}>{m.prenom} {m.nom}</p>
                          <p style={{ fontSize: 10, color: S.doux, lineHeight: 1, marginTop: 2 }}>{m.profession}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Link to="/invite-users" style={{ padding: '7px 15px', borderRadius: 8, fontSize: 12.5, fontWeight: 500, color: S.texte, border: `1px solid ${S.bord}`, textDecoration: 'none', flexShrink: 0 }}>+ Inviter un membre</Link>
              </div>
            )}

          </div>{/* /db-scroll */}
        </div>{/* /db-main */}
      </div>{/* /dashboard-root */}

      {/* Modal diagnostic */}
      <AnimatePresence>
        {showDiagModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={() => setShowDiagModal(false)}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440, maxHeight: '70vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${S.bord}` }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: S.texte }}>🧠 Choisir un élève</p>
                <button onClick={() => setShowDiagModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X className="w-4 h-4" /></button>
              </div>
              <div style={{ padding: '12px 16px 8px' }}>
                <div style={{ position: 'relative' }}>
                  <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9ca3af' }} />
                  <input autoFocus value={diagSearch} onChange={e => setDiagSearch(e.target.value)}
                    placeholder="Rechercher un élève..."
                    style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontSize: 14, border: `1px solid ${S.bord}`, borderRadius: 10, outline: 'none' }} />
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 12px' }}>
                {diagSearchFiltered.length === 0
                  ? <p style={{ textAlign: 'center', padding: '32px 0', fontSize: 13, color: S.doux }}>Aucun élève trouvé</p>
                  : diagSearchFiltered.slice(0, 20).map(e => (
                    <button key={e.id}
                      onClick={() => { setShowDiagModal(false); navigate(`/diagnostic-eleve?id=${e.id}`); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s' }}
                      onMouseEnter={ev => ev.currentTarget.style.background = S.ardoise}
                      onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: S.bleuCiel, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {e.prenom?.[0]}{e.nom?.[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: S.texte }}>{e.prenom} {e.nom}</p>
                        <p style={{ fontSize: 12, color: S.doux }}>{e.classe || ''}{e.ecole ? ` · ${e.ecole}` : ''}</p>
                      </div>
                      <Brain style={{ width: 16, height: 16, color: S.bleuCiel, flexShrink: 0 }} />
                    </button>
                  ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}