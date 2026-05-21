import { useDiagnostic } from "@/lib/DiagnosticContext";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import { analyseEDA } from "@/lib/analyseEDA";
import { exportFullPDF } from "@/lib/pdfExport";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Resultats() {
  const { selections, eleve, crossRecommendations } = useDiagnostic();

  // Convertit les sélections en reponsesQCM pour analyseEDA
  const reponsesQCM = {};
  Object.values(selections).forEach((items) => {
    items.forEach((item) => {
      if (item.questionId && typeof item.questionId === 'string') {
        const match = item.questionId.match(/^(q\d+)([a-d])$/);
        if (match) reponsesQCM[match[1]] = match[2];
      }
    });
  });

  const { hypotheses, scores } = analyseEDA(reponsesQCM);

  // Hypothèses issues des sélections manuelles
  const hypothesesManuelles = [];
  Object.values(selections).forEach((items) => {
    items.forEach((item) => {
      if (item.analysisType) {
        hypothesesManuelles.push({ label: item.label, analysisType: item.analysisType });
      }
    });
  });

  const hasData = hypotheses.length > 0 || hypothesesManuelles.length > 0;

  const handleExport = () => {
    exportFullPDF(eleve, selections, crossRecommendations, []);
  };

  return (
    <div className="min-h-screen bg-background">
      <HamburgerMenu />
      <ScreenLayout title="Hypothèses et recommandations">
        <div className="space-y-8">

          {!hasData && (
            <div className="text-center py-12 rounded-xl bg-secondary/30 border border-secondary">
              <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Aucune hypothèse générée</p>
              <p className="text-sm text-muted-foreground mt-1">
                Complétez le parcours diagnostique pour voir les résultats ici.
              </p>
            </div>
          )}

          {/* Hypothèses auto analyseEDA */}
          {hypotheses.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Hypothèses automatiques
              </h2>
              <div className="space-y-3">
                {hypotheses.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-accent/10 border border-accent/20"
                  >
                    <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <p className="text-foreground font-medium">{h}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Hypothèses manuelles */}
          {hypothesesManuelles.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Hypothèses diagnostiques sélectionnées
              </h2>
              <div className="space-y-3">
                {hypothesesManuelles.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-foreground font-medium">{h.label}</p>
                      {h.analysisType && (
                        <p className="text-xs text-muted-foreground mt-0.5">{h.analysisType}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Scores par domaine */}
          {Object.keys(scores).length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Scores par domaine
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(scores).map(([cat, score], i) => (
                  <motion.div
                    key={cat}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-xl bg-card border border-border text-center"
                  >
                    <p className="text-2xl font-bold text-foreground">{score}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-1">{cat}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Export PDF */}
          {hasData && (
            <Button onClick={handleExport} className="w-full gap-2">
              <Download className="w-4 h-4" />
              Exporter le rapport PDF complet
            </Button>
          )}

        </div>
      </ScreenLayout>
    </div>
  );
}