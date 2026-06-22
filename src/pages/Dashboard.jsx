import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Brain } from 'lucide-react';

/* ── Helpers ──────────────────────────────────────────── */
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

/* ── Nav items ───────────────────────────────────────── */
const NAV = [
  { g: 'Principal', label: 'Tableau de bord', ico: '🏠', to: '/dashboard', active: true },
  { g: 'Principal', label: 'Mes écoles',        ico: '🏫', to: '/mes-ecoles' },
  { g: 'Principal', label: 'Élèves suivis',      ico: '👤', to: '/liste-eleves' },
  { g: 'Principal', label: 'Diagnostics EDA',    ico: '🧠', to: '/historique' },
  { g: 'Gestion',   label: 'Importer PDF',       ico: '📄', to: '/import-pdf' },
  { g: 'Gestion',   label: 'Équipe RASED',       ico: '👥', to: '/equipe-rased' },
  { g: 'Rapports',  label: 'Statistiques',       ico: '📊', to: '/stats-annuelles' },
  { g: 'Rapports',  label: 'Export annuel',      ico: '📥', to: '/export-annuel' },
];

/* ── Main component ──────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser]           = useState(null);
  const [fiches, setFiches]       = useState([]);
  const [diags, setDiags]         = useState([]);
  const [ecoles, setEcoles]       = useState([]);
  const [elevesR, setElevesR]     = useState([]);
  const [membres, setMembres]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [diagModal, setDiagModal] = useState(false);
  const [search, setSearch]       = useState('');

  useEffect(() => {
    async function load() {
      const [u, f, d, ec, el, mb] = await Promise.all([
        base44.auth.me().catch(() => null),
        base44.entities.FicheEleve.list('-updated_date', 200).catch(() => []),
        base44.entities.Diagnostic.list('-created_date', 200).catch(() => []),
        base44.entities.EcoleRased.list('-created_date', 100).catch(() => []),
        base44.entities.EleveRased.list('-created_date', 500).catch(() => []),
        base44.entities.MembreEquipe.list('-created_date', 100).catch(() => []),
      ]);
      setUser(u); setFiches(f); setDiags(d);
      setEcoles(ec); setElevesR(el); setMembres(mb);
      setLoading(false);
    }
    load();
  }, []);

  /* ── Computed stats ─────────────────────────────────── */
  const now        = Date.now();
  const startMonth = new Date(); startMonth.setDate(1); startMonth.setHours(0,0,0,0);
  const MS30       = 30 * 86400000;

  const totalEleves    = fiches.length;
  const diagsCeMois    = diags.filter(d => new Date(d.created_date) >= startMonth).length;
  const alertesFiches  = fiches.filter(e => (now - new Date(e.updated_date || e.created_date).getTime()) > MS30);
  const elevesClotured = elevesR.filter(e => e.statut === 'Clôturé').length;

  const recentActivity = [...fiches]
    .sort((a, b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date))
    .slice(0, 6);

  const ecolesStats = ecoles.slice(0, 4).map(ec => {
    const nbEl  = elevesR.filter(e => e.ecole_id === ec.id).length;
    const nbAl  = elevesR.filter(e => e.ecole_id === ec.id && (now - new Date(e.date_derniere_action || e.created_date).getTime()) > MS30).length;
    return { ...ec, nbEl, nbAl };
  });

  const alertes5 = alertesFiches
    .sort((a, b) => new Date(a.updated_date || a.created_date) - new Date(b.updated_date || b.created_date))
    .slice(0, 5);

  const searchRes = fiches.filter(e =>
    `${e.prenom} ${e.nom}`.toLowerCase().includes(search.toLowerCase()) ||
    (e.ecole || '').toLowerCase().includes(search.toLowerCase())
  );

  /* ── User display ───────────────────────────────────── */
  const prenom  = user?.full_name?.split(' ')[0] || 'vous';
  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()
    : 'ME';
  const todayStr = new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const today   = todayStr.charAt(0).toUpperCase() + todayStr.slice(1);

  const profColor = { 'Psy EN EDA':'#4A90C4', 'MaDR':'#276749', 'MaDP':'#C05621' };

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap');
        #db-root {
          position: fixed; inset: 0; display: flex;
          background: #F1F4F8; font-family: Inter, sans-serif;
          z-index: 100; overflow: hidden;
        }
        #db-sidebar {
          width: 220px; flex-shrink: 0; background: #1E3A5F;
          display: flex; flex-direction: column; height: 100%; overflow: hidden;
        }
        #db-main { flex: 1; display: flex; flex-direction: column; height: 100%; overflow: hidden; min-width: 0; }
        #db-scroll { flex: 1; overflow-y: auto; padding: 26px 28px 60px; }
        .nav-link { display:flex; align-items:center; gap:9px; padding:8px 10px; border-radius:7px;
          font-size:13px; color:rgba(255,255,255,.65); cursor:pointer; margin-bottom:1px;
          text-decoration:none; transition:background .15s, color .15s; }
        .nav-link:hover { background:rgba(255,255,255,.07); color:#fff; }
        .nav-link.active { background:#4A90C4; color:#fff; font-weight:500; }
        .stat-card { background:#fff; border:1px solid #DDE4EE; border-radius:12px; padding:18px 20px;
          cursor:pointer; transition:box-shadow .15s, transform .15s; position:relative; overflow:hidden; text-decoration:none; display:block; }
        .stat-card:hover { box-shadow:0 4px 18px rgba(30,58,95,.08); transform:translateY(-1px); }
        .stat-card::after { content:''; position:absolute; top:0; left:0; right:0; height:3px;
          border-radius:12px 12px 0 0; background:#4A90C4; opacity:0; transition:opacity .15s; }
        .stat-card:hover::after { opacity:1; }
        .stat-card.warn::after { background:#C05621; opacity:1; }
        .quick-card { background:#fff; border:1px solid #DDE4EE; border-radius:12px; padding:16px;
          cursor:pointer; transition:all .15s; display:flex; flex-direction:column; align-items:flex-start; gap:8px;
          text-decoration:none; }
        .quick-card:hover { border-color:#4A90C4; box-shadow:0 3px 14px rgba(74,144,196,.12); }
        .act-row { width:100%; display:flex; align-items:flex-start; gap:12px; padding:12px 20px;
          border:none; background:transparent; cursor:pointer; text-align:left; transition:background .12s; }
        .act-row:hover { background:#FAFCFF; }
        .al-row { width:100%; display:flex; align-items:center; gap:12px; padding:11px 20px;
          border:none; background:transparent; cursor:pointer; text-align:left; transition:background .12s; }
        .al-row:hover { background:#FFFAF6; }
        .ec-row { width:100%; display:flex; align-items:center; gap:10px; padding:10px;
          border-radius:9px; border:none; background:transparent; cursor:pointer; text-align:left; transition:background .12s; }
        .ec-row:hover { background:#F1F4F8; }
        .db-grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:24px; }
        .db-two-col { display:grid; grid-template-columns:1fr 340px; gap:18px; margin-bottom:18px; }
        @media(max-width:1100px){
          .db-grid-4 { grid-template-columns:repeat(2,1fr); }
          .db-two-col { grid-template-columns:1fr; }
        }
        @media(max-width:768px){ #db-sidebar { display:none; } }
      `}</style>

      <div id="db-root">
        {/* ── SIDEBAR ── */}
        <div id="db-sidebar">
          {/* Logo */}
          <div style={{ padding:'22px 18px 18px', borderBottom:'1px solid rgba(255,255,255,.08)' }}>
            <p style={{ fontFamily:'DM Serif Display, serif', fontSize:16, color:'#fff', lineHeight:1.2 }}>
              Arbre Décisionnel EDA
            </p>
            <p style={{ fontFamily:'Inter,sans-serif', fontSize:10, fontWeight:500, letterSpacing:'0.1em',
              textTransform:'uppercase', color:'rgba(255,255,255,.4)', marginTop:3 }}>Psy-EN · RASED</p>
          </div>

          {/* Nav */}
          <nav style={{ flex:1, padding:'14px 10px', overflowY:'auto' }}>
            {['Principal','Gestion','Rapports'].map(g => (
              <div key={g}>
                <p style={{ fontSize:9.5, textTransform:'uppercase', letterSpacing:'0.1em',
                  color:'rgba(255,255,255,.3)', padding:'14px 8px 5px', fontWeight:500 }}>{g}</p>
                {NAV.filter(n => n.g === g).map(n => (
                  <Link key={n.to} to={n.to} className={`nav-link${n.active ? ' active' : ''}`}>
                    <span style={{ fontSize:15, width:18, textAlign:'center', flexShrink:0 }}>{n.ico}</span>
                    {n.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          {/* User */}
          <div style={{ padding:'14px 16px', borderTop:'1px solid rgba(255,255,255,.08)',
            display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'#4A90C4',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>{initials}</div>
            <div style={{ minWidth:0 }}>
              <p style={{ fontSize:12.5, fontWeight:500, color:'#fff',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {user?.full_name || 'Utilisateur'}
              </p>
              <p style={{ fontSize:10.5, color:'rgba(255,255,255,.4)' }}>
                {membres.find(m => m.email === user?.email)?.profession || 'RASED'}
              </p>
            </div>
          </div>
        </div>

        {/* ── MAIN ── */}
        <div id="db-main">
          {/* Topbar */}
          <div style={{ background:'#fff', borderBottom:'1px solid #DDE4EE', height:56,
            padding:'0 28px', display:'flex', alignItems:'center',
            justifyContent:'space-between', flexShrink:0 }}>
            <div>
              <p style={{ fontSize:13.5, fontWeight:600, color:'#1A2E45' }}>Bonjour, {prenom} 👋</p>
              <p style={{ fontSize:12, color:'#5A6E87' }}>{today} · Année scolaire {anneeScolaire()}</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {/* Cloche */}
              <div style={{ position:'relative', width:34, height:34, borderRadius:8,
                background:'#F1F4F8', border:'1px solid #DDE4EE',
                display:'flex', alignItems:'center', justifyContent:'center',
                cursor:'pointer', fontSize:16 }}>
                🔔
                <span style={{ position:'absolute', top:6, right:6, width:7, height:7,
                  borderRadius:'50%', background:'#C05621', border:'1.5px solid #fff' }} />
              </div>
              <button onClick={() => setDiagModal(true)}
                style={{ padding:'7px 16px', borderRadius:8, fontSize:12.5, fontWeight:500,
                  background:'#4A90C4', color:'#fff', border:'none', cursor:'pointer' }}>
                + Nouveau diagnostic
              </button>
            </div>
          </div>

          {/* Scroll */}
          <div id="db-scroll">

            {/* ── HERO ── */}
            <div style={{ background:'#1E3A5F', borderRadius:14, padding:'24px 28px',
              marginBottom:22, display:'flex', alignItems:'center',
              justifyContent:'space-between', gap:16, position:'relative',
              overflow:'hidden', flexWrap:'wrap' }}>
              {/* Orbs déco */}
              <div style={{ position:'absolute', right:-40, top:-60, width:260, height:260,
                borderRadius:'50%', background:'rgba(74,144,196,.15)', pointerEvents:'none' }} />
              <div style={{ position:'absolute', right:60, bottom:-80, width:180, height:180,
                borderRadius:'50%', background:'rgba(74,144,196,.08)', pointerEvents:'none' }} />

              <div style={{ position:'relative', zIndex:1 }}>
                <p style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em',
                  color:'rgba(255,255,255,.5)', marginBottom:6 }}>
                  {ecoles.length > 0 ? `${ecoles.length} école${ecoles.length > 1 ? 's' : ''}` : 'RASED'}
                </p>
                <p style={{ fontFamily:'DM Serif Display, serif', fontSize:26, color:'#fff',
                  lineHeight:1.2, marginBottom:8 }}>
                  Vous suivez{' '}
                  <em style={{ fontStyle:'italic', color:'#93C5E8' }}>
                    {loading ? '…' : totalEleves} élève{totalEleves !== 1 ? 's' : ''}
                  </em><br />cette année scolaire.
                </p>
                <p style={{ fontSize:13, color:'rgba(255,255,255,.6)' }}>
                  {alertesFiches.length > 0
                    ? `${alertesFiches.length} élève${alertesFiches.length > 1 ? 's' : ''} sans mise à jour depuis plus de 30 jours.`
                    : 'Tous les dossiers sont à jour.'}
                </p>
              </div>

              <div style={{ display:'flex', gap:10, position:'relative', zIndex:1, flexWrap:'wrap' }}>
                <Link to="/liste-eleves"
                  style={{ padding:'10px 20px', borderRadius:9, fontSize:13, fontWeight:600,
                    background:'#4A90C4', color:'#fff', textDecoration:'none' }}>
                  Voir les alertes
                </Link>
                <Link to="/mes-ecoles"
                  style={{ padding:'10px 20px', borderRadius:9, fontSize:13, fontWeight:500,
                    background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.85)',
                    border:'1px solid rgba(255,255,255,.2)', textDecoration:'none' }}>
                  Mes écoles →
                </Link>
              </div>
            </div>

            {/* ── STAT CARDS ── */}
            <div className="db-grid-4">
              {[
                { val: totalEleves,          lbl:'Élèves suivis',           ico:'👤', bg:'#EBF4FB', to:'/liste-eleves',    warn:false, trend:'↑ depuis septembre' },
                { val: diagsCeMois,          lbl:'Diagnostics ce mois',     ico:'🧠', bg:'#E6F4ED', to:'/historique',      warn:false, trend:'Ce mois-ci' },
                { val: alertesFiches.length, lbl:'Sans mise à jour +30j',   ico:'⏰', bg:'#FEF0E6', to:'/liste-eleves',   warn:true,  trend:'À relancer' },
                { val: elevesClotured,       lbl:'Suivis clôturés',         ico:'✅', bg:'#EBF4FB', to:'/mes-ecoles',     warn:false, trend:'depuis septembre' },
              ].map((c, i) => (
                <Link key={i} to={c.to} className={`stat-card${c.warn ? ' warn' : ''}`}>
                  <div style={{ width:36, height:36, borderRadius:9, background:c.bg,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:18, marginBottom:12 }}>{c.ico}</div>
                  <p style={{ fontFamily:'DM Serif Display, serif', fontSize:32, lineHeight:1,
                    color: c.warn && c.val > 0 ? '#C05621' : '#1A2E45', marginBottom:3 }}>
                    {loading ? '—' : c.val}
                  </p>
                  <p style={{ fontSize:12, color:'#5A6E87', marginBottom:10 }}>{c.lbl}</p>
                  <p style={{ fontSize:11, color: c.warn ? '#C05621' : '#276749', fontWeight:500 }}>{c.trend}</p>
                </Link>
              ))}
            </div>

            {/* ── RACCOURCIS ── */}
            <div className="db-grid-4">
              {[
                { ico:'🧠', label:'Nouveau diagnostic EDA', sub:"Lancer l'arbre décisionnel",  bg:'#EBF4FB', action:() => setDiagModal(true) },
                { ico:'📄', label:'Importer une liste PDF',  sub:'Créer des fiches depuis Onde', bg:'#F0EEFF', to:'/import-pdf' },
                { ico:'👤', label:'Créer une fiche élève',   sub:'Saisie manuelle',              bg:'#E6F4ED', to:'/fiche-eleve' },
                { ico:'📊', label:'Export annuel',           sub:'Statistiques & rapport IEN',   bg:'#FEF0E6', to:'/export-annuel' },
              ].map((c, i) => {
                const inner = (
                  <>
                    <div style={{ width:40, height:40, borderRadius:10, background:c.bg,
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{c.ico}</div>
                    <p style={{ fontSize:12.5, fontWeight:600, color:'#1A2E45', lineHeight:1.3 }}>{c.label}</p>
                    <p style={{ fontSize:11, color:'#5A6E87', marginTop:-4 }}>{c.sub}</p>
                  </>
                );
                return c.action
                  ? <button key={i} onClick={c.action} className="quick-card" style={{ border:'1px solid #DDE4EE' }}>{inner}</button>
                  : <Link key={i} to={c.to} className="quick-card">{inner}</Link>;
              })}
            </div>

            {/* ── DEUX COLONNES ── */}
            <div className="db-two-col">

              {/* Activité récente */}
              <div style={{ background:'#fff', border:'1px solid #DDE4EE', borderRadius:12, overflow:'hidden' }}>
                <div style={{ padding:'16px 20px', display:'flex', alignItems:'center',
                  justifyContent:'space-between', borderBottom:'1px solid #DDE4EE' }}>
                  <p style={{ fontSize:13.5, fontWeight:600, color:'#1A2E45' }}>Activité récente</p>
                  <Link to="/historique" style={{ fontSize:12, color:'#4A90C4', textDecoration:'none', fontWeight:500 }}>Tout voir →</Link>
                </div>
                {recentActivity.length === 0
                  ? <p style={{ textAlign:'center', padding:'40px 0', fontSize:13, color:'#5A6E87' }}>Aucune activité récente</p>
                  : recentActivity.map((e, i) => {
                    const isNew = e.updated_date === e.created_date || !e.updated_date;
                    const avBg  = isNew ? '#E6F4ED' : '#EBF4FB';
                    const avIco = isNew ? '👤' : '🧠';
                    return (
                      <button key={e.id} className="act-row"
                        onClick={() => navigate(`/detail-fiche?id=${e.id}`)}
                        style={{ borderBottom: i < recentActivity.length-1 ? '1px solid #F1F4F8' : 'none' }}>
                        <div style={{ width:34, height:34, borderRadius:'50%', background:avBg,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:14, flexShrink:0, marginTop:1 }}>{avIco}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:13, fontWeight:500, color:'#1A2E45', marginBottom:2,
                            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {isNew ? 'Fiche créée' : 'Fiche mise à jour'} —{' '}
                            <strong style={{ color:'#2C5282' }}>{e.prenom} {e.nom}</strong>
                          </p>
                          <p style={{ fontSize:11.5, color:'#5A6E87' }}>
                            {[e.ecole, e.classe].filter(Boolean).join(' · ') || 'Fiche élève'}
                          </p>
                        </div>
                        <p style={{ fontSize:11, color:'#5A6E87', flexShrink:0, marginTop:3 }}>
                          {timeAgo(e.updated_date || e.created_date)}
                        </p>
                      </button>
                    );
                  })}
              </div>

              {/* Colonne droite */}
              <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

                {/* À relancer */}
                <div style={{ background:'#fff', border:'1px solid #DDE4EE', borderRadius:12, overflow:'hidden' }}>
                  <div style={{ padding:'16px 20px', display:'flex', alignItems:'center',
                    justifyContent:'space-between', borderBottom:'1px solid #DDE4EE' }}>
                    <p style={{ fontSize:13.5, fontWeight:600, color:'#1A2E45' }}>⚠️ À relancer</p>
                    <Link to="/liste-eleves" style={{ fontSize:12, color:'#4A90C4', textDecoration:'none', fontWeight:500 }}>Voir tous →</Link>
                  </div>
                  {alertes5.length === 0
                    ? <p style={{ textAlign:'center', padding:'28px 0', fontSize:13, color:'#5A6E87' }}>✅ Aucune alerte</p>
                    : alertes5.map((e, i) => (
                      <button key={e.id} className="al-row"
                        onClick={() => navigate(`/detail-fiche?id=${e.id}`)}
                        style={{ borderBottom: i < alertes5.length-1 ? '1px solid #F1F4F8' : 'none' }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:'#C05621', flexShrink:0 }} />
                        <div style={{ flex:1 }}>
                          <p style={{ fontSize:12.5, fontWeight:500, color:'#1A2E45' }}>{e.prenom} {e.nom}</p>
                          <p style={{ fontSize:11.5, color:'#5A6E87', marginTop:1 }}>
                            {[e.classe, e.ecole].filter(Boolean).join(' · ') || '—'}
                          </p>
                        </div>
                        <span style={{ fontSize:11, fontWeight:600, color:'#C05621',
                          background:'#FEF0E6', padding:'2px 8px', borderRadius:10, flexShrink:0 }}>
                          +{daysSince(e.updated_date || e.created_date)}j
                        </span>
                      </button>
                    ))}
                </div>

                {/* Mes écoles */}
                <div style={{ background:'#fff', border:'1px solid #DDE4EE', borderRadius:12, overflow:'hidden' }}>
                  <div style={{ padding:'16px 20px', display:'flex', alignItems:'center',
                    justifyContent:'space-between', borderBottom:'1px solid #DDE4EE' }}>
                    <p style={{ fontSize:13.5, fontWeight:600, color:'#1A2E45' }}>Mes écoles</p>
                    <Link to="/mes-ecoles" style={{ fontSize:12, color:'#4A90C4', textDecoration:'none', fontWeight:500 }}>Gérer →</Link>
                  </div>
                  <div style={{ padding:'8px 12px', display:'flex', flexDirection:'column', gap:4 }}>
                    {ecolesStats.length === 0
                      ? <p style={{ textAlign:'center', padding:'20px 0', fontSize:13, color:'#5A6E87' }}>
                          <Link to="/mes-ecoles" style={{ color:'#4A90C4' }}>Ajouter une école →</Link>
                        </p>
                      : ecolesStats.map(ec => (
                        <button key={ec.id} className="ec-row"
                          onClick={() => navigate(`/detail-ecole?id=${ec.id}`)}>
                          <div style={{ width:36, height:36, borderRadius:9, background:'#1E3A5F',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:17, flexShrink:0 }}>🏫</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:12.5, fontWeight:600, color:'#1A2E45',
                              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ec.nom}</p>
                            <p style={{ fontSize:11, color:'#5A6E87', marginTop:1 }}>
                              {ec.type || 'École'} · {ec.nbEl} élève{ec.nbEl !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <span style={{ fontSize:10.5, fontWeight:600, padding:'2px 8px', borderRadius:10, flexShrink:0,
                            background: ec.nbAl > 0 ? '#FEF0E6' : '#E6F4ED',
                            color: ec.nbAl > 0 ? '#C05621' : '#276749' }}>
                            {ec.nbAl > 0 ? `${ec.nbAl} alerte${ec.nbAl > 1 ? 's' : ''}` : 'À jour'}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── ÉQUIPE RASED ── */}
            {membres.length > 0 && (
              <div style={{ background:'#fff', border:'1px solid #DDE4EE', borderRadius:12,
                padding:'16px 20px', display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                <p style={{ fontSize:12, fontWeight:600, color:'#5A6E87',
                  textTransform:'uppercase', letterSpacing:'0.06em', flexShrink:0 }}>Équipe RASED</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:10, flex:1 }}>
                  {membres.map(m => {
                    const bg   = profColor[m.profession] || '#4A90C4';
                    const init = `${m.prenom?.[0] || ''}${m.nom?.[0] || ''}`;
                    return (
                      <div key={m.id} style={{ display:'flex', alignItems:'center', gap:7,
                        background:'#F1F4F8', border:'1px solid #DDE4EE',
                        borderRadius:20, padding:'4px 12px 4px 5px' }}>
                        <div style={{ width:24, height:24, borderRadius:'50%', background:bg,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:10, fontWeight:700, color:'#fff', flexShrink:0 }}>{init}</div>
                        <div>
                          <p style={{ fontSize:12, fontWeight:500, color:'#1A2E45', lineHeight:1 }}>
                            {m.prenom} {m.nom}
                          </p>
                          <p style={{ fontSize:10, color:'#5A6E87', lineHeight:1, marginTop:2 }}>{m.profession}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Link to="/invite-users"
                  style={{ padding:'7px 15px', borderRadius:8, fontSize:12.5, fontWeight:500,
                    color:'#1A2E45', border:'1px solid #DDE4EE', textDecoration:'none', flexShrink:0,
                    background:'#fff' }}>
                  + Inviter un membre
                </Link>
              </div>
            )}

          </div>{/* /db-scroll */}
        </div>{/* /db-main */}
      </div>{/* /db-root */}

      {/* ── MODAL DIAGNOSTIC ── */}
      <AnimatePresence>
        {diagModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,.5)',
              display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
            onClick={() => setDiagModal(false)}>
            <motion.div initial={{ y:40, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:40, opacity:0 }}
              onClick={e => e.stopPropagation()}
              style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:440,
                maxHeight:'70vh', display:'flex', flexDirection:'column', overflow:'hidden',
                boxShadow:'0 20px 60px rgba(0,0,0,.15)', fontFamily:'Inter,sans-serif' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'16px 20px', borderBottom:'1px solid #DDE4EE' }}>
                <p style={{ fontWeight:600, fontSize:14, color:'#1A2E45' }}>🧠 Choisir un élève</p>
                <button onClick={() => setDiagModal(false)}
                  style={{ background:'none', border:'none', cursor:'pointer', padding:4 }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div style={{ padding:'12px 16px 8px' }}>
                <div style={{ position:'relative' }}>
                  <Search style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)',
                    width:16, height:16, color:'#9ca3af' }} />
                  <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher un élève..."
                    style={{ width:'100%', paddingLeft:36, paddingRight:12, paddingTop:8,
                      paddingBottom:8, fontSize:14, border:'1px solid #DDE4EE',
                      borderRadius:10, outline:'none', fontFamily:'Inter,sans-serif' }} />
                </div>
              </div>
              <div style={{ flex:1, overflowY:'auto', padding:'4px 8px 12px' }}>
                {searchRes.length === 0
                  ? <p style={{ textAlign:'center', padding:'32px 0', fontSize:13, color:'#5A6E87' }}>Aucun élève trouvé</p>
                  : searchRes.slice(0, 20).map(e => (
                    <button key={e.id}
                      onClick={() => { setDiagModal(false); navigate(`/diagnostic-eleve?id=${e.id}`); }}
                      style={{ width:'100%', display:'flex', alignItems:'center', gap:12,
                        padding:'10px 12px', borderRadius:10, background:'transparent',
                        border:'none', cursor:'pointer', textAlign:'left', transition:'background .12s' }}
                      onMouseEnter={ev => ev.currentTarget.style.background = '#F1F4F8'}
                      onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                      <div style={{ width:36, height:36, borderRadius:'50%', background:'#4A90C4',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>
                        {e.prenom?.[0]}{e.nom?.[0]}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:14, fontWeight:600, color:'#1A2E45' }}>{e.prenom} {e.nom}</p>
                        <p style={{ fontSize:12, color:'#5A6E87' }}>{e.classe || ''}{e.ecole ? ` · ${e.ecole}` : ''}</p>
                      </div>
                      <Brain style={{ width:16, height:16, color:'#4A90C4', flexShrink:0 }} />
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