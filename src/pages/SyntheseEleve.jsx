import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ScreenLayout from '@/components/tree/ScreenLayout';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, Loader, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const DOMAIN_CONFIG = {
  apprentissages: { label: 'Apprentissages', color: '#3B82F6', bg: 'bg-blue-50', text: 'text-blue-700' },
  comportement: { label: 'Comportement', color: '#F43F5E', bg: 'bg-rose-50', text: 'text-rose-700' },
  developpement: { label: 'Développement', color: '#10B981', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  contexte: { label: 'Contexte', color: '#F59E0B', bg: 'bg-amber-50', text: 'text-amber-700' },
};

export default function SyntheseEleve() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [fiche, setFiche] = useState(null);
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);

  const ficheId = searchParams.get('id');

  useEffect(() => {
    if (!ficheId) { setLoading(false); return; }
    Promise.all([
      base44.entities.FicheEleve.get(ficheId),
      base44.entities.Diagnostic.list('-created_date', 100),
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

  // Calcul des scores moyens par domaine sur tous les diagnostics
  const domainAverages = Object.keys(DOMAIN_CONFIG).reduce((acc, key) => {
    const diagsWithScore = diagnostics.filter(d => d.selections?.scores?.[key] != null);
    if (diagsWithScore.length === 0) { acc[key] = 0; return acc; }
    acc[key] = Math.round((diagsWithScore.reduce((s, d) => s + d.selections.scores[key], 0) / diagsWithScore.length) * 10) / 10;
    return acc;
  }, {});

  const radarData = Object.entries(DOMAIN_CONFIG).map(([key, cfg]) => ({
    domain: cfg.label,
    score: domainAverages[key] || 0,
    fullMark: 5,
  }));

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
      <HamburgerMenu />
      <ScreenLayout title={`📊 Synthèse — ${fiche.prenom} ${fiche.nom}`} subtitle={`Classe: ${fiche.classe || 'N/A'} · ${diagnostics.length} diagnostic${diagnostics.length > 1 ? 's' : ''}`}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto">

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => navigate(`/detail-fiche?id=${ficheId}`)} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Retour
            </Button>
            <Button variant="outline" onClick={() => navigate(`/historique-eleve?id=${ficheId}`)} className="gap-2">
              📋 Historique
            </Button>
            <Button onClick={() => navigate(`/diagnostic-eleve?id=${ficheId}`)} className="gap-2 bg-[#D4A574] hover:bg-[#C49464] text-white">
              <Brain className="w-4 h-4" /> Nouveau diagnostic
            </Button>
            <Button onClick={exportPDF} variant="outline" className="gap-2 ml-auto">
              <Download className="w-4 h-4" /> Export PDF
            </Button>
          </div>

          <div id="synthese-content" className="space-y-6">

            {/* Infos élève */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="p-4 rounded-2xl bg-secondary/50 border border-border">
              <h3 className="font-semibold mb-3 text-foreground">Informations élève</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Nom :</span> <span className="font-medium">{fiche.nom}</span></div>
                <div><span className="text-muted-foreground">Prénom :</span> <span className="font-medium">{fiche.prenom}</span></div>
                <div><span className="text-muted-foreground">Âge :</span> <span className="font-medium">{fiche.age || 'N/A'} ans</span></div>
                <div><span className="text-muted-foreground">Classe :</span> <span className="font-medium">{fiche.classe || 'N/A'}</span></div>
              </div>
            </motion.div>

            {/* Radar chart par domaine */}
            {diagnostics.length > 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                className="p-4 rounded-2xl bg-card border border-border">
                <h3 className="font-semibold mb-1 text-foreground">Profil par domaine</h3>
                <p className="text-xs text-muted-foreground mb-4">Scores moyens sur {diagnostics.length} diagnostic{diagnostics.length > 1 ? 's' : ''}</p>

                {/* Radar */}
                <div className="flex justify-center">
                  <ResponsiveContainer width="100%" height={260}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="domain" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10 }} />
                      <Radar name="Score moyen" dataKey="score" stroke="#D4A574" fill="#D4A574" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Tableau coloré par domaine */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {Object.entries(DOMAIN_CONFIG).map(([key, cfg]) => {
                    const avg = domainAverages[key];
                    const pct = Math.round((avg / 5) * 100);
                    return (
                      <div key={key} className={`p-3 rounded-xl ${cfg.bg} border border-transparent`}>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${cfg.text}`}>{cfg.label}</p>
                        <p className={`text-2xl font-bold ${cfg.text}`}>{avg}<span className="text-sm font-normal">/5</span></p>
                        <div className="w-full bg-white/60 rounded-full h-1.5 mt-2">
                          <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: cfg.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-10 rounded-2xl bg-secondary/30 border border-secondary">
                <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Aucun diagnostic disponible pour cette synthèse.</p>
                <Button onClick={() => navigate(`/diagnostic-eleve?id=${ficheId}`)} className="mt-4 gap-2 bg-[#D4A574] hover:bg-[#C49464] text-white">
                  <Brain className="w-4 h-4" /> Démarrer un diagnostic
                </Button>
              </div>
            )}

            {/* Graphique évolution */}
            {chartData.length > 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="p-4 rounded-2xl bg-card border border-border">
                <h3 className="font-semibold mb-4 text-foreground">Évolution des scores</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="apprentissages" stroke="#3B82F6" name="Apprentissages" dot={false} />
                    <Line type="monotone" dataKey="comportement" stroke="#F43F5E" name="Comportement" dot={false} />
                    <Line type="monotone" dataKey="developpement" stroke="#10B981" name="Développement" dot={false} />
                    <Line type="monotone" dataKey="contexte" stroke="#F59E0B" name="Contexte" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Interventions */}
            {fiche.interventions && fiche.interventions.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
                className="p-4 rounded-2xl bg-card border border-border">
                <h3 className="font-semibold mb-3 text-foreground">Interventions ({fiche.interventions.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {fiche.interventions.slice(0, 5).map((inter, idx) => (
                    <div key={idx} className="text-sm p-2.5 bg-secondary/30 rounded-xl">
                      <p className="font-medium text-foreground">{inter.profession} — {new Date(inter.date).toLocaleDateString('fr-FR')}</p>
                      {inter.description && <p className="text-muted-foreground text-xs mt-0.5">{inter.description}</p>}
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