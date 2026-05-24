import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ScreenLayout from '@/components/tree/ScreenLayout';
import { Plus, Search, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
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

  const loadEleves = async () => {
    const [fiches, diags] = await Promise.all([
      base44.entities.FicheEleve.list('-created_date', 100).catch(() => []),
      base44.entities.Diagnostic.list('-created_date', 200).catch(() => [])
    ]);
    const filtered = fiches.filter(f => f.id);
    setEleves(filtered);
    setDiagnostics(diags);
    setLoading(false);
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

  const handleDelete = async (fiche) => {
    if (window.confirm('Supprimer cette fiche élève ? Tous les diagnostics liés seront aussi supprimés.')) {
      // Supprimer tous les diagnostics liés à cet élève (cas-insensitif)
      const allDiagnostics = await base44.entities.Diagnostic.list('-created_date', 500).catch(() => []);
      const diagnosticsToDelete = allDiagnostics.filter(
        d => d.eleve_nom?.toLowerCase() === fiche.nom?.toLowerCase() &&
             d.eleve_prenom?.toLowerCase() === fiche.prenom?.toLowerCase()
      );
      
      for (const diag of diagnosticsToDelete) {
        await base44.entities.Diagnostic.delete(diag.id).catch(() => {});
      }
      
      // Supprimer la fiche élève
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

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <HamburgerMenu />
      <ScreenLayout title="📊 Tableau de bord" subtitle="Liste de vos élèves">
        <div className="space-y-5">
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
                {uniqueClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            )}
            <select
              value={domainFilter}
              onChange={(e) => { setDomainFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-md border border-[#D4A574] bg-white text-[#0F172A] text-sm"
              title="Affiche les élèves avec un score critique (<3) dans ce domaine"
            >
              <option value="">Tous les domaines</option>
              <option value="apprentissages">🔴 Apprentissages critiques</option>
              <option value="comportement">🔴 Comportement critique</option>
              <option value="developpement">🔴 Développement critique</option>
              <option value="contexte">🔴 Contexte critique</option>
            </select>
            <Link to="/fiche-eleve">
              <Button className="gap-2 shrink-0 bg-[#D4A574] hover:bg-[#C49464] text-white">
                <Plus className="w-4 h-4" />
                Nouvel élève
              </Button>
            </Link>
          </div>

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
                    className="p-4 rounded-xl bg-white border border-[#D4A574] hover:border-[#D4A574] hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <button
                        onClick={() => navigate(`/detail-fiche?id=${eleve.id}`)}
                        className="text-left flex-1 p-2 rounded hover:bg-[#F5F0E8] transition-colors min-w-max"
                      >
                        <p className="font-semibold text-[#0F172A]">{eleve.prenom} {eleve.nom}</p>
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
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 text-sm rounded-md border border-[#D4A574] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F0E8] transition-colors text-[#0F172A]"
                  >
                    Précédent
                  </button>
                  <span className="text-sm text-[#0F172A]/70">
                    Page {page} / {totalPages} ({filtered.length} résultats)
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-2 text-sm rounded-md border border-[#D4A574] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F0E8] transition-colors text-[#0F172A]"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </ScreenLayout>
    </div>
  );
}