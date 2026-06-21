import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ScreenLayout from '@/components/tree/ScreenLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';

const DOMAINES = [
  { key: 'apprentissage', label: 'Apprentissages', color: '#3B82F6', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  { key: 'comportement',  label: 'Comportement',   color: '#F43F5E', bg: 'bg-rose-50',  border: 'border-rose-200',  text: 'text-rose-700' },
  { key: 'développement', label: 'Développement',  color: '#10B981', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  { key: 'contexte',      label: 'Contexte',       color: '#F59E0B', bg: 'bg-amber-50', border: 'border-amber-200',  text: 'text-amber-700' },
];

export default function SyntheseEleve() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [fiche, setFiche] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);

  const ficheId = searchParams.get('id');

  useEffect(() => {
    if (!ficheId) { setLoading(false); return; }
    Promise.all([
      base44.entities.FicheEleve.get(ficheId),
      base44.entities.HistoriqueEDA.filter({ eleve_id: ficheId }, '-date', 100),
    ])
      .then(([ficheData, hist]) => {
        setFiche(ficheData);
        setHistorique(hist || []);
      })
      .catch(() => setFiche(null))
      .finally(() => setLoading(false));
  }, [ficheId]);

  // Compter les diagnostics par domaine
  const domaineCounts = DOMAINES.map(d => ({
    domaine: d.label,
    count: historique.filter(h => h.domaine?.toLowerCase() === d.key).length,
    color: d.color,
  }));

  // Données radar : nombre d'interventions par domaine
  const radarData = DOMAINES.map(d => ({
    domaine: d.label,
    interventions: historique.filter(h => h.domaine?.toLowerCase() === d.key).length,
  }));

  const hasData = historique.length > 0;

  // Sous-domaines les plus fréquents
  const sousDomaineCounts = {};
  historique.forEach(h => {
    if (h.sous_domaine) {
      sousDomaineCounts[h.sous_domaine] = (sousDomaineCounts[h.sous_domaine] || 0) + 1;
    }
  });
  const topSousDomaines = Object.entries(sousDomaineCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

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
      <ScreenLayout title={`📊 Synthèse — ${fiche.prenom} ${fiche.nom}`} subtitle={`Classe : ${fiche.classe || 'N/A'} · ${historique.length} diagnostic(s) enregistré(s)`}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl mx-auto">

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/detail-fiche?id=${ficheId}`)} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Retour
            </Button>
            <Button variant="outline" onClick={() => navigate(`/historique-eleve?id=${ficheId}`)} className="gap-2 ml-auto">
              📅 Historique complet
            </Button>
          </div>

          {!hasData && (
            <div className="text-center py-12 rounded-xl bg-secondary/30 border border-secondary">
              <p className="text-muted-foreground font-medium">Aucun diagnostic enregistré</p>
              <p className="text-sm text-muted-foreground mt-1">Lancez un parcours depuis l'arbre EDA pour alimenter cette synthèse.</p>
              <Button
                onClick={() => navigate(`/diagnostic-eleve?id=${ficheId}`)}
                className="mt-4 bg-[#D4A574] hover:bg-[#C49464] text-white"
              >
                Démarrer un diagnostic EDA
              </Button>
            </div>
          )}

          {hasData && (
            <>
              {/* Cartes par domaine */}
              <div className="grid grid-cols-2 gap-3">
                {DOMAINES.map(d => {
                  const count = historique.filter(h => h.domaine?.toLowerCase() === d.key).length;
                  return (
                    <motion.div
                      key={d.key}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-4 rounded-xl border-2 ${d.bg} ${d.border}`}
                    >
                      <p className={`text-2xl font-bold ${d.text}`}>{count}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{d.label}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Radar chart */}
              <div className="p-4 rounded-xl bg-card border border-border">
                <h3 className="font-semibold mb-4 text-foreground text-sm">Répartition par domaine</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="domaine" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fontSize: 10 }} />
                    <Radar
                      name="Interventions"
                      dataKey="interventions"
                      stroke="#D4A574"
                      fill="#D4A574"
                      fillOpacity={0.35}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Bar chart par domaine */}
              <div className="p-4 rounded-xl bg-card border border-border">
                <h3 className="font-semibold mb-4 text-foreground text-sm">Diagnostics par domaine</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={domaineCounts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="domaine" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Diagnostics" fill="#D4A574" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Sous-domaines fréquents */}
              {topSousDomaines.length > 0 && (
                <div className="p-4 rounded-xl bg-card border border-border">
                  <h3 className="font-semibold mb-3 text-foreground text-sm">Sous-domaines les plus explorés</h3>
                  <div className="space-y-2">
                    {topSousDomaines.map(([sd, count], i) => (
                      <div key={sd} className="flex items-center gap-3">
                        <div className="flex-1 text-sm text-foreground capitalize">{sd}</div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 rounded-full bg-[#D4A574]/30 w-24 overflow-hidden">
                            <div
                              className="h-2 rounded-full bg-[#D4A574]"
                              style={{ width: `${(count / (topSousDomaines[0][1] || 1)) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-muted-foreground w-4 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dernier diagnostic */}
              {historique.length > 0 && historique[0].hypotheses?.length > 0 && (
                <div className="p-4 rounded-xl bg-card border border-border">
                  <h3 className="font-semibold mb-3 text-foreground text-sm">Dernières hypothèses ({historique[0].date})</h3>
                  <ul className="space-y-1.5">
                    {historique[0].hypotheses.slice(0, 4).map((h, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D4A574] shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </motion.div>
      </ScreenLayout>
    </div>
  );
}