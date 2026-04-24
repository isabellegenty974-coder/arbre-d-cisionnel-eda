import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, Check, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";

function ScoreRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value ?? "—"}</span>
    </div>
  );
}

function ItemCard({ text, index, color = "primary" }) {
  const Icon = color === "accent" ? BarChart2 : Check;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-start gap-3 p-3 rounded-xl border ${
        color === "accent"
          ? "bg-accent/10 border-accent/20"
          : "bg-card border-border"
      }`}
    >
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color === "accent" ? "text-accent" : "text-primary"}`} />
      <p className="text-sm text-foreground">{text}</p>
    </motion.div>
  );
}

export default function DetailEleve() {
  const navigate = useNavigate();
  const [eleve, setEleve] = useState(null);
  const [loading, setLoading] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    base44.entities.FicheEleve.filter({ id })
      .then((res) => setEleve(res[0] || null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleExportPDF = () => {
    if (!eleve) return;
    const doc = new jsPDF();
    const title = `Fiche élève - ${eleve.prenom} ${eleve.nom}`;

    doc.setFontSize(18);
    doc.text(title, 20, 20);

    doc.setFontSize(12);
    doc.text(`Classe : ${eleve.classe || "—"}`, 20, 35);
    doc.text(`Âge : ${eleve.age || "—"} ans`, 20, 43);
    doc.text(`Date : ${eleve.date || "—"}`, 20, 51);

    doc.setFontSize(14);
    doc.text("Scores", 20, 65);
    doc.setFontSize(11);
    doc.text(`Apprentissages : ${eleve.score_apprentissages ?? "—"}`, 20, 75);
    doc.text(`Comportement : ${eleve.score_comportement ?? "—"}`, 20, 83);
    doc.text(`Développement : ${eleve.score_developpement ?? "—"}`, 20, 91);
    doc.text(`Contexte : ${eleve.score_contexte ?? "—"}`, 20, 99);

    let y = 113;
    if (eleve.hypotheses?.length) {
      doc.setFontSize(14);
      doc.text("Hypothèses", 20, y); y += 10;
      doc.setFontSize(11);
      eleve.hypotheses.forEach((h) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(`• ${h}`, 20, y); y += 8;
      });
    }

    y += 6;
    if (eleve.recommandations?.length) {
      doc.setFontSize(14);
      doc.text("Recommandations", 20, y); y += 10;
      doc.setFontSize(11);
      eleve.recommandations.forEach((r) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(`• ${r}`, 20, y); y += 8;
      });
    }

    doc.save(`${title}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!eleve) {
    return (
      <div className="min-h-screen bg-background pb-16">
        <HamburgerMenu />
        <ScreenLayout title="Détail élève">
          <div className="text-center py-12 text-muted-foreground">Élève introuvable.</div>
        </ScreenLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <HamburgerMenu />
      <ScreenLayout title="Détail élève">
        <div className="max-w-md mx-auto space-y-6" style={{ padding: 20 }}>

          {/* Header élève */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl bg-primary/10 border border-primary/20 space-y-1"
          >
            <h2 className="text-xl font-bold text-foreground">{eleve.prenom} {eleve.nom}</h2>
            <p className="text-sm text-muted-foreground">Classe : {eleve.classe || "—"}</p>
            <p className="text-sm text-muted-foreground">Âge : {eleve.age ? `${eleve.age} ans` : "—"}</p>
            {eleve.date && (
              <p className="text-sm text-muted-foreground">Date : {eleve.date}</p>
            )}
          </motion.div>

          {/* Scores */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-xl bg-card border border-border"
          >
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Scores</h3>
            <ScoreRow label="Apprentissages" value={eleve.score_apprentissages} />
            <ScoreRow label="Comportement" value={eleve.score_comportement} />
            <ScoreRow label="Développement" value={eleve.score_developpement} />
            <ScoreRow label="Contexte" value={eleve.score_contexte} />
          </motion.div>

          {/* Hypothèses */}
          {eleve.hypotheses?.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Hypothèses</h3>
              {eleve.hypotheses.map((h, i) => <ItemCard key={i} text={h} index={i} color="primary" />)}
            </section>
          )}

          {/* Recommandations */}
          {eleve.recommandations?.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recommandations</h3>
              {eleve.recommandations.map((r, i) => <ItemCard key={i} text={r} index={i} color="accent" />)}
            </section>
          )}

          {/* Boutons */}
          <div className="space-y-3 pt-2">
            <Button onClick={handleExportPDF} className="w-full gap-2 bg-primary hover:bg-primary/90">
              <Download className="w-4 h-4" />
              Exporter en PDF
            </Button>
            <Button onClick={() => navigate("/liste-eleves")} variant="outline" className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
          </div>

        </div>
      </ScreenLayout>
    </div>
  );
}