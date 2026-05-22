import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ScreenLayout from '@/components/tree/ScreenLayout';
import { Plus, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';

const ITEMS_PER_PAGE = 10;

export default function Dashboard() {
  const navigate = useNavigate();
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [page, setPage] = useState(1);

  const loadEleves = async () => {
    const fiches = await base44.entities.FicheEleve.list('-created_date', 100).catch(() => []);
    const filtered = fiches.filter(f => f.id); // Garder que les fiches avec ID
    setEleves(filtered);
    setLoading(false);
  };

  useEffect(() => {
    loadEleves();
    const unsubFiche = base44.entities.FicheEleve.subscribe(() => loadEleves());
    return () => unsubFiche();
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

  const filtered = eleves.filter(e => {
    const nameMatch = `${e.prenom} ${e.nom}`.toLowerCase().includes(searchTerm.toLowerCase());
    const classMatch = !classFilter || e.classe === classFilter;
    return nameMatch && classMatch;
  });

  const uniqueClasses = [...new Set(eleves.map(e => e.classe).filter(Boolean))].sort();
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedEleves = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background">
      <HamburgerMenu />
      <ScreenLayout title="📊 Tableau de bord" subtitle="Liste de vos élèves">
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Chercher par nom..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            {uniqueClasses.length > 0 && (
              <select
                value={classFilter}
                onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 rounded-md border border-input bg-card text-foreground text-sm"
              >
                <option value="">Toutes les classes</option>
                {uniqueClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            )}
            <Link to="/fiche-eleve">
              <Button className="gap-2 shrink-0">
                <Plus className="w-4 h-4" />
                Nouvel élève
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 p-6 rounded-lg bg-secondary/30 border border-secondary">
              <p className="text-muted-foreground">Aucun élève trouvé</p>
              <p className="text-xs text-muted-foreground mt-2">Créez une fiche élève pour commencer</p>
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
                    className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <button
                        onClick={() => navigate(`/detail-fiche?id=${eleve.id}`)}
                        className="text-left flex-1 p-2 rounded hover:bg-secondary/50 transition-colors"
                      >
                        <p className="font-semibold text-foreground">{eleve.prenom} {eleve.nom}</p>
                      </button>
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
                <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t border-border">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 text-sm rounded-md border border-input disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
                  >
                    Précédent
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} / {totalPages} ({filtered.length} résultats)
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-2 text-sm rounded-md border border-input disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
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