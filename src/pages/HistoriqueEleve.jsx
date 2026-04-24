import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function HistoriqueEleve() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const eleveId = params.get("id");

  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eleveId) return;
    base44.entities.HistoriqueEDA.filter({ eleve_id: eleveId }, "-date", 100)
      .then(setHistorique)
      .finally(() => setLoading(false));
  }, [eleveId]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <HamburgerMenu />
      <ScreenLayout title="Historique">
        <div className="max-w-md mx-auto space-y-4" style={{ padding: 20 }}>

          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-7 h-7 border-4 border-border border-t-accent rounded-full animate-spin" />
            </div>
          )}

          {!loading && historique.length === 0 && (
            <div className="text-center py-12 rounded-xl bg-secondary/30 border border-secondary">
              <p className="text-muted-foreground text-sm">Aucun historique disponible.</p>
            </div>
          )}

          {!loading && historique.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="p-4 rounded-xl bg-card border border-border space-y-2"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Calendar className="w-4 h-4 text-accent shrink-0" />
                {entry.date}
              </div>
              {entry.hypotheses?.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Hypothèses : </span>
                  {entry.hypotheses.join(", ")}
                </p>
              )}
              {entry.recommandations?.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Recommandations : </span>
                  {entry.recommandations.join(", ")}
                </p>
              )}
              {entry.scores && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {Object.entries(entry.scores).map(([k, v]) => (
                    <span
                      key={k}
                      className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize"
                    >
                      {k} : {v}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}

          <Button
            variant="outline"
            className="w-full gap-2 mt-4"
            onClick={() => navigate(`/detail-eleve?id=${eleveId}`)}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        </div>
      </ScreenLayout>
    </div>
  );
}