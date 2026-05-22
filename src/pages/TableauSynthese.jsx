import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import ScreenLayout from '@/components/tree/ScreenLayout';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';

const getStatusColor = (status) => {
  const colors = {
    'en_cours': 'bg-yellow-100 text-yellow-800',
    'complète': 'bg-green-100 text-green-800',
    'archivée': 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status) => {
  const labels = {
    'en_cours': 'En cours',
    'complète': 'Complète',
    'archivée': 'Archivée',
  };
  return labels[status] || status;
};

export default function TableauSynthese() {
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiagnostics = async () => {
      try {
        const diags = await base44.entities.Diagnostic.list('-updated_date', 100);
        setDiagnostics(diags);
      } catch (err) {
        console.error('Erreur chargement diagnostics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnostics();

    const unsubscribe = base44.entities.Diagnostic.subscribe((event) => {
      setDiagnostics(prev => {
        if (event.type === 'delete') {
          return prev.filter(d => d.id !== event.id);
        }
        return prev;
      });
    });

    return unsubscribe;
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Supprimer ce diagnostic ?')) {
      await base44.entities.Diagnostic.delete(id);
    }
  };

  const extractMainHypothesis = (selections) => {
    if (!selections) return 'N/A';
    const all = Object.values(selections).flat();
    return all.length > 0 ? all.slice(0, 2).join(', ') : 'N/A';
  };

  return (
    <div className="min-h-screen bg-background">
      <HamburgerMenu />
      <ScreenLayout title="📊 Tableau de synthèse des hypothèses diagnostiques">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Chargement...</div>
        ) : diagnostics.length === 0 ? (
          <div className="text-center p-8 rounded-lg bg-secondary/30 border border-secondary">
            <p className="text-muted-foreground">Aucun diagnostic enregistré</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left p-3 font-semibold text-foreground">Élève</th>
                  <th className="text-left p-3 font-semibold text-foreground">Classe</th>
                  <th className="text-left p-3 font-semibold text-foreground">Hypothèses principales</th>
                  <th className="text-left p-3 font-semibold text-foreground">Statut</th>
                  <th className="text-left p-3 font-semibold text-foreground">Date</th>
                  <th className="text-left p-3 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {diagnostics.map((diag, idx) => (
                  <motion.tr
                    key={diag.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="border-b border-border hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-3 font-medium text-foreground">
                      {diag.eleve_prenom} {diag.eleve_nom}
                    </td>
                    <td className="p-3 text-muted-foreground">{diag.eleve_classe || '-'}</td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {extractMainHypothesis(diag.selections)}
                    </td>
                    <td className="p-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(diag.statut)}`}>
                        {getStatusLabel(diag.statut)}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {new Date(diag.updated_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(`/resume?id=${diag.id}`, '_blank')}
                          title="Voir le diagnostic"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {diag.rapport_pdf_url && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(diag.rapport_pdf_url, '_blank')}
                            title="Télécharger le PDF"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(diag.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ScreenLayout>
    </div>
  );
}