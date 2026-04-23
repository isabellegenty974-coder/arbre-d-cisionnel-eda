import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ScreenLayout from '@/components/tree/ScreenLayout';
import { Trash2, FileText, History, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import { useDiagnostic } from '@/lib/DiagnosticContext';

export default function Dashboard() {
  const { eleve, setCurrentEleve } = useDiagnostic();
  const [editingEleve, setEditingEleve] = useState(eleve || {});
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDiagnostics();
  }, []);

  useEffect(() => {
    setEditingEleve(eleve || {});
  }, [eleve]);

  const handleSaveEleve = () => {
    setCurrentEleve(editingEleve);
  };

  const loadDiagnostics = async () => {
    try {
      const data = await base44.entities.Diagnostic.list('-updated_date', 50);
      setDiagnostics(data);
    } catch (error) {
      console.error('Erreur chargement diagnostics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce diagnostic ?')) {
      try {
        await base44.entities.Diagnostic.delete(id);
        setDiagnostics(diagnostics.filter(d => d.id !== id));
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  const filtered = diagnostics.filter(d =>
    `${d.eleve_prenom} ${d.eleve_nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.eleve_classe?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <HamburgerMenu />
      <ScreenLayout title="📊 Dashboard">
        <div className="space-y-8">
          {/* Infos élève modifiables */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-primary/5 border-2 border-primary/20"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">👤 Élève courant</h2>
            <div className="grid gap-4 sm:grid-cols-2 mb-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Prénom</label>
                <Input
                  value={editingEleve?.prenom || ''}
                  onChange={(e) => setEditingEleve({ ...editingEleve, prenom: e.target.value })}
                  placeholder="Prénom"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Nom</label>
                <Input
                  value={editingEleve?.nom || ''}
                  onChange={(e) => setEditingEleve({ ...editingEleve, nom: e.target.value })}
                  placeholder="Nom"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Âge</label>
                <Input
                  type="number"
                  value={editingEleve?.age || ''}
                  onChange={(e) => setEditingEleve({ ...editingEleve, age: e.target.value })}
                  placeholder="Âge"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Classe</label>
                <Input
                  value={editingEleve?.classe || ''}
                  onChange={(e) => setEditingEleve({ ...editingEleve, classe: e.target.value })}
                  placeholder="Ex: CM2"
                />
              </div>
            </div>
            <Button onClick={handleSaveEleve} className="w-full gap-2 bg-primary hover:bg-primary/90">
              <Save className="w-4 h-4" />
              Enregistrer
            </Button>
          </motion.div>

          {/* Search et diagnostics */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">📋 Diagnostics</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Chercher par nom ou classe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

          {/* List */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 p-6 rounded-lg bg-secondary/30 border border-secondary">
              <p className="text-muted-foreground">Aucun diagnostic trouvé</p>
              <p className="text-xs text-muted-foreground mt-2">Créez un nouveau diagnostic pour commencer</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.map((diag, idx) => (
                <motion.div
                  key={diag.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  className="p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {diag.eleve_prenom} {diag.eleve_nom}
                      </h3>
                      <div className="text-xs text-muted-foreground mt-1 space-y-1">
                        {diag.eleve_classe && <p>Classe: {diag.eleve_classe}</p>}
                        {diag.eleve_age && <p>Âge: {diag.eleve_age} ans</p>}
                        <p>Créé: {new Date(diag.created_date).toLocaleDateString('fr-FR')}</p>
                        <p>Mis à jour: {new Date(diag.updated_date).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/resume?id=${diag.id}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <FileText className="w-4 h-4" />
                          Voir
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(diag.id)}
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
        </div>
      </ScreenLayout>
    </div>
  );
}