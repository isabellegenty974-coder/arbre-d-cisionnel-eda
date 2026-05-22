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
    <div className="min-h-screen bg-[#FAFAF8] pb-24">
      <HamburgerMenu />

      {/* Header Banner */}
      <div className="bg-[#0F172A] px-5 pt-12 pb-6 shadow-lg">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-[#D4A574] flex items-center justify-center shrink-0 shadow">
            <span className="text-white text-2xl font-bold" style={{ fontFamily: 'serif' }}>Ψ</span>
          </div>
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg leading-tight">Arbre décisionnel RASED</h1>
            <p className="text-white/70 text-xs leading-snug mt-0.5">Outil d'aide à la formulation d'hypothèses diagnostiques</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* 2-col grid: Arbre + Nouvelle observation */}
        <div className="grid grid-cols-2 gap-4">
          {/* Arbre décisionnel */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Link to="/evaluation-domains" className="group block h-full">
              <div className="bg-gradient-to-br from-[#E8DCC8] to-[#F5F0E8] rounded-3xl border-2 border-[#D4A574] p-5 h-full flex flex-col items-start text-left shadow-lg hover:shadow-xl transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#F4A460] flex items-center justify-center mb-3 shadow">
                  <TreePine className="w-6 h-6 text-white" />
                </div>
                <p className="font-bold text-[#0F172A] text-lg leading-tight mb-2">Arbre décisionnel</p>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white text-[#0F172A] mb-3">Analyse</span>
                <p className="text-sm text-[#0F172A]/80 leading-snug flex-1 mb-3">Analyse approfondie par domaine</p>
                <ChevronRight className="w-5 h-5 text-[#D4A574] mt-auto self-end" />
              </div>
            </Link>
          </motion.div>

          {/* Nouvelle observation */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Link to="/fiche-eleve" className="group block h-full">
              <div className="bg-gradient-to-br from-[#E8DCC8] to-[#F5F0E8] rounded-3xl border-2 border-[#D4A574] p-5 h-full flex flex-col items-start text-left shadow-lg hover:shadow-xl transition-all">
                <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center mb-3 shadow">
                  <ClipboardList className="w-6 h-6 text-[#0F172A]" />
                </div>
                <p className="font-bold text-[#0F172A] text-lg leading-tight mb-2">Nouvelle observation</p>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white text-[#0F172A] mb-3">Créer</span>
                <p className="text-sm text-[#0F172A]/80 leading-snug flex-1 mb-3">Créer une fiche élève et observer</p>
                <ChevronRight className="w-5 h-5 text-[#D4A574] mt-auto self-end" />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Mes élèves — full width */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="bg-white rounded-3xl border-2 border-[#D4A574] shadow-lg overflow-hidden">
            {/* Top row */}
            <div
              className="flex items-center gap-3 px-4 pt-4 pb-3 cursor-pointer hover:bg-[#F5F0E8] transition-colors"
              onClick={() => navigate('/dashboard')}
              title="Tableau de bord"
            >
              <div className="w-12 h-12 rounded-xl bg-[#E8DCC8] flex items-center justify-center shadow shrink-0">
                <Users className="w-6 h-6 text-[#0F172A]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                   <span className="font-bold text-[#0F172A]">Élèves</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E8DCC8] text-[#0F172A]">Gestion</span>
                </div>
                <p className="text-xs text-[#0F172A]/70 mt-0.5">Fiches et historique des diagnostics</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#D4A574] shrink-0" />
            </div>
            {/* Filters */}
            <div className="mx-4 mb-3 flex gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Chercher..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="flex-1 min-w-fit px-3 py-2 text-[11px] rounded-lg border border-[#0F172A]/20 bg-white text-[#0F172A] placeholder-[#0F172A]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A574]/40"
              />
              {[...new Set(eleves.map(e => e.classe).filter(Boolean))].sort().length > 0 && (
                <select
                  value={classFilter}
                  onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 text-[11px] rounded-lg border border-[#0F172A]/20 bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#D4A574]/40"
                >
                  <option value="" className="text-[#0F172A]">Classes</option>
                  {[...new Set(eleves.map(e => e.classe).filter(Boolean))].sort().map(cls => (
                    <option key={cls} value={cls} className="text-[#0F172A]">{cls}</option>
                  ))}
                </select>
              )}
            </div>
            
            {/* Preview strip */}
            <div className="mx-4 mb-4 rounded-xl bg-[#F5F0E8] border border-[#D4A574] p-3">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#D4A574]">
                <div className="w-5 h-5 rounded bg-[#D4A574]/30 flex items-center justify-center">
                  <span className="text-[#0F172A] text-[9px] font-bold">Ψ</span>
                </div>
                <span className="text-xs font-semibold text-[#0F172A]">Élèves</span>
                <span className="ml-auto text-[10px] text-[#0F172A]/70 font-semibold">{eleves.length} élève{eleves.length !== 1 ? 's' : ''}</span>
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
                  <p className="text-[10px] text-[#0F172A]/60 text-center py-2">Aucun élève trouvé</p>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      {pageEleves.map((e, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 cursor-pointer hover:bg-[#E8DCC8]/50 rounded-lg px-1 py-0.5 transition-colors"
                      onClick={() => navigate(`/historique?eleve=${encodeURIComponent(`${e.prenom} ${e.nom}`)}`)}
                    >
                      <div className="w-5 h-5 rounded-full bg-[#D4A574]/20 flex items-center justify-center shrink-0">
                        <span className="text-[8px] font-bold text-[#0F172A]">{e.prenom?.[0]}{e.nom?.[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-[#0F172A] font-medium block">{e.prenom} {e.nom}</span>
                        {e.profession && <span className="text-[8px] text-[#0F172A]/70">{e.profession}</span>}
                      </div>
                      {e.lastDate && (
                        <span className="text-[9px] text-[#0F172A]/70 ml-auto shrink-0">
                          {new Date(e.lastDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </span>
                      )}
                      </div>
                    ))}
                    </div>
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between gap-1 mt-2 pt-2 border-t border-[#D4A574]">
                        <button
                          onClick={() => setPage(Math.max(1, page - 1))}
                          disabled={page === 1}
                          className="px-1.5 py-0.5 text-[8px] rounded border border-[#0F172A]/20 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#E8DCC8]/50 text-[#0F172A]/80"
                        >
                          ←
                        </button>
                        <span className="text-[8px] text-[#0F172A]/80">{page}/{totalPages}</span>
                        <button
                          onClick={() => setPage(Math.min(totalPages, page + 1))}
                          disabled={page === totalPages}
                          className="px-1.5 py-0.5 text-[8px] rounded border border-[#0F172A]/20 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#E8DCC8]/50 text-[#0F172A]/80"
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
          <div className="flex-1 h-px bg-[#0F172A]/20" />
          <span className="text-sm text-[#0F172A]/70 font-medium">Autres sections</span>
          <div className="flex-1 h-px bg-[#0F172A]/20" />
        </motion.div>

        {/* Secondary cards grid */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="grid grid-cols-3 gap-3">
          <Link to="/register" className="group bg-white rounded-2xl border-2 border-[#D4A574] p-4 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-all">
            <div className="w-10 h-10 rounded-full bg-[#E8DCC8] flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-[#0F172A]" />
            </div>
            <p className="font-bold text-[#0F172A] text-xs mb-1">Profil</p>
            <p className="text-[10px] text-[#0F172A]/80 leading-tight">Gérer son compte</p>
          </Link>
          <Link to="/invite-users" className="group bg-white rounded-2xl border-2 border-[#D4A574] p-4 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-all">
            <div className="w-10 h-10 rounded-full bg-[#E8DCC8] flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-[#0F172A]" />
            </div>
            <p className="font-bold text-[#0F172A] text-xs mb-1">Inviter</p>
            <p className="text-[10px] text-[#0F172A]/80 leading-tight">Inviter un collègue</p>
          </Link>
          <Link to="/stats-annuelles" className="group bg-white rounded-2xl border-2 border-[#D4A574] p-4 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-all">
            <div className="w-10 h-10 rounded-full bg-[#E8DCC8] flex items-center justify-center mb-2">
              <BarChart2 className="w-5 h-5 text-[#0F172A]" />
            </div>
            <p className="font-bold text-[#0F172A] text-xs mb-1">Statistiques</p>
            <p className="text-[10px] text-[#0F172A]/80 leading-tight">Accéder aux données</p>
          </Link>
        </motion.div>

        {/* Ressources & Confidentialité - 2 col */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27 }} className="grid grid-cols-2 gap-3">
          <Link to="/items-professionnels" className="group bg-gradient-to-br from-[#F0E8F8] to-[#F5F0E8] rounded-2xl border-2 border-[#D4A574] p-4 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-all">
            <div className="w-10 h-10 rounded-full bg-[#E8D4F0] flex items-center justify-center mb-2">
              <BookOpen className="w-5 h-5 text-[#0F172A]" />
            </div>
            <p className="font-bold text-[#0F172A] text-xs mb-1">Ressources</p>
            <p className="text-[10px] text-[#0F172A]/80 leading-tight">Guides & professionnels</p>
          </Link>
          <Link to="/politique-confidentialite" className="group bg-gradient-to-br from-[#E8F0F8] to-[#F5F0E8] rounded-2xl border-2 border-[#D4A574] p-4 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-all">
            <div className="w-10 h-10 rounded-full bg-[#D4E4F0] flex items-center justify-center mb-2">
              <Shield className="w-5 h-5 text-[#0F172A]" />
            </div>
            <p className="font-bold text-[#0F172A] text-xs mb-1">Confidentialité</p>
            <p className="text-[10px] text-[#0F172A]/80 leading-tight">RGPD compliant</p>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}