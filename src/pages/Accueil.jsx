import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Users, ClipboardList, TreePine, BarChart2, BookOpen, Shield, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";

const ITEMS_PER_PAGE = 5;

export default function Accueil() {
  const navigate = useNavigate();
  const [eleves, setEleves] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [page, setPage] = useState(1);

  const loadEleves = async () => {
    const [fiches, diagnostics] = await Promise.all([
      base44.entities.FicheEleve.list('-created_date', 100).catch(() => []),
      base44.entities.Diagnostic.list('-created_date', 200).catch(() => []),
    ]);
    
    // Nettoyer les diagnostics orphelins
    const ficheKeys = new Set(fiches.map(f => `${f.prenom}|${f.nom}`.toLowerCase()));
    const orphanedDiags = diagnostics.filter(
      d => !ficheKeys.has(`${d.eleve_prenom}|${d.eleve_nom}`.toLowerCase())
    );
    for (const d of orphanedDiags) {
      await base44.entities.Diagnostic.delete(d.id).catch(() => {});
    }
    
    const map = new Map();
    fiches.forEach(f => {
      const key = `${f.prenom}|${f.nom}`.toLowerCase();
      map.set(key, { prenom: f.prenom, nom: f.nom, classe: f.classe, lastDate: f.date || f.created_date, profession: f.createdByProfession });
    });
    diagnostics.filter(d => ficheKeys.has(`${d.eleve_prenom}|${d.eleve_nom}`.toLowerCase())).forEach(d => {
      const key = `${d.eleve_prenom}|${d.eleve_nom}`.toLowerCase();
      if (!map.has(key)) map.set(key, { prenom: d.eleve_prenom, nom: d.eleve_nom, lastDate: d.created_date });
      else if (!map.get(key).lastDate) map.get(key).lastDate = d.created_date;
    });
    setEleves([...map.values()]);
    setPage(1);
  };

  useEffect(() => {
    loadEleves();
    const unsubFiche = base44.entities.FicheEleve.subscribe(() => loadEleves());
    const unsubDiag = base44.entities.Diagnostic.subscribe(() => loadEleves());
    return () => {
      unsubFiche();
      unsubDiag();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F4F8] pb-24">
      <HamburgerMenu />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0C3B8C] to-[#1054B3] px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow">
            <span className="text-[#0C3B8C] text-2xl font-bold" style={{ fontFamily: 'serif' }}>Ψ</span>
          </div>
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg leading-tight">Arbre décisionnel RASED</h1>
            <p className="text-blue-100 text-xs leading-snug mt-0.5">Outil d'aide à la formulation d'hypothèses diagnostiques</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* 2-col grid: Arbre + Nouvelle observation */}
        <div className="grid grid-cols-2 gap-4">
          {/* Arbre décisionnel */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Link to="/evaluation-domains" className="group block h-full">
              <div className="bg-white rounded-2xl border-2 border-[#F97316] p-4 h-full flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center mb-3 shadow">
                  <TreePine className="w-7 h-7 text-white" />
                </div>
                <p className="font-bold text-foreground text-sm leading-tight mb-1">Arbre décisionnel</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 mb-2">Analyse</span>
                <p className="text-xs text-muted-foreground leading-snug flex-1">Analyse approfondie par domaine</p>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 mt-2 group-hover:text-orange-500 transition-colors" />
              </div>
            </Link>
          </motion.div>

          {/* Nouvelle observation */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Link to="/fiche-eleve" className="group block h-full">
              <div className="bg-white rounded-2xl border-2 border-[#00897B] p-4 h-full flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00897B] to-[#00695C] flex items-center justify-center mb-3 shadow">
                  <ClipboardList className="w-7 h-7 text-white" />
                </div>
                <p className="font-bold text-foreground text-sm leading-tight mb-1">Nouvelle observation</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 mb-2">Créer</span>
                <p className="text-xs text-muted-foreground leading-snug flex-1">Créer une fiche élève et observer</p>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 mt-2 group-hover:text-teal-600 transition-colors" />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Mes élèves — full width */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="bg-white rounded-2xl border-2 border-[#0C3B8C] shadow-sm overflow-hidden">
            {/* Top row */}
            <div
              className="flex items-center gap-3 px-4 pt-4 pb-3 cursor-pointer hover:bg-blue-950/5 transition-colors"
              onClick={() => navigate('/dashboard')}
              title="Tableau de bord"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0C3B8C] to-[#1054B3] flex items-center justify-center shadow shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                   <span className="font-bold text-foreground">Élèves</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-950/10 text-blue-950">Gestion</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Fiches et historique des diagnostics</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
            </div>
            {/* Filters */}
            <div className="mx-4 mb-3 flex gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Chercher..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="flex-1 min-w-fit px-2 py-1.5 text-[10px] rounded border border-blue-950/10 bg-white"
              />
              {[...new Set(eleves.map(e => e.classe).filter(Boolean))].sort().length > 0 && (
                <select
                  value={classFilter}
                  onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
                  className="px-2 py-1.5 text-[10px] rounded border border-blue-950/10 bg-white"
                >
                  <option value="">Classes</option>
                  {[...new Set(eleves.map(e => e.classe).filter(Boolean))].sort().map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              )}
            </div>
            
            {/* Preview strip */}
            <div className="mx-4 mb-4 rounded-xl bg-[#F0F4F8] border border-blue-950/10 p-3">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-blue-950/10">
                <div className="w-5 h-5 rounded bg-[#0C3B8C] flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">Ψ</span>
                </div>
                <span className="text-xs font-semibold text-foreground">Élèves</span>
                <span className="ml-auto text-[10px] text-blue-950 font-semibold">{eleves.length} élève{eleves.length !== 1 ? 's' : ''}</span>
              </div>
              {(() => {
                const filtered = eleves.filter(e => {
                  const nameMatch = `${e.prenom} ${e.nom}`.toLowerCase().includes(searchTerm.toLowerCase());
                  const classMatch = !classFilter || e.classe === classFilter;
                  return nameMatch && classMatch;
                });
                const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
                const pageEleves = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
                return filtered.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground text-center py-2">Aucun élève trouvé</p>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      {pageEleves.map((e, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 cursor-pointer hover:bg-blue-950/10 rounded-lg px-1 py-0.5 transition-colors"
                      onClick={() => navigate(`/historique?eleve=${encodeURIComponent(`${e.prenom} ${e.nom}`)}`)}
                    >
                      <div className="w-5 h-5 rounded-full bg-blue-950/20 flex items-center justify-center shrink-0">
                        <span className="text-[8px] font-bold text-blue-950">{e.prenom?.[0]}{e.nom?.[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-foreground font-medium block">{e.prenom} {e.nom}</span>
                        {e.profession && <span className="text-[8px] text-muted-foreground">{e.profession}</span>}
                      </div>
                      {e.lastDate && (
                        <span className="text-[9px] text-muted-foreground ml-auto shrink-0">
                          {new Date(e.lastDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </span>
                      )}
                      </div>
                    ))}
                    </div>
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between gap-1 mt-2 pt-2 border-t border-blue-950/10">
                        <button
                          onClick={() => setPage(Math.max(1, page - 1))}
                          disabled={page === 1}
                          className="px-1.5 py-0.5 text-[8px] rounded border border-blue-950/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-950/5"
                        >
                          ←
                        </button>
                        <span className="text-[8px] text-blue-950">{page}/{totalPages}</span>
                        <button
                          onClick={() => setPage(Math.min(totalPages, page + 1))}
                          disabled={page === totalPages}
                          className="px-1.5 py-0.5 text-[8px] rounded border border-blue-950/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-950/5"
                        >
                          →
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </motion.div>

        {/* Divider */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground font-medium">Autres sections</span>
          <div className="flex-1 h-px bg-border" />
        </motion.div>

        {/* Secondary 3-col grid */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="grid grid-cols-3 gap-3">
          <Link to="/register" className="group bg-white rounded-2xl border border-border p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-full bg-[#F0F4F8] border border-border flex items-center justify-center mb-2 group-hover:border-purple-300 transition-colors">
              <Users className="w-5 h-5 text-muted-foreground group-hover:text-purple-600 transition-colors" />
            </div>
            <p className="font-bold text-foreground text-xs mb-1">Profil</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Compléter infos</p>
          </Link>
          <Link to="/invite-users" className="group bg-white rounded-2xl border border-border p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-full bg-[#F0F4F8] border border-border flex items-center justify-center mb-2 group-hover:border-green-300 transition-colors">
              <Users className="w-5 h-5 text-muted-foreground group-hover:text-green-600 transition-colors" />
            </div>
            <p className="font-bold text-foreground text-xs mb-1">Inviter</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Ajouter utilisateurs</p>
          </Link>
          <Link to="/stats-annuelles" className="group bg-white rounded-2xl border border-border p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-full bg-[#F0F4F8] border border-border flex items-center justify-center mb-2 group-hover:border-blue-300 transition-colors">
              <BarChart2 className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
            </div>
            <p className="font-bold text-foreground text-xs mb-1">Statistiques</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Suivi annuel</p>
          </Link>
          <Link to="/items-professionnels" className="group bg-white rounded-2xl border border-border p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-full bg-[#F0F4F8] border border-border flex items-center justify-center mb-2 group-hover:border-teal-300 transition-colors">
              <BookOpen className="w-5 h-5 text-muted-foreground group-hover:text-teal-600 transition-colors" />
            </div>
            <p className="font-bold text-foreground text-xs mb-1">Ressources</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Guides & professionnels</p>
          </Link>
          <Link to="/politique-confidentialite" className="group bg-white rounded-2xl border border-border p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-full bg-[#F0F4F8] border border-border flex items-center justify-center mb-2 group-hover:border-gray-400 transition-colors">
              <Shield className="w-5 h-5 text-muted-foreground group-hover:text-gray-600 transition-colors" />
            </div>
            <p className="font-bold text-foreground text-xs mb-1">Confidentialité</p>
            <p className="text-[10px] text-muted-foreground leading-tight">RGPD compliant</p>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}