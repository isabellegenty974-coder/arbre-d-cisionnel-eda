import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import { exportStatsPDF } from "@/lib/statsExport";
import { Button } from "@/components/ui/button";
import {
  Download, Users, ClipboardList, TrendingUp, BookOpen,
  Brain, Heart, TreePine, ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, Cell, AreaChart, Area, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";

const DOMAIN_CONFIG = {
  Apprentissages: { color: "#4A90E2", icon: BookOpen, light: "#E8F0FB" },
  Comportement:   { color: "#EC6B8A", icon: Heart,    light: "#FCE8EE" },
  Développement:  { color: "#34C48A", icon: Brain,    light: "#E4F8F0" },
  Contexte:       { color: "#F59E0B", icon: TreePine, light: "#FEF3DC" },
};

const PROF_COLORS = { 'MaDP': '#4A90E2', 'MaDR': '#EC6B8A', 'Psy EN EDA': '#34C48A' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0F172A] rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold text-white mb-0.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill || '#D4A574' }} className="font-medium">
          {p.value} {p.name || 'occ.'}
        </p>
      ))}
    </div>
  );
};

function SectionCard({ title, subtitle, icon: Icon, accentColor = "#D4A574", children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="bg-white rounded-3xl border-2 border-[#E8DCC8] shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E8DCC8]" style={{ background: 'linear-gradient(135deg, #FAFAF8 0%, #F5F0E8 100%)' }}>
        {Icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accentColor}20` }}>
            <Icon className="w-5 h-5" style={{ color: accentColor }} />
          </div>
        )}
        <div>
          <h2 className="font-bold text-[#0F172A] text-sm">{title}</h2>
          {subtitle && <p className="text-xs text-[#0F172A]/60 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

function EmptyState({ text = "Aucune donnée disponible" }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2">
      <div className="w-10 h-10 rounded-full bg-[#F5F0E8] flex items-center justify-center">
        <ClipboardList className="w-5 h-5 text-[#0F172A]/40" />
      </div>
      <p className="text-sm text-[#0F172A]/50">{text}</p>
    </div>
  );
}

export default function StatsAnnuelles() {
  const [diagnostics, setDiagnostics] = useState([]);
  const [fiches, setFiches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [selectedEcole, setSelectedEcole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      base44.entities.Diagnostic.list("-created_date", 500),
      base44.entities.FicheEleve.list("-created_date", 500),
    ]).then(([diags, fich]) => {
      setDiagnostics(diags);
      setFiches(fich);
    }).finally(() => setLoading(false));
  }, []);

  // Filtre par profession
  const filteredByProf = selectedProfession
    ? diagnostics.filter(d => d.createdByProfession === selectedProfession)
    : diagnostics;

  // Filtre par école (jointure via les fiches)
  const ecoleMap = new Map(fiches.map(f => [`${f.prenom}|${f.nom}`.toLowerCase(), f.ecole || '']));
  const ecoles = [...new Set(fiches.map(f => f.ecole).filter(Boolean))].sort();
  const filteredDiagnostics = selectedEcole
    ? filteredByProf.filter(d => ecoleMap.get(`${d.eleve_prenom}|${d.eleve_nom}`.toLowerCase()) === selectedEcole)
    : filteredByProf;
  const filteredFiches = selectedEcole ? fiches.filter(f => f.ecole === selectedEcole) : fiches;

  // KPIs
  const nbEleves = new Set(filteredDiagnostics.map(d => `${d.eleve_prenom}|${d.eleve_nom}`)).size;
  const nbDiagnostics = filteredDiagnostics.length;
  const nbItems = filteredDiagnostics.reduce((acc, d) => {
    ['apprentissages','comportement','developpement','contexte'].forEach(cat => {
      acc += (d.selections?.[cat] || []).length;
    });
    return acc;
  }, 0);
  const avgItemsPerDiag = nbDiagnostics > 0 ? Math.round(nbItems / nbDiagnostics) : 0;

  // Élèves par profession
  const nbElevesParProf = (prof) =>
    new Set(diagnostics.filter(d => d.createdByProfession === prof).map(d => `${d.eleve_prenom}|${d.eleve_nom}`)).size;

  // Élèves par domaine
  const elevesParDomaine = (() => {
    const domains = [
      { name: 'Apprentissages', key: 'apprentissages' },
      { name: 'Comportement',   key: 'comportement' },
      { name: 'Développement',  key: 'developpement' },
      { name: 'Contexte',       key: 'contexte' },
    ];
    return domains.map(({ name, key }) => ({
      name,
      value: new Set(
        filteredDiagnostics
          .filter(d => (d.selections?.[key] || []).length > 0)
          .map(d => `${d.eleve_prenom}|${d.eleve_nom}`)
      ).size,
    })).filter(d => d.value > 0);
  })();

  // Domaines (items)
  const domaines = (() => {
    const counts = { Apprentissages: 0, Comportement: 0, Développement: 0, Contexte: 0 };
    filteredDiagnostics.forEach(d => {
      counts.Apprentissages += (d.selections?.apprentissages || []).length;
      counts.Comportement   += (d.selections?.comportement   || []).length;
      counts.Développement  += (d.selections?.developpement  || []).length;
      counts.Contexte       += (d.selections?.contexte       || []).length;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  })();

  const totalDomainItems = domaines.reduce((a, d) => a + d.value, 0);

  // Top items
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
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, total]) => ({ name: name.length > 40 ? name.slice(0, 40) + '…' : name, total }));
  })();

  // Evolution mensuelle
  const evolution = (() => {
    const months = {};
    filteredDiagnostics.forEach(d => {
      const date = new Date(d.created_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = new Date(date.getFullYear(), date.getMonth(), 1)
        .toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      months[key] = { mois: label, total: (months[key]?.total || 0) + 1 };
    });
    return Object.entries(months)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([, v]) => v);
  })();

  // Répartition par profession
  const profBreakdown = (() => {
    const counts = {};
    diagnostics.forEach(d => {
      const p = d.createdByProfession || 'Non renseigné';
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  // Répartition par école
  const ecoleBreakdown = (() => {
    const counts = {};
    fiches.forEach(f => {
      const e = f.ecole || 'Non renseignée';
      counts[e] = (counts[e] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  })();

  // Répartition classes (filtrée par école)
  const classeBreakdown = (() => {
    const counts = {};
    filteredFiches.forEach(f => {
      const c = f.classe || 'Non renseignée';
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#E8DCC8] border-t-[#D4A574] rounded-full animate-spin" />
      </div>
    );
  }

  const professions = ['MaDP', 'MaDR', 'Psy EN EDA'];

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-24">
      <HamburgerMenu />

      {/* Header */}
      <div className="bg-[#0F172A] px-5 pt-12 pb-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-white font-bold text-2xl">Statistiques</h1>
              <p className="text-white/60 text-sm mt-1">Tableau de bord analytique RASED</p>
            </div>
            <Button
              onClick={() => exportStatsPDF(filteredDiagnostics, topItems, domaines, evolution, selectedProfession)}
              disabled={filteredDiagnostics.length === 0}
              className="gap-2 bg-[#D4A574] hover:bg-[#C49464] text-[#0F172A] font-semibold border-0"
            >
              <Download className="w-4 h-4" /> Exporter PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Filtre profession */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedProfession(null)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedProfession === null
                ? 'bg-[#0F172A] text-white shadow'
                : 'bg-white text-[#0F172A] border border-[#E8DCC8] hover:border-[#D4A574]'
            }`}
          >
            Toute l'équipe <span className="opacity-60">({diagnostics.length})</span>
          </button>
          {professions.map(prof => {
            const count = diagnostics.filter(d => d.createdByProfession === prof).length;
            if (count === 0) return null;
            return (
              <button
                key={prof}
                onClick={() => setSelectedProfession(prof)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedProfession === prof
                    ? 'text-white shadow'
                    : 'bg-white text-[#0F172A] border border-[#E8DCC8] hover:border-[#D4A574]'
                }`}
                style={selectedProfession === prof ? { background: PROF_COLORS[prof] || '#0F172A' } : {}}
              >
                {prof} <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </motion.div>

        {/* Filtre école */}
        {ecoles.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }} className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[#0F172A]/60">École :</span>
            <select
              value={selectedEcole || ''}
              onChange={e => setSelectedEcole(e.target.value || null)}
              className="h-8 rounded-xl border border-[#E8DCC8] bg-white text-xs font-semibold text-[#0F172A] px-3 focus:outline-none focus:ring-1 focus:ring-[#D4A574]"
            >
              <option value="">Toutes les écoles</option>
              {ecoles.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            {selectedEcole && (
              <button onClick={() => setSelectedEcole(null)} className="text-xs text-[#D4A574] hover:underline">× Effacer</button>
            )}
          </motion.div>
        )}

        {/* KPIs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 gap-3"
        >
          {[
            { label: "Élèves suivis", value: nbEleves, icon: Users, color: "#4A90E2", light: "#E8F0FB" },
            { label: "Bilantés par Psy EN EDA", value: nbElevesParProf('Psy EN EDA'), icon: Brain, color: "#8B5CF6", light: "#F0EBFD" },
            { label: "Bilantés par MaDP", value: nbElevesParProf('MaDP'), icon: BookOpen, color: "#4A90E2", light: "#E8F0FB" },
            { label: "Bilantés par MaDR", value: nbElevesParProf('MaDR'), icon: Heart, color: "#EC6B8A", light: "#FCE8EE" },
          ].map(({ label, value, icon: Icon, color, light }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.07 + i * 0.04 }}
              className="bg-white rounded-2xl border-2 border-[#E8DCC8] p-4 flex flex-col gap-2"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: light }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
              <p className="text-xs text-[#0F172A]/60 font-medium leading-tight">{label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Élèves par problématique */}
        <SectionCard title="Élèves par problématique" subtitle="Nombre d'élèves distincts ayant des difficultés dans chaque domaine" icon={Users} accentColor="#D4A574" delay={0.09}>
          {elevesParDomaine.length === 0 ? <EmptyState /> : (
            <div className="space-y-3">
              {[...elevesParDomaine].sort((a,b) => b.value - a.value).map(({ name, value }) => {
                const conf = DOMAIN_CONFIG[name] || {};
                const DomIcon = conf.icon || ClipboardList;
                const maxVal = Math.max(...elevesParDomaine.map(d => d.value));
                const pct = maxVal > 0 ? Math.round((value / maxVal) * 100) : 0;
                return (
                  <div key={name} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: conf.light || '#F5F0E8' }}>
                      <DomIcon className="w-4 h-4" style={{ color: conf.color || '#D4A574' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-[#0F172A]">{name}</span>
                        <span className="text-xs font-bold" style={{ color: conf.color }}>{value} élève{value > 1 ? 's' : ''}</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#F5F0E8] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, delay: 0.2 }}
                          className="h-full rounded-full"
                          style={{ background: conf.color }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Domaines — observations */}
        <SectionCard title="Observations par domaine" subtitle="Nombre d'items sélectionnés" icon={Brain} delay={0.1}>
          {domaines.length === 0 ? <EmptyState /> : (
            <div className="space-y-3">
              {[...domaines].sort((a,b) => b.value - a.value).map(({ name, value }) => {
                const conf = DOMAIN_CONFIG[name] || {};
                const pct = totalDomainItems > 0 ? Math.round((value / totalDomainItems) * 100) : 0;
                const DomIcon = conf.icon || ClipboardList;
                return (
                  <div key={name} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: conf.light || '#F5F0E8' }}>
                      <DomIcon className="w-4 h-4" style={{ color: conf.color || '#D4A574' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-[#0F172A]">{name}</span>
                        <span className="text-xs font-bold" style={{ color: conf.color }}>{value} obs. · {pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#F5F0E8] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, delay: 0.2 }}
                          className="h-full rounded-full"
                          style={{ background: conf.color }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Répartition proportionnelle */}
        <SectionCard title="Répartition proportionnelle" subtitle="Vue circulaire des domaines" icon={TrendingUp} delay={0.13}>
          {domaines.length === 0 ? <EmptyState /> : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie data={domaines} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                    {domaines.map((entry) => (
                      <Cell key={entry.name} fill={DOMAIN_CONFIG[entry.name]?.color || '#D4A574'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2 w-full">
                {domaines.map(({ name, value }) => {
                  const conf = DOMAIN_CONFIG[name] || {};
                  const pct = totalDomainItems > 0 ? Math.round((value / totalDomainItems) * 100) : 0;
                  return (
                    <div key={name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: conf.color }} />
                      <span className="text-xs text-[#0F172A] flex-1">{name}</span>
                      <span className="text-xs font-bold text-[#0F172A]">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </SectionCard>

        {/* Top 10 */}
        <SectionCard title="Top 10 observations" subtitle="Items les plus souvent sélectionnés" icon={ClipboardList} delay={0.16}>
          {topItems.length === 0 ? <EmptyState /> : (
            <div className="space-y-2">
              {topItems.map(({ name, total }, i) => {
                const maxVal = topItems[0].total;
                const pct = Math.round((total / maxVal) * 100);
                const color = ['#4A90E2','#6366f1','#8b5cf6','#a855f7','#ec4899','#D4A574','#34C48A','#f59e0b','#EC6B8A','#22d3ee'][i];
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#0F172A]/40 w-5 shrink-0 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[#0F172A] truncate pr-2">{name}</span>
                        <span className="text-xs font-bold shrink-0" style={{ color }}>{total}×</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#F5F0E8] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: 0.2 + i * 0.04 }}
                          className="h-full rounded-full"
                          style={{ background: color }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Évolution mensuelle */}
        <SectionCard title="Évolution mensuelle" subtitle="Diagnostics réalisés par mois" icon={TrendingUp} accentColor="#4A90E2" delay={0.19}>
          {evolution.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={evolution} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4A90E2" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E8DA" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 10, fill: "#0F172A80" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#0F172A80" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" stroke="#4A90E2" strokeWidth={2.5} fill="url(#areaGrad)"
                  dot={{ r: 4, fill: "#4A90E2", strokeWidth: 0 }} activeDot={{ r: 6, fill: "#D4A574", strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        {/* Répartition par profession */}
        {profBreakdown.length > 0 && (
          <SectionCard title="Diagnostics par profession" subtitle="Activité de chaque membre de l'équipe" icon={Users} accentColor="#D4A574" delay={0.22}>
            <div className="space-y-3">
              {[...profBreakdown].sort((a,b) => b.value - a.value).map(({ name, value }) => {
                const total = diagnostics.length;
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                const color = PROF_COLORS[name] || '#D4A574';
                return (
                  <div key={name} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
                      <Users className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-[#0F172A] truncate pr-2">{name}</span>
                        <span className="text-xs font-bold" style={{ color }}>{value} diag. · {pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#F5F0E8] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, delay: 0.3 }}
                          className="h-full rounded-full"
                          style={{ background: color }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

        {/* Répartition par école */}
        {ecoleBreakdown.length > 0 && (
          <SectionCard title="Élèves par école" subtitle="Nombre de fiches élèves par établissement" icon={BookOpen} accentColor="#34C48A" delay={0.24}>
            <div className="space-y-3">
              {ecoleBreakdown.map(({ name, value }, i) => {
                const maxVal = ecoleBreakdown[0].value;
                const pct = maxVal > 0 ? Math.round((value / maxVal) * 100) : 0;
                const colors = ['#4A90E2','#34C48A','#D4A574','#EC6B8A','#8B5CF6','#F59E0B','#22d3ee','#6366f1','#a855f7','#ec4899'];
                const color = colors[i % colors.length];
                return (
                  <div key={name} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
                      <BookOpen className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-[#0F172A] truncate pr-2">{name}</span>
                        <span className="text-xs font-bold" style={{ color }}>{value} élève{value > 1 ? 's' : ''}</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#F5F0E8] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, delay: 0.2 + i * 0.04 }}
                          className="h-full rounded-full"
                          style={{ background: color }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

        {/* Répartition par classe */}
        {classeBreakdown.length > 0 && (
          <SectionCard title="Répartition par classe" subtitle="Fiches élèves par niveau" icon={BookOpen} accentColor="#34C48A" delay={0.25}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={classeBreakdown} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E8DA" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#0F172A80" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#0F172A80" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Élèves" radius={[6, 6, 0, 0]}>
                  {classeBreakdown.map((_, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? '#D4A574' : '#E8C4A0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        )}

      </div>
    </div>
  );
}