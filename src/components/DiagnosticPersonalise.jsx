import { useDiagnostic } from '@/lib/DiagnosticContext';
import { generateDiagnosticSynthesis, generateRecommendations } from '@/lib/diagnosticGenerator';
import { motion } from 'framer-motion';
import { AlertCircle, Lightbulb, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function DiagnosticPersonalise() {
  const { selections, eleve } = useDiagnostic();

  const hasSelections = Object.values(selections).some(arr => arr.length > 0);
  if (!hasSelections) {
    return null;
  }

  const synthesis = generateDiagnosticSynthesis(selections);
  const recommendations = generateRecommendations(synthesis.mainCategory, selections);

  return (
    <div className="space-y-6 mt-8 pt-8 border-t border-border">
      {/* En-tête synthèse */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
      >
        <h2 className="text-xl font-bold text-foreground mb-2">🎯 Diagnostic personnalisé</h2>
        {eleve?.prenom && (
          <p className="text-sm text-muted-foreground mb-4">
            Basé sur {synthesis.problemCount} sélection(s) pour <span className="font-semibold text-foreground">{eleve.prenom} {eleve.nom}</span>
          </p>
        )}
      </motion.div>

      {/* Profil principal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-5 rounded-xl bg-card border-2 border-primary/30"
      >
        <div className="flex items-start gap-3 mb-3">
          <AlertCircle className="w-5 h-5 text-primary mt-1 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-lg">{synthesis.mainCategory}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Basé sur {synthesis.profiles[0]?.count || 1} indice(s) observé(s)
            </p>
          </div>
        </div>
      </motion.div>

      {/* Catégories secondaires */}
      {synthesis.secondaryCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h4 className="text-sm font-semibold text-foreground mb-2">À approfondir:</h4>
          <div className="space-y-2">
            {synthesis.secondaryCategories.map((category, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground"
              >
                • {category}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Professionnels recommandés */}
      {synthesis.professionals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-xl bg-chart-2/10 border border-chart-2/20"
        >
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-chart-2 mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground mb-2">Professionnels recommandés:</h4>
              <div className="flex flex-wrap gap-2">
                {synthesis.professionals.map((prof, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-chart-2/20 text-chart-2 text-xs font-medium"
                  >
                    {prof}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recommandations pédagogiques */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-5 rounded-xl bg-accent/10 border border-accent/20"
        >
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-accent mt-1 shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-3">Recommandations:</h4>
              <ul className="space-y-2">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-foreground leading-relaxed">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Lien vers le résumé complet */}
      <div className="pt-4">
        <Link to="/resume">
          <Button className="w-full gap-2">
            📋 Voir le résumé complet
          </Button>
        </Link>
      </div>
    </div>
  );
}