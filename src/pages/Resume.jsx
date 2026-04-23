import { useDiagnostic } from "@/lib/DiagnosticContext";
import ScreenLayout from "@/components/tree/ScreenLayout";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Resume() {
  const { selections, eleve, clearAll, crossRecommendations } = useDiagnostic();

  const handleExport = () => {
    const data = {
      eleve,
      selections,
      date: new Date().toLocaleString('fr-FR')
    };
    const element = document.createElement('a');
    element.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    element.download = `diagnostic_${eleve?.nom || 'eleve'}.json`;
    element.click();
  };

  const totalSelections = Object.values(selections).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <ScreenLayout title="📋 Résumé diagnostique">
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

        {/* Sélections par catégorie */}
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
            <p className="text-xs text-muted-foreground mt-2">Complétez l'arbre diagnostique pour voir les résultats</p>
          </div>
        )}

        {/* Actions */}
        {totalSelections > 0 && (
          <div className="flex gap-3 pt-4">
            <Button onClick={handleExport} className="gap-2 bg-primary hover:bg-primary/90">
              <Download className="w-4 h-4" />
              Exporter JSON
            </Button>
            <Button onClick={clearAll} variant="outline" className="gap-2">
              <Trash2 className="w-4 h-4" />
              Effacer tout
            </Button>
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}