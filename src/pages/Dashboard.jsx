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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    const unsubFiche = base44.entities.FicheEleve.subscribe(() => load());
    const unsubDiag = base44.entities.Diagnostic.subscribe(() => load());
    return () => { unsubFiche(); unsubDiag(); };
  }, []);

  // Stats
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

  // Activité récente (dernières fiches mises à jour)
  const recentActivity = [...eleves]
    .sort((a, b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date))
    .slice(0, 6);

  // Écoles avec stats alertes
  const ecolesWithStats = ecoles.slice(0, 4).map(ec => {
    const ecEl = elevesRased.filter(e => e.ecole_id === ec.id);
    const alertes = ecEl.filter(e => {
      const d = e.date_derniere_action || e.created_date;
      return d && (now - new Date(d).getTime()) > thirtyDays;
    }).length;
    return { ...ec, nbEleves: ecEl.length, alertes };
  });

  // Alertes : élèves FicheEleve sans MAJ depuis 30j
  const alertesEleves = elevesSansMAJ
    .sort((a, b) => new Date(a.updated_date || a.created_date) - new Date(b.updated_date || b.created_date))
    .slice(0, 5);

  const diagSearchFiltered = eleves.filter(e =>
    `${e.prenom} ${e.nom}`.toLowerCase().includes(diagSearch.toLowerCase()) ||
    e.ecole?.toLowerCase().includes(diagSearch.toLowerCase())
  );

  const prenomUser = user?.full_name?.split(' ')[0] || 'Vous';
  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ME';

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const todayCap = today.charAt(0).toUpperCase() + today.slice(1);

  const NAV = [
    { label: 'Tableau de bord', ico: '🏠', to: '/dashboard', active: true },
    { label: 'Mes écoles', ico: '🏫', to: '/mes-ecoles' },
    { label: 'Élèves suivis', ico: '👤', to: '/liste-eleves' },
    { label: 'Diagnostics EDA', ico: '🧠', to: '/historique' },
  ];
  const NAV2 = [
    { label: 'Importer PDF', ico: '📄', to: '/import-pdf' },
    { label: 'Équipe RASED', ico: '👥', to: '/equipe-rased' },
    { label: 'Statistiques', ico: '📊', to: '/stats-annuelles' },
    { label: 'Export annuel', ico: '📥', to: '/export-annuel' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#F1F4F8', color: '#1A2E45', fontFamily: 'Inter, sans-serif' }}>

      {/* Sidebar overlay mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ width: 220, background: '#1E3A5F' }}>
        <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: '#fff', lineHeight: 1.2 }}>
            Arbre Décisionnel EDA
            <span className="block mt-1" style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
              Psy-EN · RASED
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-3">
          <p className="px-2 py-2 text-[9.5px] uppercase tracking-widest font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>Principal</p>
          {NAV.map(item => (
            <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5 text-[13px] transition-all"
              style={item.active
                ? { background: '#4A90C4', color: '#fff', fontWeight: 500 }
                : { color: 'rgba(255,255,255,0.65)' }}
              onMouseEnter={e => { if (!item.active) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { if (!item.active) { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; } }}
            >
              <span className="text-[15px] w-[18px] text-center shrink-0">{item.ico}</span>
              {item.label}
            </Link>
          ))}
          <p className="px-2 pt-3 pb-1.5 text-[9.5px] uppercase tracking-widest font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>Gestion</p>
          {NAV2.map(item => (
            <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5 text-[13px] transition-all"
              style={{ color: 'rgba(255,255,255,0.65)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
            >
              <span className="text-[15px] w-[18px] text-center shrink-0">{item.ico}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-3.5 flex items-center gap-2.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: '#4A90C4' }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[12.5px] font-medium text-white truncate">{user?.full_name || 'Utilisateur'}</p>
            <p className="text-[10.5px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{membres.find(m => m.email === user?.email)?.profession || 'RASED'}</p>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-[220px]" id="main-content">
        <style>{`#main-content{margin-left:0}@media(min-width:1024px){#main-content{margin-left:220px}}`}</style>

        {/* TOPBAR */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-7 border-b" style={{ background: '#fff', borderColor: '#DDE4EE', height: 56 }}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div>
              <p className="font-semibold text-[13.5px]" style={{ color: '#1A2E45' }}>Bonjour, {prenomUser} 👋</p>
              <p className="text-[12px]" style={{ color: '#5A6E87' }}>{todayCap}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowDiagModal(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12.5px] font-medium text-white transition-colors"
              style={{ background: '#4A90C4' }}
              onMouseEnter={e => e.currentTarget.style.background = '#2C5282'}
              onMouseLeave={e => e.currentTarget.style.background = '#4A90C4'}
            >
              + Nouveau diagnostic
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto" style={{ padding: '26px 28px 40px' }}>

          {/* HERO */}
          <div className="relative rounded-[14px] overflow-hidden mb-6 flex items-center justify-between flex-wrap gap-4" style={{ background: '#1E3A5F', padding: '24px 28px' }}>
            <div className="absolute" style={{ right: -40, top: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(74,144,196,0.15)', pointerEvents: 'none' }} />
            <div className="absolute" style={{ right: 60, bottom: -80, width: 180, height: 180, borderRadius: '50%', background: 'rgba(74,144,196,0.08)', pointerEvents: 'none' }} />
            <div className="relative z-10">
              <p className="text-[11px] uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {ecoles.length > 0 ? `${ecoles.length} école${ecoles.length > 1 ? 's' : ''}` : 'RASED'}
              </p>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: '#fff', lineHeight: 1.2, marginBottom: 8 }}>
                Vous suivez <em style={{ fontStyle: 'italic', color: '#93C5E8' }}>{loading ? '…' : totalEleves} élève{totalEleves > 1 ? 's' : ''}</em><br />
                cette année scolaire.
              </p>
              <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {elevesSansMAJ.length > 0
                  ? `${elevesSansMAJ.length} élève${elevesSansMAJ.length > 1 ? 's' : ''} sans mise à jour depuis plus de 30 jours.`
                  : 'Tous les dossiers sont à jour.'}
              </p>
            </div>
            <div className="flex gap-2.5 relative z-10 flex-wrap">
              {elevesSansMAJ.length > 0 && (
                <Link to="/dashboard"
                  className="px-5 py-2.5 rounded-[9px] text-[13px] font-semibold text-white transition-colors"
                  style={{ background: '#4A90C4' }}>
                  Voir les alertes
                </Link>
              )}
              <Link to="/mes-ecoles"
                className="px-5 py-2.5 rounded-[9px] text-[13px] font-medium transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.2)' }}>
                Mes écoles →
              </Link>
            </div>
          </div>

          {/* STAT CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
            {[
              { val: totalEleves, lbl: 'Élèves suivis', ico: '👤', colorClass: 'bleu', to: '/liste-eleves', warn: false },
              { val: diagsCeMois, lbl: 'Diagnostics ce mois', ico: '🧠', colorClass: 'vert', to: '/historique', warn: false },
              { val: elevesSansMAJ.length, lbl: 'Sans mise à jour +30j', ico: '⏰', colorClass: 'orange', to: '/dashboard', warn: true },
              { val: elevesClotured, lbl: 'Suivis clôturés', ico: '✅', colorClass: 'bleu', to: '/mes-ecoles', warn: false },
            ].map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={card.to} className="block rounded-[12px] border p-[18px_20px] cursor-pointer transition-all hover:shadow-md hover:-translate-y-px relative overflow-hidden group"
                  style={{ background: '#fff', borderColor: '#DDE4EE' }}>
                  {card.warn && card.val > 0 && (
                    <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[12px]" style={{ background: '#C05621' }} />
                  )}
                  <div className="w-9 h-9 rounded-[9px] flex items-center justify-center text-lg mb-3"
                    style={{ background: card.warn ? '#FEF0E6' : card.colorClass === 'vert' ? '#E6F4ED' : '#EBF4FB' }}>
                    {card.ico}
                  </div>
                  <p className="text-[32px] leading-none mb-1 font-semibold" style={{ fontFamily: 'Georgia, serif', color: card.warn && card.val > 0 ? '#C05621' : '#1A2E45' }}>
                    {loading ? '—' : card.val}
                  </p>
                  <p className="text-[12px] mb-2.5" style={{ color: '#5A6E87' }}>{card.lbl}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* ACCÈS RAPIDE */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { ico: '🧠', label: 'Nouveau diagnostic EDA', sub: "Lancer l'arbre décisionnel", bg: '#EBF4FB', action: () => setShowDiagModal(true) },
              { ico: '📄', label: 'Importer une liste PDF', sub: 'Créer des fiches depuis Onde', bg: '#F0EEFF', to: '/import-pdf' },
              { ico: '👤', label: 'Créer une fiche élève', sub: 'Saisie manuelle', bg: '#E6F4ED', to: '/fiche-eleve' },
              { ico: '📊', label: 'Export annuel', sub: 'Statistiques & rapport IEN', bg: '#FEF0E6', to: '/export-annuel' },
            ].map((card, i) => {
              const inner = (
                <>
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl mb-2.5" style={{ background: card.bg }}>{card.ico}</div>
                  <p className="text-[12.5px] font-semibold leading-snug" style={{ color: '#1A2E45' }}>{card.label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#5A6E87' }}>{card.sub}</p>
                </>
              );
              return card.action ? (
                <button key={i} onClick={card.action}
                  className="flex flex-col items-start p-4 rounded-[12px] border text-left transition-all hover:border-[#4A90C4] hover:shadow-md"
                  style={{ background: '#fff', borderColor: '#DDE4EE' }}>
                  {inner}
                </button>
              ) : (
                <Link key={i} to={card.to}
                  className="flex flex-col items-start p-4 rounded-[12px] border transition-all hover:border-[#4A90C4] hover:shadow-md"
                  style={{ background: '#fff', borderColor: '#DDE4EE' }}>
                  {inner}
                </Link>
              );
            })}
          </div>

          {/* TWO COL */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4.5 mb-4" style={{ gap: 18 }}>

            {/* ACTIVITÉ RÉCENTE */}
            <div className="rounded-[12px] border overflow-hidden" style={{ background: '#fff', borderColor: '#DDE4EE' }}>
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#DDE4EE' }}>
                <p className="font-semibold text-[13.5px]" style={{ color: '#1A2E45' }}>Activité récente</p>
                <Link to="/historique" className="text-[12px] font-medium hover:underline" style={{ color: '#4A90C4' }}>Tout voir →</Link>
              </div>
              {recentActivity.length === 0 ? (
                <p className="text-center py-10 text-[13px]" style={{ color: '#5A6E87' }}>Aucune activité récente</p>
              ) : recentActivity.map((e, i) => {
                const isNew = !e.updated_date || e.updated_date === e.created_date;
                const ico = isNew ? '👤' : '🧠';
                const avBg = isNew ? '#E6F4ED' : '#EBF4FB';
                return (
                  <button key={e.id} onClick={() => navigate(`/detail-fiche?id=${e.id}`)}
                    className="w-full flex items-start gap-3 px-5 py-3 border-b text-left transition-colors hover:bg-[#FAFCFF]"
                    style={{ borderColor: '#F1F4F8' }}>
                    <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[14px] shrink-0 mt-0.5" style={{ background: avBg }}>{ico}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate" style={{ color: '#1A2E45' }}>
                        {isNew ? 'Fiche créée' : 'Fiche mise à jour'} — <strong style={{ color: '#2C5282' }}>{e.prenom} {e.nom}</strong>
                      </p>
                      <p className="text-[11.5px] mt-0.5" style={{ color: '#5A6E87' }}>
                        {[e.ecole, e.classe].filter(Boolean).join(' · ') || 'Fiche élève'}
                      </p>
                    </div>
                    <p className="text-[11px] shrink-0 mt-0.5" style={{ color: '#5A6E87' }}>{timeAgo(e.updated_date || e.created_date)}</p>
                  </button>
                );
              })}
            </div>

            {/* COL DROITE */}
            <div className="flex flex-col gap-4">

              {/* ALERTES */}
              <div className="rounded-[12px] border overflow-hidden" style={{ background: '#fff', borderColor: '#DDE4EE' }}>
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#DDE4EE' }}>
                  <p className="font-semibold text-[13.5px]" style={{ color: '#1A2E45' }}>⚠️ À relancer</p>
                  <Link to="/liste-eleves" className="text-[12px] font-medium hover:underline" style={{ color: '#4A90C4' }}>Voir tous →</Link>
                </div>
                {alertesEleves.length === 0 ? (
                  <p className="text-center py-8 text-[13px]" style={{ color: '#5A6E87' }}>✅ Aucune alerte</p>
                ) : alertesEleves.map(e => (
                  <button key={e.id} onClick={() => navigate(`/detail-fiche?id=${e.id}`)}
                    className="w-full flex items-center gap-3 px-5 py-2.5 border-b text-left transition-colors hover:bg-[#FFFAF6]"
                    style={{ borderColor: '#F1F4F8' }}>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: '#C05621' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium" style={{ color: '#1A2E45' }}>{e.prenom} {e.nom}</p>
                      <p className="text-[11.5px] mt-0.5" style={{ color: '#5A6E87' }}>{[e.classe, e.ecole].filter(Boolean).join(' · ') || '—'}</p>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-[10px] shrink-0"
                      style={{ background: '#FEF0E6', color: '#C05621' }}>
                      +{daysSince(e.updated_date || e.created_date)}j
                    </span>
                  </button>
                ))}
              </div>

              {/* MES ÉCOLES */}
              <div className="rounded-[12px] border overflow-hidden" style={{ background: '#fff', borderColor: '#DDE4EE' }}>
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#DDE4EE' }}>
                  <p className="font-semibold text-[13.5px]" style={{ color: '#1A2E45' }}>Mes écoles</p>
                  <Link to="/mes-ecoles" className="text-[12px] font-medium hover:underline" style={{ color: '#4A90C4' }}>Gérer →</Link>
                </div>
                {ecolesWithStats.length === 0 ? (
                  <p className="text-center py-8 text-[13px]" style={{ color: '#5A6E87' }}>
                    <Link to="/mes-ecoles" className="hover:underline" style={{ color: '#4A90C4' }}>Ajouter une école →</Link>
                  </p>
                ) : (
                  <div className="px-3 py-2 flex flex-col gap-1.5">
                    {ecolesWithStats.map(ec => (
                      <button key={ec.id} onClick={() => navigate(`/detail-ecole?id=${ec.id}`)}
                        className="flex items-center gap-3 px-2.5 py-2.5 rounded-[9px] text-left transition-colors hover:bg-[#F1F4F8] w-full">
                        <div className="w-9 h-9 rounded-[9px] flex items-center justify-center text-[17px] shrink-0" style={{ background: '#1E3A5F' }}>🏫</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12.5px] font-semibold truncate" style={{ color: '#1A2E45' }}>{ec.nom}</p>
                          <p className="text-[11px] mt-0.5" style={{ color: '#5A6E87' }}>{ec.type || 'École'} · {ec.nbEleves} élève{ec.nbEleves > 1 ? 's' : ''}</p>
                        </div>
                        {ec.alertes > 0 ? (
                          <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-[10px] shrink-0" style={{ background: '#FEF0E6', color: '#C05621' }}>{ec.alertes} alerte{ec.alertes > 1 ? 's' : ''}</span>
                        ) : (
                          <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-[10px] shrink-0" style={{ background: '#E6F4ED', color: '#276749' }}>À jour</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ÉQUIPE RASED */}
          {membres.length > 0 && (
            <div className="rounded-[12px] border flex items-center gap-4 flex-wrap" style={{ background: '#fff', borderColor: '#DDE4EE', padding: '16px 20px' }}>
              <p className="text-[12px] font-semibold uppercase tracking-wider shrink-0" style={{ color: '#5A6E87' }}>Équipe RASED</p>
              <div className="flex flex-wrap gap-2.5 flex-1">
                {membres.map(m => {
                  const colors = { 'Psy EN EDA': '#4A90C4', 'MaDR': '#276749', 'MaDP': '#C05621' };
                  const bg = colors[m.profession] || '#4A90C4';
                  const init = `${m.prenom?.[0] || ''}${m.nom?.[0] || ''}`;
                  return (
                    <div key={m.id} className="flex items-center gap-1.5 rounded-[20px] border px-3 py-1" style={{ background: '#F1F4F8', borderColor: '#DDE4EE' }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: bg }}>{init}</div>
                      <div>
                        <p className="text-[12px] font-medium leading-none" style={{ color: '#1A2E45' }}>{m.prenom} {m.nom}</p>
                        <p className="text-[10px] leading-none mt-0.5" style={{ color: '#5A6E87' }}>{m.profession}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link to="/invite-users"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border text-[12.5px] font-medium transition-colors hover:bg-[#F1F4F8] shrink-0"
                style={{ color: '#1A2E45', borderColor: '#DDE4EE' }}>
                + Inviter un membre
              </Link>
            </div>
          )}

        </div>
      </div>

      {/* Modal diagnostic */}
      <AnimatePresence>
        {showDiagModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowDiagModal(false)}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md max-h-[70vh] flex flex-col shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#DDE4EE' }}>
                <h2 className="font-semibold text-[14px]" style={{ color: '#1A2E45' }}>🧠 Choisir un élève</h2>
                <button onClick={() => setShowDiagModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
              </div>
              <div className="px-4 pt-3 pb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input autoFocus value={diagSearch} onChange={e => setDiagSearch(e.target.value)}
                    placeholder="Rechercher un élève..."
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border focus:outline-none"
                    style={{ borderColor: '#DDE4EE' }} />
                </div>
              </div>
              <div className="overflow-y-auto flex-1 px-2 pb-3">
                {diagSearchFiltered.length === 0 ? (
                  <p className="text-center text-sm py-8" style={{ color: '#5A6E87' }}>Aucun élève trouvé</p>
                ) : diagSearchFiltered.slice(0, 20).map(e => (
                  <button key={e.id}
                    onClick={() => { setShowDiagModal(false); navigate(`/diagnostic-eleve?id=${e.id}`); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left hover:bg-[#F1F4F8]">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: '#4A90C4' }}>
                      {e.prenom?.[0]}{e.nom?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: '#1A2E45' }}>{e.prenom} {e.nom}</p>
                      <p className="text-xs" style={{ color: '#5A6E87' }}>{e.classe || ''}{e.ecole ? ` · ${e.ecole}` : ''}</p>
                    </div>
                    <Brain className="w-4 h-4 shrink-0" style={{ color: '#4A90C4' }} />
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