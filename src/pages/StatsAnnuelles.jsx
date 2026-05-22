import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import { exportFullPDF } from "@/lib/pdfExport";
import { exportStatsPDF } from "@/lib/statsExport";
import { useDiagnostic } from "@/lib/DiagnosticContext";
import { Button } from "@/components/ui/button";
import { Download, Users, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, Cell, LineChart, Line, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
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
    <div className="bg-foreground/95 rounded-xl px-3 py-2 shadow-lg text-xs border border-border/50">
      <p className="font-semibold text-white mb-0.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }} className="font-medium">
          {p.value} {typeof p.value === 'number' && p.value > 1 ? 'occ.' : 'occ.'}
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
      className="bg-gradient-to-br from-card to-card/80 border border-border/60 rounded-2xl overflow-hidden shadow-soft-md hover:shadow-soft-lg transition-shadow"
    >
      <div className="px-6 pt-6 pb-4 border-b border-border/40 bg-gradient-to-r from-transparent via-primary/5 to-transparent">
        <h2 className="font-bold text-foreground text-base">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      <div className="p-6">{children}</div>
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
  const [selectedProfession, setSelectedProfession] = useState(null);
  const { eleve, selections, crossRecommendations } = useDiagnostic();
  const navigate = useNavigate();

  useEffect(() => {
    base44.entities.Diagnostic.list("-created_date", 500)
      .then(setDiagnostics)
      .finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    if (filteredDiagnostics.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }
    exportStatsPDF(filteredDiagnostics, topItems, domaines, evolution, selectedProfession);
  };

  // Filtrer par profession si sélectionnée
  const filteredDiagnostics = selectedProfession 
    ? diagnostics.filter(d => d.createdByProfession === selectedProfession)
    : diagnostics;

  const nbEleves = new Set(filteredDiagnostics.map(d => `${d.eleve_prenom} ${d.eleve_nom}`)).size;
  const nbDiagnostics = filteredDiagnostics.length;
  const nbItems = (() => {
    let n = 0;
    filteredDiagnostics.forEach(d => {
      ['apprentissages','comportement','developpement','contexte'].forEach(cat => {
        n += (d.selections?.[cat] || []).length;
      });
    });
    return n;
  })();

  // Top items observés (horizontal bar)
  const topItems = (() => {
    const counts = {};
    filteredDiagnostics.forEach(d => {
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
    filteredDiagnostics.forEach(d => {
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
    filteredDiagnostics.forEach(d => {
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

          {/* Filtre par profession */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 flex-wrap"
          >
            <button
              onClick={() => setSelectedProfession(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedProfession === null
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              Tous ({diagnostics.length})
            </button>
            {['MaDP', 'MaDR', 'Psy EN EDA'].map(prof => {
              const count = diagnostics.filter(d => d.createdByProfession === prof).length;
              return (
                <button
                  key={prof}
                  onClick={() => setSelectedProfession(prof)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedProfession === prof
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  {prof} ({count})
                </button>
              );
            })}
          </motion.div>

          {/* KPIs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3 sm:gap-4"
          >
            {[
              { icon: Users, label: "Élèves", value: nbEleves, color: "from-blue-500 to-blue-600", textColor: "text-blue-600", bg: "bg-gradient-to-br from-blue-50 to-blue-100/50" },
              { icon: ClipboardList, label: "Diagnostics", value: nbDiagnostics, color: "from-violet-500 to-violet-600", textColor: "text-violet-600", bg: "bg-gradient-to-br from-violet-50 to-violet-100/50" },
              { icon: ClipboardList, label: "Items observés", value: nbItems, color: "from-emerald-500 to-emerald-600", textColor: "text-emerald-600", bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50" },
            ].map(({ icon: Icon, label, value, textColor, bg }) => (
              <motion.div
                key={label}
                whileHover={{ y: -4 }}
                className={`flex flex-col items-center justify-center gap-2 p-4 sm:p-5 rounded-2xl border border-border/50 ${bg} backdrop-blur-sm`}
              >
                <Icon className={`w-6 h-6 ${textColor}`} />
                <p className={`text-2xl sm:text-3xl font-bold ${textColor}`}>{value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground text-center font-medium">{label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Répartition par domaine */}
          <StatCard title="Répartition par domaine" subtitle="Distribution des observations" delay={0.1}>
            {domaines.filter(d => d.value > 0).length === 0 ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={domaines.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {domaines.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={Object.values(DOMAIN_COLORS)[index % 4]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </StatCard>

          {/* Top 10 items */}
          <StatCard title="Top 10 observations fréquentes" subtitle="Items les plus observés" delay={0.15}>
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
          <StatCard title="Évolution des diagnostics" subtitle="Tendance sur 12 mois" delay={0.2}>
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
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex flex-col sm:flex-row gap-3 pt-4"
          >
            <Button
              onClick={handleExport}
              disabled={filteredDiagnostics.length === 0}
              className="flex-1 gap-2 h-10 shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Exporter statistiques PDF
            </Button>
            <Button onClick={() => navigate("/dashboard")} variant="outline" className="flex-1 gap-2 h-10 hover:bg-secondary/80 transition-colors">
              <Users className="w-4 h-4" />
              Tableau de bord
            </Button>
          </motion.div>

        </div>
      </ScreenLayout>
    </div>
  );
}