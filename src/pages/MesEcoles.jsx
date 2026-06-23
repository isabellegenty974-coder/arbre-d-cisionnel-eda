import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  School, Users, BarChart2, FileText, Bell,
  ChevronRight, Plus, AlertTriangle, CheckCircle,
  Home, Search, Phone, Mail, User, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddEcoleModal from '@/components/rased/AddEcoleModal';
import DeleteEcoleModal from '@/components/rased/DeleteEcoleModal';
import NotificationsBadge from '@/components/rased/NotificationsBadge';

const NAV_ITEMS = [
  { id: 'ecoles', label: 'Mes écoles', icon: School },
  { id: 'eleves', label: 'Élèves suivis', icon: Users },
  { id: 'diagnostics', label: 'Hypothèses de travail', icon: FileText },
  { id: 'membres', label: 'Membres RASED', icon: Users },
  { id: 'stats', label: 'Statistiques', icon: BarChart2 },
  { id: 'export', label: 'Export annuel', icon: FileText },
];

const PROF_CONFIG = {
  'Psy EN EDA': { color: '#8B5CF6', bg: '#F0EBFD', label: 'Psy-EN' },
  'MaDP': { color: '#4A90E2', bg: '#E8F0FB', label: 'Maître G' },
  'MaDR': { color: '#EC6B8A', bg: '#FCE8EE', label: 'Maître E' },
};

