import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ScreenLayout from '@/components/tree/ScreenLayout';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import { Button } from '@/components/ui/button';
import { FileDown, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateRapportAnnuel } from '@/lib/rapportAnnuelGenerator';

export default function RapportAnnuel() {
  const navigate = useNavigate();
  const [annees, setAnnees] = useState([]);
  const [anneeActive, setAnneeActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.AnneeScolaire.list('-libelle', 20),
    ]).then(([ans]) => {
      setAnnees(ans);
      const active = ans.find(a => a.est_active || a.active) || ans[0];
      setAnneeActive(active?.id);
      setLoading(false);
    });
  }, []);

  const handleGeneratePDF = async () => {
    if (!anneeActive) return;
    setGenerating(true);

    try {
      const annee = annees.find(a => a.id === anneeActive);
      const [fiches, historique, eleves, ecoles] = await Promise.all([
        base44.entities.FicheEleve.list('-created_date', 1000),
        base44.entities.HistoriqueEDA.list('-date', 2000),
        base44.entities.EleveRased.list('-created_date', 1000),
        base44.entities.EcoleRased.list('-created_date', 100),
      ]);

      const doc = await generateRapportAnnuel({ anneeScolaire: annee, fiches, historique, eleves, ecoles });
      doc.save(`rapport_annuel_RASED_${annee.libelle.replace('-', '_')}.pdf`);
    } catch (error) {
      console.error('Erreur génération rapport:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAF8] to-[#F5F0E8]">
      <HamburgerMenu />
      <ScreenLayout title="📊 Rapport annuel" subtitle="Générez le rapport d'activité RASED en PDF">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md mx-auto space-y-6"
          style={{ padding: 20 }}
        >
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Année scolaire</label>
            <select
              value={anneeActive || ''}
              onChange={e => setAnneeActive(e.target.value)}
              className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {annees.length === 0 && <option>Aucune année</option>}
              {annees.map(a => (
                <option key={a.id} value={a.id}>
                  {a.libelle} {(a.est_active || a.active) ? '★' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border space-y-2">
            <p className="text-sm font-medium text-foreground">Ce rapport contient :</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>✓ Couverture avec équipe et signatures</li>
              <li>✓ Indicateurs d'activité commune</li>
              <li>✓ Statistiques Psy-EN EDA</li>
              <li>✓ Statistiques MaDR</li>
              <li>✓ Statistiques MaDP</li>
              <li>✓ Synthèse comparative</li>
            </ul>
          </div>

          <Button
            onClick={handleGeneratePDF}
            disabled={generating || !anneeActive}
            className="w-full gap-2 bg-[#1A3353] hover:bg-[#0F2340] text-white"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            {generating ? 'Génération...' : 'Générer le rapport PDF'}
          </Button>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => navigate('/stats-annuelles')}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        </motion.div>
      </ScreenLayout>
    </div>
  );
}