import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import { exportFullPDF } from "@/lib/pdfExport";
import { useDiagnostic } from "@/lib/DiagnosticContext";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";

const COLORS = ["#4A90E2", "#1A1A1A", "#22d3ee", "#facc15", "#f472b6", "#a3e635", "#f97316"];

function StatCard({ title, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-card border border-border rounded-xl p-6 shadow-soft"
    >
      <h2 className="text-base font-semibold text-foreground mb-5">{title}</h2>
      {children}
    </motion.div>
  );
}

export default function StatsAnnuelles() {
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const { eleve, selections, crossRecommendations } = useDiagnostic();

  useEffect(() => {
    base44.entities.Diagnostic.list("-created_date", 500)
      .then(setDiagnostics)
      .finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    exportFullPDF(eleve, selections, crossRecommendations, diagnostics);
  };

  // --- stats_hypotheses : nombre de sélections par catégorie ---
  const statsHypotheses = (() => {
    const counts = {};
    diagnostics.forEach((d) => {
      const selections = d.selections || {};
      Object.entries(selections).forEach(([cat, items]) => {
        if (Array.isArray(items) && items.length > 0) {
          counts[cat] = (counts[cat] || 0) + items.length;
        }
      });
    });
    return Object.entries(counts).map(([name, total]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      total,
    }));
  })();

  // --- stats_orientations : types d'analyses les plus fréquentes ---
  const statsOrientations = (() => {
    const counts = {};
    diagnostics.forEach((d) => {
      const selections = d.selections || {};
      Object.values(selections).forEach((items) => {
        if (Array.isArray(items)) {
          items.forEach((item) => {
            const key = item.analysisType || "Non défini";
            counts[key] = (counts[key] || 0) + 1;
          });
        }
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name, value]) => ({ name, value }));
  })();

  // --- stats_evolution : diagnostics créés par mois ---
  const statsEvolution = (() => {
    const months = {};
    diagnostics.forEach((d) => {
      const date = new Date(d.created_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([mois, diagnostics]) => ({ mois, diagnostics }));
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HamburgerMenu />
      <ScreenLayout title="📊 Statistiques annuelles">
        <div className="space-y-6">
          <Button onClick={handleExport} variant="outline" className="w-full gap-2">
            <Download className="w-4 h-4" />
            Exporter le rapport PDF complet
          </Button>

          {/* Bar chart — hypothèses par catégorie */}
          <StatCard title="Hypothèses par catégorie" delay={0}>
            {statsHypotheses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune donnée disponible</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={statsHypotheses} margin={{ top: 4, right: 16, left: -10, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                  />
                  <Bar dataKey="total" fill="#4A90E2" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </StatCard>

          {/* Pie chart — orientations / types d'analyses */}
          <StatCard title="Répartition des types d'analyses" delay={0.1}>
            {statsOrientations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune donnée disponible</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statsOrientations}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {statsOrientations.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </StatCard>

          {/* Line chart — évolution des diagnostics dans le temps */}
          <StatCard title="Évolution des diagnostics (12 derniers mois)" delay={0.2}>
            {statsEvolution.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune donnée disponible</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={statsEvolution} margin={{ top: 4, right: 16, left: -10, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diagnostics"
                    stroke="#4A90E2"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#4A90E2" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </StatCard>

        </div>
      </ScreenLayout>
    </div>
  );
}