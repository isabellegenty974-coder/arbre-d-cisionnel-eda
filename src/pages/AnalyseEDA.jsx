import { useNavigate } from "react-router-dom";
import { Check, BarChart2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import { useDiagnostic } from "@/lib/DiagnosticContext";
import { motion } from "framer-motion";

// Vérifie si un label est présent dans une catégorie
function has(selections, category, label) {
  return (selections[category] || []).some(item => item.label === label);
}

// Compte les items non-observation dans une catégorie
function score(selections, category) {
  return (selections[category] || []).filter(item => item.analysisType !== "Observation").length;
}

function computeHypotheses(sel) {
  const h = [];
  const scoreApp = score(sel, "apprentissage");

  // Apprentissages
  if (scoreApp >= 3)
    h.push("Suspicion de trouble des apprentissages (lecture/écriture/mathématiques)");
  if (has(sel, "apprentissage", "Confusions phonologiques"))
    h.push("Hypothèse : Trouble spécifique du langage écrit (dyslexie)");
  if (has(sel, "apprentissage", "Écriture désorganisée / illisible"))
    h.push("Hypothèse : Trouble de l'écriture (dysgraphie)");
  if (has(sel, "apprentissage", "Difficultés en numération") || has(sel, "apprentissage", "Difficultés dans la résolution de problèmes"))
    h.push("Hypothèse : Trouble du calcul (dyscalculie)");

  // Comportement
  const inattention = has(sel, "comportement", "Difficultés d'attention");
  const agitation   = has(sel, "comportement", "Agitation / hyperactivité");
  if (inattention && agitation)
    h.push("Hypothèse : TDA/H (profil mixte)");
  else if (inattention)
    h.push("Hypothèse : TDA/H (profil inattentif)");
  if (has(sel, "comportement", "Signes d'anxiété"))
    h.push("Hypothèse : Anxiété impactant les apprentissages");
  if (has(sel, "comportement", "Comportements oppositionnels"))
    h.push("Hypothèse : Troubles du comportement (à préciser)");

  // Développement
  if (has(sel, "developpement", "Difficultés de motricité fine") || has(sel, "developpement", "Manque de coordination"))
    h.push("Hypothèse : Trouble développemental de la coordination (dyspraxie/TDC)");
  if (has(sel, "developpement", "Retard de langage"))
    h.push("Hypothèse : Trouble du langage oral");
  if (has(sel, "developpement", "Hypersensibilité / hyposensibilité sensorielle"))
    h.push("Hypothèse : Particularités sensorielles (à explorer)");

  // Contexte
  if (has(sel, "contexte", "Absences fréquentes"))
    h.push("Impact possible des absences sur les apprentissages");
  if (has(sel, "contexte", "Difficultés socio-économiques"))
    h.push("Facteurs socio-économiques influençant la scolarité");
  if (has(sel, "contexte", "Événements stressants récents"))
    h.push("Impact émotionnel d'événements récents");

  return h;
}

function computeRecommandations(sel) {
  const r = [];
  const scoreApp = score(sel, "apprentissage");

  if (scoreApp >= 3)
    r.push("Proposer un bilan orthophonique");
  if (has(sel, "developpement", "Difficultés de motricité fine"))
    r.push("Proposer un bilan psychomoteur");
  if (has(sel, "comportement", "Signes d'anxiété"))
    r.push("Proposer un accompagnement psychologique");
  if (has(sel, "comportement", "Difficultés d'attention"))
    r.push("Mettre en place des aménagements attentionnels");
  if (has(sel, "contexte", "Difficultés socio-économiques"))
    r.push("Renforcer le lien famille-école");
  if (has(sel, "contexte", "Absences fréquentes"))
    r.push("Établir un plan de suivi des absences");

  return r;
}

function HypCard({ text, index }) {
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

function RecCard({ text, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-start gap-3 p-4 rounded-xl bg-accent/10 border border-accent/20"
    >
      <BarChart2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
      <p className="text-sm text-foreground">{text}</p>
    </motion.div>
  );
}

export default function AnalyseEDA() {
  const navigate = useNavigate();
  const { selections } = useDiagnostic();

  const hypotheses      = computeHypotheses(selections);
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
              <p className="text-xs text-muted-foreground mt-1">
                Complétez les domaines d'évaluation pour générer l'analyse.
              </p>
            </div>
          )}

          {/* Hypothèses */}
          {hypotheses.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Hypothèses générées
              </h2>
              {hypotheses.map((h, i) => <HypCard key={i} text={h} index={i} />)}
            </section>
          )}

          {/* Recommandations */}
          {recommandations.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Recommandations
              </h2>
              {recommandations.map((r, i) => <RecCard key={i} text={r} index={i} />)}
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