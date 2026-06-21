import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DOMAINE_COLORS = {
  apprentissage: "bg-blue-100 text-blue-700 border-blue-200",
  comportement:  "bg-rose-100 text-rose-700 border-rose-200",
  développement: "bg-emerald-100 text-emerald-700 border-emerald-200",
  contexte:      "bg-amber-100 text-amber-700 border-amber-200",
  "diagnostic EDA": "bg-violet-100 text-violet-700 border-violet-200",
};

function EntryCard({ entry, index }) {
  const [expanded, setExpanded] = useState(false);
  const colorClass = DOMAINE_COLORS[entry.domaine?.toLowerCase()] || "bg-secondary text-foreground border-border";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl bg-card border border-border overflow-hidden"
    >
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <Calendar className="w-4 h-4 text-accent shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">{entry.date}</span>
            {entry.domaine && (
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${colorClass}`}>
                {entry.domaine}
              </span>
            )}
            {entry.sous_domaine && (
              <span className="text-[11px] text-muted-foreground">— {entry.sous_domaine}</span>
            )}
          </div>
          {entry.hypotheses?.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {entry.hypotheses[0]}
            </p>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="px-4 pb-4 pt-3 space-y-3">
              {entry.hypotheses?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Hypothèses</p>
                  <ul className="space-y-1">
                    {entry.hypotheses.map((h, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {entry.recommandations?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Actions recommandées</p>
                  <ul className="space-y-1">
                    {entry.recommandations.map((r, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-chart-2 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {entry.scores && Object.keys(entry.scores).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(entry.scores).map(([k, v]) => (
                    <span key={k} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">
                      {k} : {v}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function HistoriqueEleve() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const eleveId = params.get("id");

  const [historique, setHistorique] = useState([]);
  const [eleve, setEleve] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eleveId) { setLoading(false); return; }
    Promise.all([
      base44.entities.HistoriqueEDA.filter({ eleve_id: eleveId }, "-date", 100),
      base44.entities.FicheEleve.get(eleveId).catch(() => null),
    ])
      .then(([hist, fiche]) => {
        setHistorique(hist);
        setEleve(fiche);
      })
      .finally(() => setLoading(false));
  }, [eleveId]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <HamburgerMenu />
      <ScreenLayout
        title="📅 Historique des diagnostics"
        subtitle={eleve ? `${eleve.prenom} ${eleve.nom}` : ''}
      >
        <div className="max-w-md mx-auto space-y-3">

          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-7 h-7 border-4 border-border border-t-accent rounded-full animate-spin" />
            </div>
          )}

          {!loading && historique.length === 0 && (
            <div className="text-center py-12 rounded-xl bg-secondary/30 border border-secondary">
              <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-medium text-sm">Aucun diagnostic enregistré</p>
              <p className="text-xs text-muted-foreground mt-1">Les diagnostics sauvegardés depuis l'arbre EDA apparaîtront ici.</p>
            </div>
          )}

          {!loading && historique.map((entry, i) => (
            <EntryCard key={entry.id} entry={entry} index={i} />
          ))}

          <div className="space-y-2 pt-2">
            {eleveId && (
              <Button
                onClick={() => navigate(`/diagnostic-eleve?id=${eleveId}`)}
                className="w-full gap-2 bg-[#D4A574] hover:bg-[#C49464] text-white"
              >
                Nouveau diagnostic EDA
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => navigate(`/detail-fiche?id=${eleveId}`)}
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la fiche
            </Button>
          </div>
        </div>
      </ScreenLayout>
    </div>
  );
}