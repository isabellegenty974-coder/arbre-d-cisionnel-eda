import { useNavigate } from "react-router-dom";
import { Check, BarChart2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import { useDiagnostic } from "@/lib/DiagnosticContext";
import { motion } from "framer-motion";

// Extrait les IDs actifs depuis les sélections d'un domaine
function getActiveIds(selections, category) {
  return (selections[category] || []).map(item => item.label);
}

function hasLabel(selections, category, label) {
  return (selections[category] || []).some(item => item.label === label);
}

function countItems(selections, category) {
  return (selections[category] || []).filter(item => item.analysisType !== "Observation").length;
}

function computeHypotheses(selections) {
  const hyps = [];
  const scoreApp = countItems(selections, "apprentissages");
  const has = (cat, label) => hasLabel(selections, cat, label);

  // Apprentissages
  if (scoreApp >= 3) hyps.push("Suspicion de trouble des apprentissages (lecture/écriture/mathématiques)");
  if (has("apprentissages", "Confusions phonologiques")) hyps.push("Hypothèse : Trouble spécifique du langage écrit (dyslexie)");
  if (has("apprentissages", "Écriture désorganisée / illisible")) hyps.push("Hypothèse : Trouble de l'écriture (dysgraphie)");
  if (has("apprentissages", "Difficultés en numération") || has("apprentissages", "Difficultés dans la résolution de problèmes"))
    hyps.push("Hypothèse : Trouble du calcul (dyscalculie)");

  // Comportement
  const inattention = has("comportement", "Difficultés d'attention");
  const agitation   = has("comportement", "Agitation / hyperactivité");
  if (inattention && agitation)  hyps.push("Hypothèse : TDA/H (profil mixte)");
  else if (inattention)          hyps.push("Hypothèse : TDA/H (profil inattentif)");
  if (has("comportement", "Signes d'anxiété"))               hyps.push("Hypothèse : Anxiété impactant les apprentissages");
  if (has("comportement", "Comportements oppositionnels"))   hyps.push("Hypothèse : Troubles du comportement (à préciser)");

  // Développement
  if (has("developpement", "Difficultés de motricité fine") || has("developpement", "Manque de coordination"))
    hyps.push("Hypothèse : Trouble développemental de la coordination (dyspraxie/TDC)");
  if (has("developpement", "Retard de langage"))                    hyps.push("Hypothèse : Trouble du langage oral");
  if (has("developpement", "Hypersensibilité / hyposensibilité sensorielle")) hyps.push("Hypothèse : Particularités sensorielles (à explorer)");

  // Contexte
  if (has("contexte", "Absences fréquentes"))                       hyps.push("Impact possible des absences sur les apprentissages");
  if (has("contexte", "Difficultés socio-économiques"))             hyps.push("Facteurs socio-économiques influençant la scolarité");
  if (has("contexte", "Événements stressants récents"))             hyps.push("Impact émotionnel d'événements récents");

  return hyps;
}

function computeRecommandations(selections) {
  const recs = [];
  const scoreApp = countItems(selections, "apprentissages");
  const has = (cat, label) => hasLabel(selections, cat, label);

  if (scoreApp >= 3)                                              recs.push("Proposer un bilan orthophonique");
  if (has("developpement", "Difficultés de motricité fine"))     recs.push("Proposer un bilan psychomoteur");
  if (has("comportement", "Signes d'anxiété"))                   recs.push("Proposer un accompagnement psychologique");
  if (has("comportement", "Difficultés d'attention"))            recs.push("Mettre en place des aménagements attentionnels");
  if (has("contexte", "Difficultés socio-économiques"))          recs.push("Renforcer le lien famille-école");
  if (has("contexte", "Absences fréquentes"))                    recs.push("Établir un plan de suivi des absences");

  return recs;
}

function ItemCard({ text, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border"
    >
      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
      <p className="text-sm text-foreground">{text}</p>
    </motion.div>
  );
}

export default function AnalyseEDA() {
  const navigate = useNavigate();
  const { selections } = useDiagnostic();

  const hypotheses     = computeHypotheses(selections);
  const recommandations = computeRecommandations(selections);
  const hasData = hypotheses.length > 0 || recommandations.length > 0;

  return (
    <div className="min-h-screen bg-background pb-16">
      <HamburgerMenu />
      <ScreenLayout title="Analyse EDA">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md mx-auto space-y-8"
          style={{ padding: 20 }}
        >
          <p className="text-base font-semibold text-foreground">Analyse automatique</p>

          {!hasData && (
            <div className="text-center py-10 rounded-xl bg-secondary/30 border border-secondary">
              <p className="text-muted-foreground text-sm">Aucune donnée disponible.</p>
              <p className="text-xs text-muted-foreground mt-1">Complétez les domaines d'évaluation pour générer l'analyse.</p>
            </div>
          )}

          {/* Hypothèses */}
          {hypotheses.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Hypothèses générées
              </h2>
              {hypotheses.map((h, i) => <ItemCard key={i} text={h} index={i} />)}
            </section>
          )}

          {/* Recommandations */}
          {recommandations.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Recommandations
              </h2>
              {recommandations.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-accent/10 border border-accent/20"
                >
                  <BarChart2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground">{r}</p>
                </motion.div>
              ))}
            </section>
          )}

          {/* Boutons */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={() => navigate("/stats-annuelles")}
              className="w-full gap-2 bg-primary hover:bg-primary/90"
            >
              <BarChart2 className="w-4 h-4" />
              Enregistrer et passer aux statistiques
            </Button>
            <Button
              onClick={() => navigate("/evaluation-domains")}
              variant="outline"
              className="w-full gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux domaines
            </Button>
          </div>
        </motion.div>
      </ScreenLayout>
    </div>
  );
}