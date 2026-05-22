import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ScreenLayout from '@/components/tree/ScreenLayout';
import { Trash2, ClipboardList, Plus, FileText, History, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';

export default function Dashboard() {
  const navigate = useNavigate();
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadEleves = async () => {
    const [fiches, diagnostics] = await Promise.all([
      base44.entities.FicheEleve.list('-created_date', 100).catch(() => []),
      base44.entities.Diagnostic.list('-created_date', 200).catch(() => []),
    ]);
    const map = new Map();
    fiches.forEach(f => {
      const key = `${f.prenom}|${f.nom}`.toLowerCase();
      map.set(key, { prenom: f.prenom, nom: f.nom, age: f.age, classe: f.classe, ficheId: f.id, statut: 'fiche' });
    });
    diagnostics.forEach(d => {
      const key = `${d.eleve_prenom}|${d.eleve_nom}`.toLowerCase();
      if (!map.has(key)) {
        map.set(key, { prenom: d.eleve_prenom, nom: d.eleve_nom, age: d.eleve_age, classe: d.eleve_classe, ficheId: null, lastDiagId: d.id, statut: d.statut });
      } else {
        const existing = map.get(key);
        if (!existing.lastDiagId) existing.lastDiagId = d.id;
        existing.statut = d.statut;
      }
    });
    setEleves([...map.values()]);
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

  const handleDelete = async (eleve) => {
    if (window.confirm('Supprimer cet élève et tous ses diagnostics ?')) {
      if (eleve.ficheId) await base44.entities.FicheEleve.delete(eleve.ficheId);
      const diags = await base44.entities.Diagnostic.filter({
        eleve_prenom: eleve.prenom,
        eleve_nom: eleve.nom,
      });
      await Promise.all(diags.map(d => base44.entities.Diagnostic.delete(d.id)));
      await loadEleves();
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
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Chercher par nom ou classe..."
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
                    <div className="flex-1">
                         <div className="flex items-center gap-3 mb-1">
                           <h3 className="font-semibold text-foreground">{eleve.prenom} {eleve.nom}</h3>
                           {eleve.statut && (
                             <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                               eleve.statut === 'complète' ? 'bg-green-100 text-green-800' :
                               eleve.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                               eleve.statut === 'archivée' ? 'bg-gray-100 text-gray-800' :
                               'bg-secondary text-secondary-foreground'
                             }`}>
                               {eleve.statut === 'complète' ? '✓ Complété' :
                                eleve.statut === 'en_cours' ? '◯ En cours' :
                                eleve.statut === 'archivée' ? '⊘ Archivé' : 'Fiche'}
                             </span>
                           )}
                         </div>
                         <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                           {eleve.classe && <span>Classe : {eleve.classe}</span>}
                           {eleve.age && <span>{eleve.age} ans</span>}
                         </div>
                       </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => navigate(`/historique?eleve=${encodeURIComponent(`${eleve.prenom} ${eleve.nom}`)}`)}
                      >
                        <History className="w-4 h-4" />
                        Historique
                      </Button>
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