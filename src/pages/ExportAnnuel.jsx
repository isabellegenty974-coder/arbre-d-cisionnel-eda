import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import { Button } from "@/components/ui/button";
import { FileDown, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { exportAnnuelPDF } from "@/lib/pdfExport";

function stripMarkdown(text) {
  return (text || "")
    .replace(/^>\s?/gm, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^[*-]\s+/gm, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/__/g, "")
    .replace(/_/g, "")
    .replace(/\|/g, " ")
    .replace(/^\s*-{3,}\s*$/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function ExportAnnuel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    base44.entities.HistoriqueEDA.list("-date", 500).then((data) => {
      const nbEleves = new Set(data.map((d) => d.eleve_id)).size;

      // stats_hypotheses : fréquence
      const hypCounts = {};
      data.forEach((d) => {
        (d.hypotheses || []).forEach((h) => {
          hypCounts[h] = (hypCounts[h] || 0) + 1;
        });
      });

      // stats_mensuelles
      const monthly = {};
      data.forEach((d) => {
        const key = d.date?.slice(0, 7) || "?";
        monthly[key] = (monthly[key] || 0) + 1;
      });

      setStats({ data, nbEleves, hypCounts, monthly });
    });
  }, []);

  const handleExport = async () => {
    if (!stats) return;
    setLoading(true);
    exportAnnuelPDF(stats);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <HamburgerMenu />
      <ScreenLayout title="Export annuel">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md mx-auto space-y-6"
          style={{ padding: 20 }}
        >
          <p className="text-lg font-semibold text-foreground">
            Générer le rapport annuel complet
          </p>

          {/* Aperçu des stats */}
          {stats && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-2xl font-bold text-foreground">{stats.nbEleves}</p>
                <p className="text-sm text-muted-foreground">Élèves évalués</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="text-sm font-medium text-foreground mb-1">Top hypothèses</p>
                {Object.entries(stats.hypCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([h, count]) => (
                    <p key={h} className="text-xs text-muted-foreground">
                      • {stripMarkdown(h)} ({count})
                    </p>
                  ))}
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="text-sm font-medium text-foreground mb-1">Évaluations par mois</p>
                {Object.entries(stats.monthly)
                  .sort((a, b) => a[0].localeCompare(b[0]))
                  .slice(-3)
                  .map(([m, count]) => (
                    <p key={m} className="text-xs text-muted-foreground">
                      • {m} : {count} évaluation{count > 1 ? "s" : ""}
                    </p>
                  ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleExport}
            disabled={loading || !stats}
            className="w-full gap-2 bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            Exporter le rapport PDF
          </Button>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        </motion.div>
      </ScreenLayout>
    </div>
  );
}