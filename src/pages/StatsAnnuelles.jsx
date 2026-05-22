import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import { exportFullPDF } from "@/lib/pdfExport";
import { useDiagnostic } from "@/lib/DiagnosticContext";
import { Button } from "@/components/ui/button";
import { Download, Users, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";

const DOMAIN_COLORS = {
  Apprentissages: "#4A90E2",
  Comportement: "#f472b6",
  Développement: "#34d399",
  Contexte: "#f59e0b",
};

const BAR_COLORS = [
  "#4A90E2","#6366f1","#8b5cf6","#a855f7","#ec4899",
  "#f43f5e","#f97316","#f59e0b","#84cc16","#22d3ee",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-soft-md text-sm">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }} className="font-semibold">
          {p.value} occurrence{p.value > 1 ? "s" : ""}
        </p>
      ))}
    </div>
  );
};

function StatCard({ title, subtitle, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft"
    >
      <div className="px-5 pt-5 pb-3 border-b border-border/50">
        <h2 className="font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2">
      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
        <ClipboardList className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
    </div>
  );
}

export default function StatsAnnuelles() {
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const { eleve, selections, crossRecommendations } = useDiagnostic();
  const navigate = useNavigate();

  useEffect(() => {
    base44.entities.Diagnostic.list("-created_date", 500)
      .then(setDiagnostics)
      .finally(() => setLoading(false));
  }, []);

  const handleExport = () => exportFullPDF(eleve, selections, crossRecommendations, diagnostics);

  const nbEleves = new Set(diagnostics.map(d => `${d.eleve_prenom} ${d.eleve_nom}`)).size;
  const nbDiagnostics = diagnostics.length;
  const nbItems = (() => {
    let n = 0;
    diagnostics.forEach(d => {
      ['apprentissages','comportement','developpement','contexte'].forEach(cat => {
        n += (d.selections?.[cat] || []).length;
      });
    });
    return n;
  })();

  // Top items observés (horizontal bar)
  const topItems = (() => {
    const counts = {};
    diagnostics.forEach(d => {
      const sel = d.selections || {};
      ['apprentissages','comportement','developpement','contexte'].forEach(cat => {
        (sel[cat] || []).forEach(item => {
          const label = typeof item === 'string' ? item : item?.label;
          if (label) counts[label] = (counts[label] || 0) + 1;
        });
      });
      (sel._analyse?.hypotheses || []).forEach(h => { counts[h] = (counts[h] || 0) + 1; });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, total]) => ({ name: name.length > 36 ? name.slice(0, 36) + '…' : name, total }));
  })();

  // Répartition par domaine
  const domaines = (() => {
    const counts = { Apprentissages: 0, Comportement: 0, Développement: 0, Contexte: 0 };
    diagnostics.forEach(d => {
      const sel = d.selections || {};
      counts['Apprentissages'] += (sel.apprentissages || []).length;
      counts['Comportement']   += (sel.comportement   || []).length;
      counts['Développement']  += (sel.developpement  || []).length;
      counts['Contexte']       += (sel.contexte       || []).length;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  // Évolution mensuelle
  const evolution = (() => {
    const months = {};
    diagnostics.forEach(d => {
      const date = new Date(d.created_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([mois, total]) => ({ mois: mois.slice(5), total }));
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HamburgerMenu />
      <ScreenLayout title="📊 Statistiques">
        <div className="space-y-5">

          {/* KPIs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            {[
              { icon: Users, label: "Élèves", value: nbEleves, color: "text-primary", bg: "bg-primary/10" },
              { icon: ClipboardList, label: "Diagnostics", value: nbDiagnostics, color: "text-violet-500", bg: "bg-violet-500/10" },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className={`flex flex-col items-center gap-1 p-4 rounded-2xl border border-border ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground text-center">{label}</p>
              </div>
            ))}
          </motion.div>

          {/* Top 10 items */}
          <StatCard title="Top 10 observations les plus fréquentes" subtitle="Tous diagnostics confondus" delay={0.1}>
            {topItems.length === 0 ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={topItems.length * 36 + 20}>
                <BarChart
                  data={topItems}
                  layout="vertical"
                  margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
                  barCategoryGap="30%"
                >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={180}
                    tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--secondary))" }} />
                  <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                    {topItems.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </StatCard>

          {/* Évolution mensuelle */}
          <StatCard title="Évolution mensuelle" subtitle="12 derniers mois" delay={0.15}>
            {evolution.length === 0 ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={evolution} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#4A90E2"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#4A90E2", strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </StatCard>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button onClick={handleExport} className="flex-1 gap-2">
              <Download className="w-4 h-4" />
              Exporter PDF
            </Button>
            <Button onClick={() => navigate("/dashboard")} variant="outline" className="flex-1 gap-2">
              <Users className="w-4 h-4" />
              Mes élèves
            </Button>
          </div>

        </div>
      </ScreenLayout>
    </div>
  );
}