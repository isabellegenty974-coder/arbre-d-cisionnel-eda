import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ScreenLayout from '@/components/tree/ScreenLayout';
import { Plus, Search, TrendingUp, Users, FileText, AlertTriangle, Activity, Brain, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';

const ITEMS_PER_PAGE = 10;

export default function Dashboard() {
  const navigate = useNavigate();
  const [eleves, setEleves] = useState([]);
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showDiagModal, setShowDiagModal] = useState(false);
  const [diagSearch, setDiagSearch] = useState('');

  const loadEleves = async () => {
    const [fiches, diags] = await Promise.all([
      base44.entities.FicheEleve.list('-updated_date', 200).catch(() => []),
      base44.entities.Diagnostic.list('-created_date', 200).catch(() => [])
    ]);
    setEleves(fiches.filter(f => f.id));
    setDiagnostics(diags);
    setLoading(false);
  };

  useEffect(() => {
    loadEleves();
    const unsubFiche = base44.entities.FicheEleve.subscribe(() => loadEleves());
    const unsubDiag = base44.entities.Diagnostic.subscribe(() => loadEleves());
    return () => { unsubFiche(); unsubDiag(); };
  }, []);

  const handleDelete = async (fiche) => {
    if (window.confirm('Supprimer cette fiche élève ? Tous les diagnostics liés seront aussi supprimés.')) {
      const allDiagnostics = await base44.entities.Diagnostic.list('-created_date', 500).catch(() => []);
      const diagnosticsToDelete = allDiagnostics.filter(
        d => d.eleve_nom?.toLowerCase() === fiche.nom?.toLowerCase() &&
             d.eleve_prenom?.toLowerCase() === fiche.prenom?.toLowerCase()
      );
      for (const diag of diagnosticsToDelete) {
        await base44.entities.Diagnostic.delete(diag.id).catch(() => {});
      }
      await base44.entities.FicheEleve.delete(fiche.id);
      await loadEleves();
    }
  };

  const getLastDiagnostic = (prenom, nom) => {
    return diagnostics.find(
      d => d.eleve_prenom?.toLowerCase() === prenom?.toLowerCase() &&
           d.eleve_nom?.toLowerCase() === nom?.toLowerCase()
    );
  };

  // Stats
  const now = Date.now();
  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0,0,0,0);

  const totalEleves = eleves.length;
  const diagsCeMois = diagnostics.filter(d => new Date(d.created_date) >= thisMonth).length;
  const elevesSansMAJ = eleves.filter(e => {
    const last = e.updated_date || e.created_date;
    return last && (now - new Date(last).getTime()) > 30 * 24 * 3600 * 1000;
  }).length;
  const elevesActifs = eleves.filter(e => {
    const lastDiag = getLastDiagnostic(e.prenom, e.nom);
    return lastDiag && new Date(lastDiag.created_date) >= thirtyDaysAgo;
  }).length;

  // Activité récente : 5 dernières fiches modifiées
  const recentActivity = [...eleves]
    .sort((a, b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date))
    .slice(0, 5);

  const filtered = eleves.filter(e => {
    const nameMatch = `${e.prenom} ${e.nom}`.toLowerCase().includes(searchTerm.toLowerCase());
    const classMatch = !classFilter || e.classe === classFilter;
    let domainMatch = true;
    if (domainFilter) {
      const lastDiag = getLastDiagnostic(e.prenom, e.nom);
      if (lastDiag?.selections?.scores) {
        const scores = lastDiag.selections.scores;
        const threshold = 3;
        if (domainFilter === 'apprentissages' && scores.apprentissages >= threshold) domainMatch = false;
        if (domainFilter === 'comportement' && scores.comportement >= threshold) domainMatch = false;
        if (domainFilter === 'developpement' && scores.developpement >= threshold) domainMatch = false;
        if (domainFilter === 'contexte' && scores.contexte >= threshold) domainMatch = false;
      } else {
        domainMatch = false;
      }
    }
    return nameMatch && classMatch && domainMatch;
  });

  const uniqueClasses = [...new Set(eleves.map(e => e.classe).filter(Boolean))].sort();
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedEleves = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const diagSearchFiltered = eleves.filter(e =>
    `${e.prenom} ${e.nom}`.toLowerCase().includes(diagSearch.toLowerCase()) ||
    e.ecole?.toLowerCase().includes(diagSearch.toLowerCase())
  );

  const statCards = [
    { label: 'Élèves suivis', value: totalEleves, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', link: '/liste-eleves' },
    { label: 'Diagnostics ce mois', value: diagsCeMois, icon: FileText, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', link: '/historique' },
    { label: 'Sans MAJ +30j', value: elevesSansMAJ, icon: AlertTriangle, color: elevesSansMAJ > 0 ? 'text-orange-600' : 'text-gray-400', bg: elevesSansMAJ > 0 ? 'bg-orange-50' : 'bg-gray-50', border: elevesSansMAJ > 0 ? 'border-orange-200' : 'border-gray-200', link: '/dashboard' },
    { label: 'Suivis actifs (30j)', value: elevesActifs, icon: Activity, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', link: '/liste-eleves' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <HamburgerMenu />
      <ScreenLayout title="📊 Tableau de bord" subtitle="Vue d'ensemble de vos suivis">
        <div className="space-y-6">

          {/* 4 cartes stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={card.link} className={`block p-4 rounded-2xl border ${card.bg} ${card.border} hover:shadow-md transition-shadow`}>
                  <card.icon className={`w-5 h-5 mb-2 ${card.color}`} />
                  <p className={`text-2xl font-bold ${card.color}`}>{loading ? '—' : card.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium leading-tight">{card.label}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Raccourci nouveau diagnostic */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <button
              onClick={() => setShowDiagModal(true)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#D4A574]/10 to-[#D4A574]/5 border-2 border-dashed border-[#D4A574]/40 hover:border-[#D4A574] hover:from-[#D4A574]/15 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-[#D4A574] flex items-center justify-center shrink-0">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[#0F172A] text-sm">Nouveau diagnostic EDA</p>
                <p className="text-xs text-muted-foreground">Sélectionner un élève et démarrer l'arbre décisionnel</p>
              </div>
              <Plus className="w-5 h-5 text-[#D4A574] ml-auto shrink-0" />
            </button>
          </motion.div>

          {/* Activité récente */}
          {recentActivity.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-2xl border border-[#D4A574]/20 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Activité récente</p>
              <div className="space-y-2">
                {recentActivity.map((e, i) => {
                  const lastDiag = getLastDiagnostic(e.prenom, e.nom);
                  const date = new Date(e.updated_date || e.created_date);
                  const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
                  return (
                    <button
                      key={e.id}
                      onClick={() => navigate(`/detail-fiche?id=${e.id}`)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F5F0E8] transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#D4A574]/15 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-[#D4A574]">{e.prenom?.[0]}{e.nom?.[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0F172A] truncate">{e.prenom} {e.nom}</p>
                        <p className="text-xs text-muted-foreground truncate">{e.ecole || e.classe || 'Fiche élève'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">{dateStr}</p>
                        {lastDiag && <p className="text-[10px] text-violet-500 font-medium">diag</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Recherche + filtres */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#0F172A]/60" />
              <Input
                placeholder="Chercher par nom..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-10 bg-white border-[#D4A574] text-[#0F172A]"
              />
            </div>
            {uniqueClasses.length > 0 && (
              <select
                value={classFilter}
                onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 rounded-md border border-[#D4A574] bg-white text-[#0F172A] text-sm"
              >
                <option value="">Toutes les classes</option>
                {uniqueClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
              </select>
            )}
            <select
              value={domainFilter}
              onChange={(e) => { setDomainFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-md border border-[#D4A574] bg-white text-[#0F172A] text-sm"
            >
              <option value="">Tous les domaines</option>
              <option value="apprentissages">🔴 Apprentissages critiques</option>
              <option value="comportement">🔴 Comportement critique</option>
              <option value="developpement">🔴 Développement critique</option>
              <option value="contexte">🔴 Contexte critique</option>
            </select>
            <Link to="/fiche-eleve">
              <Button className="gap-2 shrink-0 bg-[#D4A574] hover:bg-[#C49464] text-white">
                <Plus className="w-4 h-4" /> Nouvel élève
              </Button>
            </Link>
          </div>

          {/* Liste élèves */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 p-6 rounded-lg bg-[#E8DCC8]/30 border border-[#D4A574]">
              <p className="text-[#0F172A]/70">Aucun élève trouvé</p>
              <p className="text-xs text-[#0F172A]/70 mt-2">Créez une fiche élève pour commencer</p>
            </div>
          ) : (
            <>
              <div className="grid gap-3">
                {paginatedEleves.map((eleve, idx) => (
                  <motion.div
                    key={eleve.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(0.02 * idx, 0.1), duration: 0.2 }}
                    className="p-4 rounded-xl bg-white border border-[#D4A574] hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <button
                        onClick={() => navigate(`/detail-fiche?id=${eleve.id}`)}
                        className="text-left flex-1 p-2 rounded hover:bg-[#F5F0E8] transition-colors min-w-max"
                      >
                        <p className="font-semibold text-[#0F172A]">{eleve.prenom} {eleve.nom}</p>
                        {eleve.ecole && <p className="text-xs text-muted-foreground">{eleve.ecole}</p>}
                      </button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/synthese-eleve?id=${eleve.id}`)}
                        className="gap-1"
                      >
                        <TrendingUp className="w-3 h-3" /> Synthèse
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(eleve)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t border-[#D4A574]">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                    className="px-3 py-2 text-sm rounded-md border border-[#D4A574] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F0E8] transition-colors text-[#0F172A]">
                    Précédent
                  </button>
                  <span className="text-sm text-[#0F172A]/70">Page {page} / {totalPages} ({filtered.length} résultats)</span>
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                    className="px-3 py-2 text-sm rounded-md border border-[#D4A574] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F0E8] transition-colors text-[#0F172A]">
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </ScreenLayout>

      {/* Modal sélection élève pour diagnostic */}
      <AnimatePresence>
        {showDiagModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowDiagModal(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl border border-border w-full max-w-md max-h-[70vh] flex flex-col shadow-soft-lg"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="font-semibold text-[#0F172A]">🔍 Choisir un élève</h2>
                <button onClick={() => setShowDiagModal(false)} className="p-1.5 rounded-lg hover:bg-secondary">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-4 pt-3 pb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    autoFocus
                    value={diagSearch}
                    onChange={e => setDiagSearch(e.target.value)}
                    placeholder="Rechercher un élève..."
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="overflow-y-auto flex-1 px-2 pb-3">
                {diagSearchFiltered.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">Aucun élève trouvé</p>
                ) : (
                  diagSearchFiltered.slice(0, 20).map(e => (
                    <button
                      key={e.id}
                      onClick={() => { setShowDiagModal(false); navigate(`/diagnostic-eleve?id=${e.id}`); }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#F5F0E8] transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#D4A574]/15 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-[#D4A574]">{e.prenom?.[0]}{e.nom?.[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0F172A]">{e.prenom} {e.nom}</p>
                        <p className="text-xs text-muted-foreground">{e.classe || ''}{e.ecole ? ` · ${e.ecole}` : ''}</p>
                      </div>
                      <Brain className="w-4 h-4 text-[#D4A574] shrink-0" />
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}