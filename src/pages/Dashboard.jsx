import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ScreenLayout from '@/components/tree/ScreenLayout';
import { Trash2, ClipboardList, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';

export default function Dashboard() {
  const navigate = useNavigate();
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    Promise.all([
      base44.entities.FicheEleve.list('-created_date', 100).catch(() => []),
      base44.entities.Diagnostic.list('-created_date', 200).catch(() => []),
    ]).then(([fiches, diagnostics]) => {
      // Build a unique student list from both sources
      const map = new Map();
      // FicheEleve records have priority (they have ficheId)
      fiches.forEach(f => {
        const key = `${f.prenom}|${f.nom}`.toLowerCase();
        map.set(key, { prenom: f.prenom, nom: f.nom, age: f.age, classe: f.classe, ficheId: f.id });
      });
      // Add students from Diagnostic if not already present
      diagnostics.forEach(d => {
        const key = `${d.eleve_prenom}|${d.eleve_nom}`.toLowerCase();
        if (!map.has(key)) {
          map.set(key, { prenom: d.eleve_prenom, nom: d.eleve_nom, age: d.eleve_age, classe: d.eleve_classe, ficheId: null });
        }
      });
      setEleves([...map.values()]);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (eleve) => {
    if (window.confirm('Supprimer cet élève ?')) {
      if (eleve.ficheId) await base44.entities.FicheEleve.delete(eleve.ficheId);
      setEleves(eleves.filter(e => `${e.prenom}|${e.nom}` !== `${eleve.prenom}|${eleve.nom}`));
    }
  };

  const filtered = eleves.filter(e =>
    `${e.prenom} ${e.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.classe?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <HamburgerMenu />
      <ScreenLayout title="📊 Tableau de bord" subtitle="Liste de vos élèves">
        <div className="space-y-5">
          <div className="flex gap-3">
            <Input
              placeholder="Chercher par nom ou classe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
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
                  transition={{ delay: 0.05 * idx }}
                  className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{eleve.prenom} {eleve.nom}</h3>
                      <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                        {eleve.classe && <span>Classe : {eleve.classe}</span>}
                        {eleve.age && <span>{eleve.age} ans</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={() => {
                          if (eleve.ficheId) {
                            navigate(`/diagnostic-eleve?id=${eleve.ficheId}`);
                          } else {
                            navigate(`/diagnostic-eleve?prenom=${encodeURIComponent(eleve.prenom)}&nom=${encodeURIComponent(eleve.nom)}&age=${eleve.age||''}&classe=${encodeURIComponent(eleve.classe||'')}`);
                          }
                        }}
                      >
                        <ClipboardList className="w-4 h-4" />
                        Observation
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(eleve)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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