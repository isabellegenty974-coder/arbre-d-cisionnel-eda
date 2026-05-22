import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ScreenLayout from '@/components/tree/ScreenLayout';
import { Plus, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';

export default function Dashboard() {
  const navigate = useNavigate();
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    if (window.confirm('Supprimer cette fiche élève ?')) {
      await base44.entities.FicheEleve.delete(fiche.id);
      await loadEleves();
    }
  };

  const filtered = eleves.filter(e =>
    `${e.prenom} ${e.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <HamburgerMenu />
      <ScreenLayout title="📊 Tableau de bord" subtitle="Liste de vos élèves">
        <div className="space-y-5">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Chercher par nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
            <div className="grid gap-3">
              {filtered.map((eleve, idx) => (
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
          )}
        </div>
      </ScreenLayout>
    </div>
  );
}