export default function MesEcoles() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('ecoles');
  const [ecoles, setEcoles] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddEcole, setShowAddEcole] = useState(false);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [ecoleToDelete, setEcoleToDelete] = useState(null);

  const canDelete = currentUser?.profession === 'Psy EN EDA' || currentUser?.role === 'admin';

  const load = async () => {
    const [e, el, m, u] = await Promise.all([
      base44.entities.EcoleRased.list('-created_date', 200).catch(() => []),
      base44.entities.EleveRased.list('-created_date', 500).catch(() => []),
      base44.entities.MembreEquipe.list('-created_date', 100).catch(() => []),
      base44.auth.me().catch(() => null),
    ]);
    setEcoles(e);
    setEleves(el);
    setMembres(m);
    setCurrentUser(u);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const isStale = (ecole) => {
    const elevesDEcole = eleves.filter(el => el.ecole_id === ecole.id);
    const last = elevesDEcole.reduce((latest, el) => {
      const d = el.date_derniere_action || el.created_date;
      return d > latest ? d : latest;
    }, ecole.created_date);
    if (!last) return false;
    return (Date.now() - new Date(last).getTime()) > 30 * 24 * 3600 * 1000;
  };

  const getEcoleStats = (ecoleId) => {
    const el = eleves.filter(e => e.ecole_id === ecoleId);
    return {
      total: el.length,
      actif: el.filter(e => e.statut === 'Suivi actif').length,
      attente: el.filter(e => e.statut === 'En attente').length,
      cloture: el.filter(e => e.statut === 'Clôturé').length,
    };
  };

  const totalSuivis = eleves.filter(e => e.statut === 'Suivi actif').length;
  const totalNouveaux = eleves.filter(e => e.statut === 'Nouveau').length;
  const totalClotured = eleves.filter(e => e.statut === 'Clôturé').length;
  const totalStale = ecoles.filter(isStale).length;

  const filteredEcoles = ecoles.filter(e =>
    e.nom?.toLowerCase().includes(search.toLowerCase()) ||
    e.commune?.toLowerCase().includes(search.toLowerCase())
  );

  const handleNavClick = (id) => {
    setActiveNav(id);
    setSidebarOpen(false);
    if (id === 'stats') navigate('/stats-annuelles');
    else if (id === 'export') navigate('/export-annuel');
    else if (id === 'membres') navigate('/equipe-rased');
    else if (id === 'diagnostics') navigate('/dashboard');
    else if (id === 'eleves') navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static top-0 left-0 h-full z-40 w-64 bg-[#0F172A] flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6] flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-white font-bold text-base">RASED</span>
          </div>
          <p className="text-white/50 text-xs">Tableau de bord</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNavClick(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeNav === id ? 'bg-[#3B82F6] text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all">
            <Home className="w-4 h-4" /> Accueil
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="font-bold text-[#0F172A] text-lg flex-1">Mes écoles</h1>
          <div className="flex items-center gap-2">
            <NotificationsBadge />
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une école..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
              />
            </div>
            <Button onClick={() => setShowAddEcole(true)} className="gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white">
              <Plus className="w-4 h-4" /> Ajouter une école
            </Button>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Stat cards */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Élèves suivis', value: totalSuivis, icon: Users, color: '#16a34a', bg: '#dcfce7' },
              { label: 'Nouveaux dossiers', value: totalNouveaux, icon: Plus, color: '#2563eb', bg: '#dbeafe' },
              { label: 'Sans MAJ +30j', value: totalStale, icon: AlertTriangle, color: totalStale > 0 ? '#d97706' : '#6b7280', bg: totalStale > 0 ? '#fef3c7' : '#f3f4f6' },
              { label: 'Clôturés', value: totalClotured, icon: CheckCircle, color: '#6b7280', bg: '#f3f4f6' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
              </div>
            ))}
          </motion.div>

          {/* Grille écoles */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : filteredEcoles.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
              <School className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Aucune école ajoutée</p>
              <p className="text-gray-400 text-sm mt-1 mb-6">Ajoutez une école manuellement ou importez-la depuis un PDF</p>
              <div className="flex justify-center gap-3 flex-wrap">
                <Button onClick={() => setShowAddEcole(true)} className="gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white">
                  <Plus className="w-4 h-4" /> Ajouter une école manuellement
                </Button>
                <Button onClick={() => navigate('/import-pdf')} variant="outline" className="gap-2 border-blue-300 text-blue-600 hover:bg-blue-50">
                  <FileText className="w-4 h-4" /> 📄 Importer depuis un PDF
                </Button>
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredEcoles.map((ecole, i) => {
                const stats = getEcoleStats(ecole.id);
                const stale = isStale(ecole);
                return (
                  <motion.div
                    key={ecole.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col relative"
                  >
                    {/* Bouton suppression — réservé Psy-EN EDA */}
                    {canDelete && (
                      <button
                        onClick={() => setEcoleToDelete(ecole)}
                        title="Supprimer cette école"
                        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center bg-white/80 border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0 pr-8">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-[#0F172A] truncate">{ecole.nom}</h3>
                            {stale && (
                              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                <AlertTriangle className="w-3 h-3" /> +30j
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {ecole.type && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{ecole.type}</span>}
                            {ecole.commune && <span className="text-xs text-gray-500">{ecole.commune}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Contact info */}
                      <div className="space-y-1">
                        {ecole.directeur && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">{ecole.directeur}</span>
                          </div>
                        )}
                        {ecole.telephone && (
                          <a
                            href={`tel:${ecole.telephone}`}
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <span>{ecole.telephone}</span>
                          </a>
                        )}
                        {ecole.email && (
                          <a
                            href={`mailto:${ecole.email}`}
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline truncate"
                          >
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{ecole.email}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="px-4 py-3 flex items-center justify-between gap-3">
                      <div className="flex gap-3">
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-600">{stats.actif}</p>
                          <p className="text-[10px] text-gray-500">Actifs</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-amber-600">{stats.attente}</p>
                          <p className="text-[10px] text-gray-500">Attente</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-400">{stats.cloture}</p>
                          <p className="text-[10px] text-gray-500">Clôturés</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#0F172A]">{stats.total}</p>
                        <p className="text-[10px] text-gray-500">élèves</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-4 pb-4 flex gap-2">
                      <button
                        onClick={() => navigate(`/import-pdf?ecoleId=${ecole.id}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 text-blue-600 text-xs font-semibold hover:bg-blue-50 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" /> Importer PDF
                      </button>
                      <button
                        onClick={() => navigate(`/detail-ecole?id=${ecole.id}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-[#1e293b] transition-colors"
                      >
                        Voir les classes <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </main>

      <AddEcoleModal
        open={showAddEcole}
        onClose={() => setShowAddEcole(false)}
        membres={membres}
        onSaved={() => { setShowAddEcole(false); load(); }}
      />

      {ecoleToDelete && (
        <DeleteEcoleModal
          ecole={ecoleToDelete}
          eleveCount={getEcoleStats(ecoleToDelete.id).total}
          onClose={() => setEcoleToDelete(null)}
          onDeleted={() => {
            setEcoleToDelete(null);
            load();
          }}
        />
      )}
    </div>
  );
}