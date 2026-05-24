import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ScreenLayout from '@/components/tree/ScreenLayout';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function SyntheseEleve() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [fiche, setFiche] = useState(null);
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);

  const ficheId = searchParams.get('id');

  useEffect(() => {
    if (!ficheId) {
      setLoading(false);
      return;
    }

    Promise.all([
      base44.entities.FicheEleve.get(ficheId),
      base44.entities.Diagnostic.list('-created_date', 100)
    ])
      .then(([ficheData, allDiags]) => {
        setFiche(ficheData);
        if (ficheData && allDiags) {
          const related = allDiags.filter(
            d => d.eleve_nom?.toLowerCase() === ficheData.nom?.toLowerCase() &&
                 d.eleve_prenom?.toLowerCase() === ficheData.prenom?.toLowerCase()
          );
          setDiagnostics(related.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
        }
      })
      .catch(() => setFiche(null))
      .finally(() => setLoading(false));
  }, [ficheId]);

  const chartData = diagnostics
    .filter(d => d.selections?.scores)
    .reverse()
    .map(d => ({
      date: new Date(d.created_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      apprentissages: d.selections.scores.apprentissages || 0,
      comportement: d.selections.scores.comportement || 0,
      developpement: d.selections.scores.developpement || 0,
      contexte: d.selections.scores.contexte || 0,
    }));

  const exportPDF = async () => {
    const element = document.getElementById('synthese-content');
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(`Synthese_${fiche?.prenom}_${fiche?.nom}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!fiche) {
    return (
      <div className="min-h-screen bg-background">
        <ScreenLayout title="Synthèse non trouvée">
          <p className="text-center text-muted-foreground">Cette fiche n'existe pas.</p>
        </ScreenLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <ScreenLayout title={`Synthèse - ${fiche.prenom} ${fiche.nom}`} subtitle={`Classe: ${fiche.classe || 'N/A'}`}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto">
          
          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Retour
            </Button>
            <Button onClick={exportPDF} className="gap-2">
              <Download className="w-4 h-4" /> Export PDF
            </Button>
          </div>

          {/* Synthèse content */}
          <div id="synthese-content" className="space-y-6">
            
            {/* Infos élève */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="p-4 rounded-lg bg-secondary/50 border border-border">
              <h3 className="font-semibold mb-3 text-foreground">Informations élève</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Nom:</span> <span className="font-medium text-foreground">{fiche.nom}</span></div>
                <div><span className="text-muted-foreground">Prénom:</span> <span className="font-medium text-foreground">{fiche.prenom}</span></div>
                <div><span className="text-muted-foreground">Âge:</span> <span className="font-medium text-foreground">{fiche.age || 'N/A'} ans</span></div>
                <div><span className="text-muted-foreground">Classe:</span> <span className="font-medium text-foreground">{fiche.classe || 'N/A'}</span></div>
              </div>
            </motion.div>

            {/* Graphique évolution */}
            {chartData.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="p-4 rounded-lg bg-card border border-border">
                <h3 className="font-semibold mb-4 text-foreground">Évolution des scores</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="apprentissages" stroke="#3B82F6" name="Apprentissages" />
                    <Line type="monotone" dataKey="comportement" stroke="#F43F5E" name="Comportement" />
                    <Line type="monotone" dataKey="developpement" stroke="#10B981" name="Développement" />
                    <Line type="monotone" dataKey="contexte" stroke="#F59E0B" name="Contexte" />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Dernier diagnostic */}
            {diagnostics.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="p-4 rounded-lg bg-card border border-border">
                <h3 className="font-semibold mb-3 text-foreground">Dernier diagnostic ({new Date(diagnostics[0].created_date).toLocaleDateString('fr-FR')})</h3>
                {diagnostics[0].selections?.scores && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg"><span className="text-sm text-muted-foreground">Apprentissages:</span><p className="font-semibold text-lg text-foreground">{diagnostics[0].selections.scores.apprentissages}/5</p></div>
                    <div className="p-3 bg-destructive/10 rounded-lg"><span className="text-sm text-muted-foreground">Comportement:</span><p className="font-semibold text-lg text-foreground">{diagnostics[0].selections.scores.comportement}/5</p></div>
                    <div className="p-3 bg-emerald-500/10 rounded-lg"><span className="text-sm text-muted-foreground">Développement:</span><p className="font-semibold text-lg text-foreground">{diagnostics[0].selections.scores.developpement}/5</p></div>
                    <div className="p-3 bg-amber-500/10 rounded-lg"><span className="text-sm text-muted-foreground">Contexte:</span><p className="font-semibold text-lg text-foreground">{diagnostics[0].selections.scores.contexte}/5</p></div>
                  </div>
                )}
                {diagnostics[0].rapport && (
                  <div className="text-sm text-foreground bg-secondary/30 p-3 rounded-lg max-h-48 overflow-y-auto">
                    <p className="whitespace-pre-wrap leading-relaxed">{diagnostics[0].rapport.substring(0, 400)}...</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Interventions */}
            {fiche.interventions && fiche.interventions.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="p-4 rounded-lg bg-card border border-border">
                <h3 className="font-semibold mb-3 text-foreground">Interventions ({fiche.interventions.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {fiche.interventions.slice(0, 5).map((inter, idx) => (
                    <div key={idx} className="text-sm p-2 bg-secondary/30 rounded">
                      <p className="font-medium text-foreground">{inter.profession} - {new Date(inter.date).toLocaleDateString('fr-FR')}</p>
                      <p className="text-muted-foreground text-xs">{inter.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </ScreenLayout>
    </div>
  );
}