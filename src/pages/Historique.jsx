import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ScreenLayout from '@/components/tree/ScreenLayout';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';

export default function Historique() {
  const [searchParams] = useSearchParams();
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const eleveName = searchParams.get('eleve');

  useEffect(() => {
    loadHistorique();
  }, [eleveName]);

  const loadHistorique = async () => {
    try {
      if (!eleveName) return;
      
      const [prenom, nom] = eleveName.split(' ');
      const data = await base44.entities.Diagnostic.filter({
        eleve_prenom: prenom,
        eleve_nom: nom
      }, '-created_date', 100);
      
      setDiagnostics(data);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HamburgerMenu />
      <ScreenLayout title={`📜 Historique - ${eleveName || 'Élève'}`}>
        <div className="space-y-6">
          <Link to="/dashboard">
            <Button variant="outline" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Retour au dashboard
            </Button>
          </Link>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : diagnostics.length === 0 ? (
           <div className="text-center py-8 p-6 rounded-lg bg-secondary/30 border border-secondary">
             <p className="text-muted-foreground">Aucune hypothèse diagnostique pour cet élève</p>
           </div>
          ) : (
            <div className="space-y-3">
              {diagnostics.map((diag, idx) => (
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
                           Hypothèses diagnostiques {new Date(diag.created_date).toLocaleDateString('fr-FR')}
                          </h3>
                      <div className="text-xs text-muted-foreground mt-2 space-y-1">
                        <p>Créé: {new Date(diag.created_date).toLocaleString('fr-FR')}</p>
                        <p>Mis à jour: {new Date(diag.updated_date).toLocaleString('fr-FR')}</p>
                        <p className="capitalize">Statut: {diag.statut}</p>
                      </div>
                    </div>
                    <Link to={`/resume?id=${diag.id}`}>
                      <Button size="sm">Consulter</Button>
                    </Link>
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