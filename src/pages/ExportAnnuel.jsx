import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import { FileDown, ArrowLeft, Loader2, Users, Building2, TrendingDown, Activity, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { generateRapportAnnuel } from "@/lib/rapportAnnuelGenerator";

function currentAnneeScolaire() {
  const now = new Date();
  const m = now.getMonth();
  const y = now.getFullYear();
  return m >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

const MEMBRES = [
  { nom: 'Mme GENTY Isabelle',   role: "Psychologue de l'Éducation Nationale · EDA", color: '#1A3353', profession: 'Psy EN EDA' },
  { nom: 'Mme PETIT Laurence',   role: 'Maître à Dominante Relationnelle (MaDR)',     color: '#1E7A52', profession: 'MaDR' },
  { nom: 'Mme CARO Véronique',   role: 'Maître à Dominante Pédagogique (MaDP)',       color: '#B85C1A', profession: 'MaDP' },
];

export default function ExportAnnuel() {
  const navigate  = useNavigate();
  const libelle   = currentAnneeScolaire();
  const [loading,   setLoading]   = useState(true);
  const [exporting, setExporting] = useState(false);
  const [data,      setData]      = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.FicheEleve.list('-created_date', 1000),
      base44.entities.HistoriqueEDA.list('-date', 1000),
      base44.entities.EleveRased.list('-created_date', 500),
      base44.entities.EcoleRased.list('-nom', 100),
      base44.entities.AnneeScolaire.list('-libelle', 20),
    ]).then(([fiches, historique, eleves, ecoles, annees]) => {
      const fichesAnnee = fiches.filter(f => f.annee_scolaire === libelle);
      const anneeCourante = annees.find(a => a.libelle === libelle) || { libelle };

      const nbEleves    = fichesAnnee.length;
      const nbEcoles    = new Set(fichesAnnee.map(f => f.ecole).filter(Boolean)).size;
      const nbNouvelles = fichesAnnee.filter(f => f.statut === 'Nouveau').length;
      const nbClotures  = fichesAnnee.filter(f => f.statut === 'Clôturé').length;
      const nbSeances   = fichesAnnee.reduce((acc, f) => acc + (f.interventions || []).length, 0);

      // Répartition par école → classe
      const ecoleMap = {};
      fichesAnnee.forEach(f => {
        if (!f.ecole) return;
        if (!ecoleMap[f.ecole]) ecoleMap[f.ecole] = {};
        const cl = f.classe || 'Non renseignée';
        ecoleMap[f.ecole][cl] = (ecoleMap[f.ecole][cl] || 0) + 1;
      });

      setData({ fiches, historique, eleves, ecoles, annees, anneeCourante, libelle,
        fichesAnnee, overview: { nbEleves, nbEcoles, nbNouvelles, nbClotures, nbSeances }, ecoleMap });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    if (!data) return;
    setExporting(true);
    try {
      const doc = await generateRapportAnnuel({
        anneeScolaire: data.anneeCourante,
        fiches:        data.fiches,
        historique:    data.historique,
        eleves:        data.eleves,
        ecoles:        data.ecoles,
      });
      doc.save(`Rapport_RASED_${libelle}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F0F3F8', fontFamily: 'Inter, sans-serif', paddingBottom: 100 }}>
      <HamburgerMenu />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ background: '#1A3353', padding: '0 20px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 0 18px' }}>
          <button onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,.6)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, marginBottom: 14 }}>
            <ArrowLeft size={14} /> Tableau de bord
          </button>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.45)', marginBottom: 5 }}>
            Rapport annuel
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
            Export annuel · Suivis RASED
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', marginTop: 4 }}>
            Circonscription de La Possession · Année scolaire {libelle}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 12, color: '#566880', fontSize: 14 }}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            Chargement des données…
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* ── SECTION 1 — VUE D'ENSEMBLE ── */}
            <div style={{ background: '#fff', borderRadius: 18, padding: 20, boxShadow: '0 2px 16px rgba(0,0,0,.06)' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#566880', marginBottom: 14 }}>
                Section 1 — Vue d'ensemble
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  { label: 'Élèves suivis',           value: data.overview.nbEleves,    icon: Users,       color: '#3B82C4', bg: '#EAF2FB' },
                  { label: 'Écoles concernées',        value: data.overview.nbEcoles,    icon: Building2,   color: '#1E7A52', bg: '#E4F4ED' },
                  { label: 'Nouvelles demandes',       value: data.overview.nbNouvelles, icon: Activity,    color: '#5B3FA6', bg: '#EEE9FF' },
                  { label: 'Suivis clôturés',          value: data.overview.nbClotures,  icon: TrendingDown,color: '#B85C1A', bg: '#FEF0E4' },
                  { label: 'Séances & interventions',  value: data.overview.nbSeances,   icon: Calendar,    color: '#1A3353', bg: '#F0F3F8' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} style={{ background: bg, borderRadius: 12, padding: '14px 10px', textAlign: 'center' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                      <Icon size={15} style={{ color }} />
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color, marginBottom: 4 }}>{value}</div>
                    <div style={{ fontSize: 10, color: '#566880', lineHeight: 1.3 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── SECTION 2 — PAR ÉCOLE ET PAR CLASSE ── */}
            {Object.keys(data.ecoleMap).length > 0 && (
              <div style={{ background: '#fff', borderRadius: 18, padding: 20, boxShadow: '0 2px 16px rgba(0,0,0,.06)' }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#566880', marginBottom: 14 }}>
                  Section 2 — Par école et par classe
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Object.entries(data.ecoleMap).sort((a, b) => {
                    const totalA = Object.values(a[1]).reduce((s, v) => s + v, 0);
                    const totalB = Object.values(b[1]).reduce((s, v) => s + v, 0);
                    return totalB - totalA;
                  }).map(([ecole, classes]) => {
                    const total = Object.values(classes).reduce((s, v) => s + v, 0);
                    return (
                      <div key={ecole} style={{ borderRadius: 10, border: '1px solid #E8EDF5', overflow: 'hidden' }}>
                        <div style={{ background: '#F8FAFD', padding: '9px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#182840' }}>{ecole}</span>
                          <span style={{ fontSize: 11.5, color: '#3B82C4', fontWeight: 600 }}>{total} élève{total > 1 ? 's' : ''}</span>
                        </div>
                        {Object.entries(classes).sort((a, b) => b[1] - a[1]).map(([classe, nb]) => (
                          <div key={classe} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 14px', borderTop: '1px solid #F0F3F8', fontSize: 12.5, color: '#566880' }}>
                            <span>{classe}</span>
                            <span style={{ fontWeight: 600, color: '#182840' }}>{nb}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── SECTION 3 — SÉANCES PAR MEMBRE ── */}
            <div style={{ background: '#fff', borderRadius: 18, padding: 20, boxShadow: '0 2px 16px rgba(0,0,0,.06)' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#566880', marginBottom: 4 }}>
                Section 3 — Séances par membre
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 14 }}>Détail complet des actes dans le rapport PDF</div>
              {MEMBRES.map(({ nom, role, color, profession }) => {
                const actes = data.fichesAnnee.flatMap(f =>
                  (f.interventions || []).filter(iv => iv.profession === profession)
                );
                return (
                  <div key={nom} style={{ borderRadius: 10, border: `1px solid ${color}30`, padding: '12px 14px', marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color }}>{nom}</div>
                        <div style={{ fontSize: 11, color: '#566880', marginTop: 2 }}>{role}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color }}>{actes.length}</div>
                        <div style={{ fontSize: 10, color: '#566880' }}>acte{actes.length > 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── SECTIONS 4-6 : aperçu ── */}
            <div style={{ background: '#F8FAFD', borderRadius: 14, padding: '14px 18px', border: '1px dashed #D8E1EE', fontSize: 12.5, color: '#566880', lineHeight: 1.7 }}>
              Le rapport PDF inclut également :<br />
              <strong style={{ color: '#182840' }}>Section 4</strong> — Répartition par cycle (C1 / C2 / C3) × type de difficulté<br />
              <strong style={{ color: '#182840' }}>Section 5</strong> — Évolution mensuelle des interventions<br />
              <strong style={{ color: '#182840' }}>Section 6</strong> — Page de signatures
            </div>

            {/* ── BOUTON EXPORT ── */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleExport}
              disabled={exporting}
              style={{
                width: '100%', padding: '15px', background: '#1A3353', color: '#fff',
                border: 'none', borderRadius: 14, cursor: exporting ? 'not-allowed' : 'pointer',
                fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 10, opacity: exporting ? 0.7 : 1,
              }}
            >
              {exporting
                ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Génération du rapport…</>
                : <><FileDown size={18} /> Exporter le rapport PDF complet</>
              }
            </motion.button>

            <p style={{ fontSize: 11.5, color: '#94A3B8', textAlign: 'center', marginTop: 2 }}>
              Rapport A4 complet · Graphiques · Analyses qualitatives · Signatures
            </p>

          </motion.div>
        )}
      </div>
    </div>
  );
}
