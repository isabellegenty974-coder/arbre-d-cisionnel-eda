import { useDiagnostic } from "@/lib/DiagnosticContext";
import RapportContent from "@/components/RapportContent";
import ScreenLayout from "@/components/tree/ScreenLayout";
import { Button } from "@/components/ui/button";
import { Trash2, FileText, AlertCircle, CheckCircle2, Users, Lightbulb, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import { exportResumePDF } from "@/lib/pdfExport";
import DiagnosticPersonalise from "@/components/DiagnosticPersonalise";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { generateDiagnosticSynthesis, generateRecommendations } from "@/lib/diagnosticGenerator";

const DOMAIN_LABELS = {
  apprentissages: '📚 Apprentissages',
  comportement: '💝 Comportement',
  developpement: '🌱 Développement',
  contexte: '🏠 Contexte',
};

function DiagnosticView({ diag }) {
  const [regenerating, setRegenerating] = useState(false);
  const [rapport, setRapport] = useState(diag.rapport || '');

  const selections = diag.selections || {};
  const isNewFormat = Object.values(selections).some(arr => Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'string');
  const synthesis = isNewFormat ? { mainCategory: null, secondaryCategories: [], professionals: [] } : generateDiagnosticSynthesis(selections);
  const recommendations = isNewFormat ? [] : generateRecommendations(synthesis.mainCategory, selections);
  const totalItems = Object.values(selections).reduce((s, a) => s + (Array.isArray(a) ? a.length : 0), 0);

  const handleGenerateRapport = async () => {
    setRegenerating(true);
    try {
      const lignes = [];
      const CATEGORIES_MAP = {
        apprentissages: '📚 Apprentissages',
        comportement: '💝 Comportement',
        developpement: '🌱 Développement',
        contexte: '🏠 Contexte',
      };
      Object.entries(selections).forEach(([key, items]) => {
        if (items && items.length > 0) {
          lignes.push(`**${CATEGORIES_MAP[key]}** : ${items.join(" ; ")}`);
        }
      });

      // Récupérer l'user pour le rapport
      let userName = 'N/A';
      try {
        const user = await base44.auth.me();
        userName = user?.full_name || 'N/A';
      } catch (e) {
        // Silencieusement échouer si pas d'user
      }

      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR');
      const prompt = `Élève : ${diag.eleve_prenom} ${diag.eleve_nom}
Âge : ${diag.eleve_age || 'N/A'} ans
Classe : ${diag.eleve_classe || 'N/A'}
Examinateur : ${userName}
Date : ${dateStr}

Tu es un professionnel spécialisé en psychopédagogie et en diagnostic des troubles de l'apprentissage. Analyse les observations suivantes :\n\n${lignes.join("\n")}\n\nRédige un rapport clinique structuré et élégant en français. Inclus les informations de l'élève et de la date en début de rapport. Remplace chaque occurrence de "Patient" par "L'élève" ou "l'élève".

Structure :
1. Synthèse des observations clés
2. Hypothèses diagnostiques prioritaires avec justification clinique
3. Orientations d'évaluation complémentaires recommandées
4. Pistes d'accompagnement et aménagements pédagogiques

Sois rigoureux, clair et précis. Adopte un ton professionnel et factuel. Évite de poser un diagnostic définitif.`;
      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      setRapport(result);
      await base44.entities.Diagnostic.update(diag.id, { rapport: result });
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Infos élève */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
        className="p-5 rounded-xl bg-primary/5 border border-primary/10">
        <h3 className="font-semibold text-foreground mb-1">{diag.eleve_prenom} {diag.eleve_nom}</h3>
        {diag.eleve_age && <p className="text-sm text-muted-foreground">Âge: {diag.eleve_age} ans</p>}
        {diag.eleve_classe && <p className="text-sm text-muted-foreground">Classe: {diag.eleve_classe}</p>}
        <p className="text-xs text-muted-foreground mt-1">Mis à jour: {new Date(diag.updated_date).toLocaleDateString('fr-FR')}</p>
      </motion.div>

      {/* Items cochés */}
      {totalItems > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.2 }}
          className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">📝 Items cochés</h3>
          {Object.entries(DOMAIN_LABELS).map(([key, label]) => {
            const items = selections[key] || [];
            if (!items.length) return null;
            return (
              <div key={key} className="p-4 rounded-xl bg-card border border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-2">{label}</p>
                <ul className="space-y-1">
                  {items.map((item, i) => (
                   <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {typeof item === 'string' ? item : item.label}
                   </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Hypothèse diagnostique */}
      {synthesis.mainCategory && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.2 }}
          className="p-5 rounded-xl bg-card border-2 border-primary/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-1 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">🎯 Hypothèse diagnostique</h3>
              <p className="font-semibold text-foreground text-lg">{synthesis.mainCategory}</p>
              {synthesis.secondaryCategories.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">À approfondir :</p>
                  {synthesis.secondaryCategories.map((cat, i) => (
                    <p key={i} className="text-sm text-foreground">• {cat}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Professionnels */}
      {synthesis.professionals.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.2 }}
          className="p-5 rounded-xl bg-chart-2/10 border border-chart-2/20">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-chart-2 mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground mb-2">Professionnels recommandés</h4>
              <div className="flex flex-wrap gap-2">
                {synthesis.professionals.map((prof, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-chart-2/20 text-chart-2 text-xs font-medium">{prof}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Préconisations */}
      {recommendations.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.2 }}
          className="p-5 rounded-xl bg-accent/10 border border-accent/20">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-accent mt-1 shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-3">💡 Préconisations</h4>
              <ul className="space-y-2">
                {recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-foreground leading-relaxed">• {rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Rapport / Hypothèses diagnostiques */}
      {isNewFormat && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-xl border-2 border-primary/30 overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-5 py-4 bg-primary/5">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">🎯 Hypothèses diagnostiques</span>
            </div>
            {totalItems > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleGenerateRapport}
                disabled={regenerating}
                className="gap-1"
              >
                <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
                {regenerating ? 'Génération...' : 'Générer'}
              </Button>
            )}
          </div>
          <div className="px-5 py-4 bg-card">
            {rapport ? (
              <RapportContent text={rapport} />
            ) : (
              <p className="text-sm text-muted-foreground italic">Aucun rapport généré. Cliquez sur "Générer" pour en créer un.</p>
            )}
          </div>
        </motion.div>
      )}

      {totalItems === 0 && !diag.rapport && (
        <div className="text-center p-8 rounded-lg bg-secondary/30 border border-secondary">
          <p className="text-muted-foreground">Aucun item coché dans ce diagnostic</p>
        </div>
      )}
    </div>
  );
}

export default function Resume() {
  const { selections, eleve, clearAll, crossRecommendations } = useDiagnostic();
  const CATEGORIES_MAP = {
    apprentissages: '📚 Apprentissages',
    comportement: '💝 Comportement',
    developpement: '🌱 Développement',
    contexte: '🏠 Contexte',
  };
  const urlParams = new URLSearchParams(window.location.search);
  const diagId = urlParams.get('id');
  const [loadedDiag, setLoadedDiag] = useState(null);
  const [loadingDiag, setLoadingDiag] = useState(!!diagId);

  useEffect(() => {
    if (diagId) {
      base44.entities.Diagnostic.get(diagId).then(data => {
        setLoadedDiag(data);
        setLoadingDiag(false);
      }).catch(() => setLoadingDiag(false));
    }
  }, [diagId]);

  // Mode affichage d'un diagnostic sauvegardé
  if (diagId) {
    return (
      <div className="min-h-screen bg-background">
        <HamburgerMenu />
        <ScreenLayout title="📋 Hypothèses diagnostiques">
          {loadingDiag ? (
            <div className="text-center py-12 text-muted-foreground">Chargement...</div>
          ) : loadedDiag ? (
            <DiagnosticView diag={loadedDiag} />
          ) : (
            <div className="text-center p-8 rounded-lg bg-secondary/30 border border-secondary">
              <p className="text-muted-foreground">Hypothèses diagnostiques introuvables</p>
            </div>
          )}
        </ScreenLayout>
      </div>
    );
  }

  const totalSelections = Object.values(selections).reduce((sum, arr) => sum + arr.length, 0);

  const handleExportPDF = () => {
    exportResumePDF(eleve, selections, crossRecommendations);
  };

  return (
    <div className="min-h-screen bg-background">
      <HamburgerMenu />
      <ScreenLayout title="📋 Hypothèses diagnostiques">
      <div className="space-y-8">
        {/* Infos élève */}
        {eleve && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl bg-primary/5 border border-primary/10"
          >
            <h3 className="font-semibold text-foreground mb-2">{eleve.prenom} {eleve.nom}</h3>
            {eleve.age && <p className="text-sm text-muted-foreground">Âge: {eleve.age} ans</p>}
            {eleve.classe && <p className="text-sm text-muted-foreground">Classe: {eleve.classe}</p>}
          </motion.div>
        )}

        {/* Recommandations croisées */}
        {Object.keys(crossRecommendations).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl bg-accent/10 border border-accent/20"
          >
            <h3 className="font-semibold text-accent mb-4">🔗 Recommandations croisées</h3>
            <div className="space-y-3">
              {Object.entries(crossRecommendations).map(([qId, reason]) => (
                <div key={qId} className="p-3 rounded-lg bg-white/50 text-sm border border-accent/20">
                  <p className="font-medium text-foreground">{qId.toUpperCase()}</p>
                  <p className="text-muted-foreground text-xs mt-1">{reason}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Hypothèses sélectionnées */}
        {totalSelections > 0 ? (
          <div className="space-y-6">
            {Object.entries(selections).map(([category, items]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <h3 className="text-lg font-semibold text-foreground capitalize">{category}</h3>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
                    >
                      <p className="font-medium text-foreground">{item.label}</p>
                      {item.analysisType && (
                        <p className="text-xs text-muted-foreground mt-1">Analyse: {item.analysisType}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(item.timestamp).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 rounded-lg bg-secondary/30 border border-secondary">
            <p className="text-muted-foreground">Aucune sélection pour le moment</p>
            <p className="text-xs text-muted-foreground mt-2">Sélectionnez des hypothèses dans l'arbre</p>
          </div>
        )}

        {/* Synthèse des hypothèses et recommandations */}
        <DiagnosticPersonalise />

        {/* Actions */}
        {totalSelections > 0 && (
          <div className="flex gap-3 pt-4 flex-wrap">
            <Button onClick={handleExportPDF} className="gap-2 bg-primary hover:bg-primary/90">
              <FileText className="w-4 h-4" />
              Exporter PDF
            </Button>
            <Button onClick={clearAll} variant="outline" className="gap-2">
              <Trash2 className="w-4 h-4" />
              Effacer tout
            </Button>
          </div>
        )}
      </div>
      </ScreenLayout>
    </div>
  );
}