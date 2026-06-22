import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Search, Brain } from 'lucide-react';

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

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [fiches, setFiches] = useState([]);
  const [diags, setDiags] = useState([]);
  const [ecoles, setEcoles] = useState([]);
  const [elevesR, setElevesR] = useState([]);
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [diagModal, setDiagModal] = useState(false);
  const [search, setSearch] = useState('');

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

  const now = Date.now();
  const startMonth = new Date(); startMonth.setDate(1); startMonth.setHours(0, 0, 0, 0);
  const MS30 = 30 * 86400000;

  const totalEleves = fiches.length;
  const diagsCeMois = diags.filter(d => new Date(d.created_date) >= startMonth).length;
  const alertesFiches = fiches.filter(e => (now - new Date(e.updated_date || e.created_date).getTime()) > MS30);
  const elevesClotured = elevesR.filter(e => e.statut === 'Clôturé').length;

  const recentActivity = [...fiches]
    .sort((a, b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date))
    .slice(0, 6);

  const alertes5 = alertesFiches
    .sort((a, b) => new Date(a.updated_date || a.created_date) - new Date(b.updated_date || b.created_date))
    .slice(0, 5);

  const ecolesStats = ecoles.map(ec => {
    const nbEl = elevesR.filter(e => e.ecole_id === ec.id).length;
    const nbAl = elevesR.filter(e => e.ecole_id === ec.id && (now - new Date(e.date_derniere_action || e.created_date).getTime()) > MS30).length;
    return { ...ec, nbEl, nbAl };
  });

  const searchRes = fiches.filter(e =>
    `${e.prenom} ${e.nom}`.toLowerCase().includes(search.toLowerCase()) ||
    (e.ecole || '').toLowerCase().includes(search.toLowerCase())
  );

  const prenom = user?.full_name?.split(' ')[0] || 'vous';
  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ME';
  const todayStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const today = todayStr.charAt(0).toUpperCase() + todayStr.slice(1);
  const profColor = { 'Psy EN EDA': '#4A90C4', 'MaDR': '#276749', 'MaDP': '#C05621' };

  return (
    <div style={{ minHeight: '100vh', background: '#F1F4F8', fontFamily: 'Inter, sans-serif', paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap');
        .db-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; }
        .db-stat-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 18px; cursor: pointer; transition: box-shadow .15s; text-decoration: none; display: block; }
        .db-stat-card:hover { box-shadow: 0 4px 18px rgba(0,0,0,.08); }
        .db-stat-card.warn { border-top: 3px solid #C05621; }
        .db-quick-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 18px; cursor: pointer; transition: all .15s; display: flex; flex-direction: column; gap: 10px; text-decoration: none; border: none; text-align: left; width: 100%; }
        .db-quick-card:hover { box-shadow: 0 4px 18px rgba(0,0,0,.08); }
        .db-row { display: flex; align-items: center; gap: 12px; padding: 13px 16px; border: none; background: transparent; cursor: pointer; text-align: left; width: 100%; transition: background .12s; }
        .db-row:hover { background: #F8FAFC; }
      `}</style>

      {/* TOPBAR */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#1A2E45' }}>Bonjour, {prenom} 👋</p>
          <p style={{ fontSize: 11.5, color: '#64748B' }}>{today} · Année scolaire {anneeScolaire()}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#F1F4F8', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18, position: 'relative' }}>
            🔔
            <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: '50%', background: '#C05621', border: '1.5px solid #fff' }} />
          </div>
          <button onClick={() => setDiagModal(true)}
            style={{ padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: '#4A90C4', color: '#fff', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            + Nouveau diagnostic
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* HERO */}
        <div style={{ background: '#1E3A5F', borderRadius: 20, padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -40, top: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(74,144,196,.12)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 50, bottom: -80, width: 160, height: 160, borderRadius: '50%', background: 'rgba(74,144,196,.07)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, position: 'relative', zIndex: 1 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,.45)', marginBottom: 10 }}>
                RASED · Année scolaire {anneeScolaire()}
              </p>
              <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: 30, color: '#fff', lineHeight: 1.2, marginBottom: 14 }}>
                Vous suivez{' '}
                <span style={{ color: '#93C5E8' }}>{loading ? '…' : totalEleves} élève{totalEleves !== 1 ? 's' : ''}</span>
                {'\n'}cette année scolaire.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {alertesFiches.length > 0 ? (
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', lineHeight: 1.4 }}>
                    <strong style={{ color: '#FDB97D' }}>{alertesFiches.length} élève{alertesFiches.length > 1 ? 's' : ''}</strong>
                    {' '}n'ont pas eu de mise à jour depuis plus de 30 jours.
                  </p>
                ) : (
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,.65)' }}>✅ Tous les dossiers sont à jour.</p>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
              <Link to="/liste-eleves" style={{ display: 'block', padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600, background: '#4A90C4', color: '#fff', textDecoration: 'none', textAlign: 'center', boxShadow: '0 4px 14px rgba(74,144,196,.35)' }}>
                Voir les alertes
              </Link>
              <Link to="/mes-ecoles" style={{ display: 'block', padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 500, background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.85)', border: '1px solid rgba(255,255,255,.2)', textDecoration: 'none', textAlign: 'center' }}>
                Mes écoles →
              </Link>
            </div>
          </div>
        </div>

        {/* STAT CARDS — grille 2x2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { val: totalEleves, lbl: 'Élèves suivis', ico: '👤', bg: '#EBF4FB', sub: '↑ depuis septembre', subColor: '#276749', to: '/liste-eleves', warn: false },
            { val: diagsCeMois, lbl: 'Diagnostics ce mois', ico: '🧠', bg: '#E6F4ED', sub: '↑ vs mois dernier', subColor: '#276749', to: '/historique', warn: false },
            { val: alertesFiches.length, lbl: 'Sans mise à jour +30j', ico: '⏰', bg: '#FEF0E6', sub: 'À relancer', subColor: '#C05621', to: '/liste-eleves', warn: true },
            { val: elevesClotured, lbl: 'Suivis clôturés', ico: '✅', bg: '#EBF4FB', sub: 'depuis septembre', subColor: '#276749', to: '/mes-ecoles', warn: false },
          ].map((c, i) => (
            <Link key={i} to={c.to} className={`db-stat-card${c.warn ? ' warn' : ''}`}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 12 }}>{c.ico}</div>
              <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: 34, lineHeight: 1, color: c.warn && c.val > 0 ? '#C05621' : '#1A2E45', marginBottom: 4 }}>
                {loading ? '—' : c.val}
              </p>
              <p style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>{c.lbl}</p>
              <p style={{ fontSize: 11.5, color: c.subColor, fontWeight: 500 }}>{c.sub}</p>
            </Link>
          ))}
        </div>

        {/* RACCOURCIS — grille 2x2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { ico: '🧠', label: 'Nouveau diagnostic EDA', sub: "Lancer l'arbre décisionnel", bg: '#EBF4FB', action: () => setDiagModal(true) },
            { ico: '📄', label: 'Importer une liste PDF', sub: 'Créer des fiches depuis Onde', bg: '#F0EEFF', to: '/import-pdf' },
            { ico: '👤', label: 'Créer une fiche élève', sub: 'Saisie manuelle', bg: '#E6F4ED', to: '/fiche-eleve' },
            { ico: '📊', label: 'Export annuel', sub: 'Statistiques & rapport IEN', bg: '#FEF0E6', to: '/export-annuel' },
          ].map((c, i) => {
            const inner = (
              <>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{c.ico}</div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1A2E45', lineHeight: 1.3 }}>{c.label}</p>
                <p style={{ fontSize: 11.5, color: '#64748B' }}>{c.sub}</p>
              </>
            );
            return c.action
              ? <button key={i} onClick={c.action} className="db-quick-card" style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 18 }}>{inner}</button>
              : <Link key={i} to={c.to} className="db-quick-card" style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 18 }}>{inner}</Link>;
          })}
        </div>

        {/* ACTIVITÉ RÉCENTE */}
        <div className="db-card">
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F4F8' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1A2E45' }}>Activité récente</p>
            <Link to="/historique" style={{ fontSize: 12.5, color: '#4A90C4', textDecoration: 'none', fontWeight: 500 }}>Tout voir →</Link>
          </div>
          {recentActivity.length === 0
            ? <p style={{ textAlign: 'center', padding: '32px 0', fontSize: 13, color: '#64748B' }}>Aucune activité récente</p>
            : recentActivity.map((e, i) => {
              const isNew = !e.updated_date || e.updated_date === e.created_date;
              return (
                <button key={e.id} className="db-row" onClick={() => navigate(`/detail-fiche?id=${e.id}`)}
                  style={{ borderBottom: i < recentActivity.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: isNew ? '#E6F4ED' : '#EBF4FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                    {isNew ? '👤' : '🧠'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#1A2E45', marginBottom: 2 }}>
                      {isNew ? 'Fiche créée' : 'Fiche mise à jour'} — <strong style={{ color: '#2C5282' }}>{e.prenom} {e.nom}</strong>
                    </p>
                    <p style={{ fontSize: 11.5, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {[e.classe, e.ecole].filter(Boolean).join(' · ') || 'Fiche élève'}
                    </p>
                  </div>
                  <p style={{ fontSize: 11, color: '#94A3B8', flexShrink: 0, marginLeft: 8 }}>{timeAgo(e.updated_date || e.created_date)}</p>
                </button>
              );
            })}
        </div>

        {/* À RELANCER */}
        <div className="db-card">
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F4F8' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1A2E45' }}>⚠️ À relancer</p>
            <Link to="/liste-eleves" style={{ fontSize: 12.5, color: '#4A90C4', textDecoration: 'none', fontWeight: 500 }}>Voir tous →</Link>
          </div>
          {alertes5.length === 0
            ? <p style={{ textAlign: 'center', padding: '28px 0', fontSize: 13, color: '#64748B' }}>✅ Aucune alerte</p>
            : alertes5.map((e, i) => (
              <button key={e.id} className="db-row" onClick={() => navigate(`/detail-fiche?id=${e.id}`)}
                style={{ borderBottom: i < alertes5.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C05621', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1A2E45' }}>{e.prenom} {e.nom}</p>
                  <p style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>{[e.classe, e.ecole].filter(Boolean).join(' · ') || '—'}</p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#C05621', background: '#FEF0E6', padding: '3px 10px', borderRadius: 20, flexShrink: 0 }}>
                  +{daysSince(e.updated_date || e.created_date)}j
                </span>
              </button>
            ))}
        </div>

        {/* MES ÉCOLES */}
        <div className="db-card">
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F4F8' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1A2E45' }}>Mes écoles</p>
            <Link to="/mes-ecoles" style={{ fontSize: 12.5, color: '#4A90C4', textDecoration: 'none', fontWeight: 500 }}>Gérer →</Link>
          </div>
          {ecolesStats.length === 0
            ? <p style={{ textAlign: 'center', padding: '28px 0', fontSize: 13, color: '#64748B' }}>
                <Link to="/mes-ecoles" style={{ color: '#4A90C4' }}>Ajouter une école →</Link>
              </p>
            : ecolesStats.map((ec, i) => (
              <button key={ec.id} className="db-row" onClick={() => navigate(`/detail-ecole?id=${ec.id}`)}
                style={{ borderBottom: i < ecolesStats.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: '#1E3A5F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🏫</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1A2E45', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ec.nom}</p>
                  <p style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>{ec.type || 'École'} · {ec.nbEl} élève{ec.nbEl !== 1 ? 's' : ''} suivi{ec.nbEl !== 1 ? 's' : ''}</p>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 20, flexShrink: 0, background: ec.nbAl > 0 ? '#FEF0E6' : '#E6F4ED', color: ec.nbAl > 0 ? '#C05621' : '#276749' }}>
                  {ec.nbAl > 0 ? `${ec.nbAl} alerte${ec.nbAl > 1 ? 's' : ''}` : 'À jour'}
                </span>
              </button>
            ))}
        </div>

        {/* ÉQUIPE RASED */}
        {membres.length > 0 && (
          <div className="db-card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Équipe RASED</p>
              <Link to="/invite-users" style={{ fontSize: 12.5, color: '#4A90C4', textDecoration: 'none', fontWeight: 500, border: '1px solid #E2E8F0', borderRadius: 8, padding: '4px 10px' }}>+ Inviter un membre</Link>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {membres.map(m => {
                const bg = profColor[m.profession] || '#4A90C4';
                const init = `${m.prenom?.[0] || ''}${m.nom?.[0] || ''}`;
                return (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 72 }}>
                    <div style={{ width: 46, height: 46, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>{init}</div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 11.5, fontWeight: 600, color: '#1A2E45', lineHeight: 1.2 }}>{m.prenom} {m.nom}</p>
                      <p style={{ fontSize: 10, color: '#64748B', lineHeight: 1.3, marginTop: 2 }}>{m.profession}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* MODAL DIAGNOSTIC */}
      <AnimatePresence>
        {diagModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 0 }}
            onClick={() => setDiagModal(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 640, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 -8px 40px rgba(0,0,0,.15)' }}>
              <div style={{ width: 36, height: 4, background: '#E2E8F0', borderRadius: 2, margin: '12px auto 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 10px', borderBottom: '1px solid #F1F4F8' }}>
                <p style={{ fontWeight: 600, fontSize: 15, color: '#1A2E45' }}>🧠 Choisir un élève</p>
                <button onClick={() => setDiagModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X className="w-4 h-4" /></button>
              </div>
              <div style={{ padding: '10px 14px 6px' }}>
                <div style={{ position: 'relative' }}>
                  <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94A3B8' }} />
                  <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un élève..."
                    style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10, fontSize: 14, border: '1px solid #E2E8F0', borderRadius: 12, outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 20px' }}>
                {searchRes.length === 0
                  ? <p style={{ textAlign: 'center', padding: '32px 0', fontSize: 13, color: '#64748B' }}>Aucun élève trouvé</p>
                  : searchRes.slice(0, 20).map(e => (
                    <button key={e.id} onClick={() => { setDiagModal(false); navigate(`/diagnostic-eleve?id=${e.id}`); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background .12s' }}
                      onMouseEnter={ev => ev.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#4A90C4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {e.prenom?.[0]}{e.nom?.[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#1A2E45' }}>{e.prenom} {e.nom}</p>
                        <p style={{ fontSize: 12, color: '#64748B' }}>{e.classe || ''}{e.ecole ? ` · ${e.ecole}` : ''}</p>
                      </div>
                      <Brain style={{ width: 16, height: 16, color: '#4A90C4', flexShrink: 0 }} />
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