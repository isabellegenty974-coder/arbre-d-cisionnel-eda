import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader, ArrowLeft, Search, Clock, Info, ClipboardList, Plus, Trash2, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PhotoEEUpload from '@/components/PhotoEEUpload';
import RapportContent from '@/components/RapportContent';
import IntervenantsSection from '@/components/rased/IntervenantsSection';
import NotesMembreSection from '@/components/rased/NotesMembreSection';
import ReportExportModal from '@/components/rased/ReportExportModal';
import { usePresence } from '@/lib/usePresence';
import { generateReport, downloadReport } from '@/lib/reportGenerator';
import { jsPDF } from 'jspdf';

const PROF_COLOR  = { 'Psy EN EDA': '#3B82C4', 'MaDR': '#1E7A52', 'MaDP': '#B85C1A' };
const PROF_BG     = { 'Psy EN EDA': '#EAF2FB', 'MaDR': '#E4F4ED', 'MaDP': '#FEF0E4' };
const PROF_TEXT   = { 'Psy EN EDA': '#254D7A', 'MaDR': '#1E7A52', 'MaDP': '#B85C1A' };
const PROF_LABEL  = { 'Psy EN EDA': 'Psychologue de l\'Éducation Nationale · Spécialité EDA', 'MaDR': 'Maître à Dominante Relationnelle (MaDR)', 'MaDP': 'Maître à Dominante Pédagogique (MaDP)' };

const STATUT_CFG = {
  'Nouveau':      { ico: '🆕', lbl: 'Nouveau',     sub: 'Demande reçue',   pill: '#EAF2FB', pillT: '#3B82C4' },
  'Suivi actif':  { ico: '✅', lbl: 'Suivi actif',  sub: 'En cours',        pill: '#E4F4ED', pillT: '#1E7A52' },
  'En attente':   { ico: '⏳', lbl: 'En attente',   sub: 'Action à venir',  pill: '#FEF0E4', pillT: '#B85C1A' },
  'Clôturé':      { ico: '🏁', lbl: 'Clôturé',      sub: 'Suivi terminé',   pill: '#F0F3F8', pillT: '#566880' },
};

const TYPES_INTERVENTION = [
  'Équipe éducative','Observation en classe','Entretien élève',
  'Entretien avec la famille','Entretien avec l\'enseignant','Bilan / évaluation','Rééducation','Autre',
];

function initiales(prenom, nom) {
  return `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();
}

// ── Topbar ──────────────────────────────────────────────────────────────────
function Topbar({ fiche, ficheId, onHypotheses }) {
  return (
    <div style={{ background: '#1A3353', height: 52, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 30 }}>
      <Link to="/dashboard" style={{ color: 'rgba(255,255,255,.6)', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', flexShrink: 0 }}>
        <ArrowLeft size={14} /> Retour
      </Link>
      <span style={{ color: 'rgba(255,255,255,.2)' }}>/</span>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden', flex: 1, minWidth: 0 }}>
        {fiche.ecole && <><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fiche.ecole}</span><span style={{ color: 'rgba(255,255,255,.25)', flexShrink: 0 }}>›</span></>}
        {fiche.classe && <><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fiche.classe}</span><span style={{ color: 'rgba(255,255,255,.25)', flexShrink: 0 }}>›</span></>}
        <span style={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>{fiche.prenom} {fiche.nom}</span>
      </div>
      <button onClick={onHypotheses}
        style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, background: '#3B82C4', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
        🔍 Hypothèses
      </button>
    </div>
  );
}

// ── Hero ────────────────────────────────────────────────────────────────────
function HeroFiche({ fiche, activeTab, setActiveTab }) {
  const statut = fiche.statut || 'Nouveau';
  const sc = STATUT_CFG[statut] || STATUT_CFG['Nouveau'];
  const intervenants = fiche.intervenants || [];

  return (
    <div style={{ background: '#1A3353', padding: '20px 16px 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -40, top: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,196,.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Identity */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, paddingBottom: 18, position: 'relative', zIndex: 1 }}>
        <div style={{ width: 58, height: 58, borderRadius: 14, background: '#3B82C4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', flexShrink: 0, fontFamily: 'DM Serif Display, serif' }}>
          {initiales(fiche.prenom, fiche.nom)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: '#fff', lineHeight: 1.2, marginBottom: 8 }}>
            {fiche.prenom} {fiche.nom}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {fiche.date_naissance && (
              <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,.65)', background: 'rgba(255,255,255,.08)', padding: '2px 8px', borderRadius: 20 }}>
                🎂 {new Date(fiche.date_naissance).toLocaleDateString('fr-FR')}
                {fiche.age ? ` · ${fiche.age} ans` : ''}
              </span>
            )}
            {fiche.ecole && <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,.65)', background: 'rgba(255,255,255,.08)', padding: '2px 8px', borderRadius: 20 }}>🏫 {fiche.ecole}</span>}
            {fiche.classe && <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,.65)', background: 'rgba(255,255,255,.08)', padding: '2px 8px', borderRadius: 20 }}>📚 {fiche.classe}</span>}
            <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: sc.pill, color: sc.pillT }}>
              <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'currentColor', marginRight: 4, verticalAlign: 'middle' }} />
              {sc.lbl}
            </span>
          </div>
          {intervenants.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,.4)' }}>Intervenants :</span>
              {intervenants.map((iv, i) => {
                const bg = PROF_COLOR[iv.profession] || '#3B82C4';
                const init = `${iv.nom?.split(' ')[0]?.[0] || ''}${iv.nom?.split(' ')[1]?.[0] || ''}`.toUpperCase();
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 20, padding: '3px 8px 3px 4px' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff' }}>{init || iv.nom?.[0]}</div>
                    <div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.75)' }}>{iv.nom}</div>
                      <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,.4)' }}>{PROF_LABEL[iv.profession] || iv.profession}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,.08)', marginTop: 2 }}>
        {[
          { key: 'suivi',      label: '📋 Suivi' },
          { key: 'hypotheses', label: '🔍 Hypothèses' },
          { key: 'historique', label: '🕐 Historique' },
          { key: 'infos',      label: 'ℹ️ Infos' },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ padding: '10px 14px', fontSize: 12.5, fontWeight: activeTab === t.key ? 600 : 400, color: activeTab === t.key ? '#fff' : 'rgba(255,255,255,.5)', cursor: 'pointer', background: 'none', border: 'none', borderBottom: activeTab === t.key ? '2px solid #3B82C4' : '2px solid transparent', whiteSpace: 'nowrap', transition: 'all .14s' }}>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Card wrapper ─────────────────────────────────────────────────────────────
function Card({ children, style }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #D8E1EE', borderRadius: 12, overflow: 'hidden', ...style }}>
      {children}
    </div>
  );
}

function CardHead({ icon, title, action, onAction }) {
  return (
    <div style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #D8E1EE' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#182840', display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ fontSize: 15 }}>{icon}</span> {title}
      </div>
      {action && (
        <button onClick={onAction} style={{ fontSize: 12, color: '#3B82C4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
          {action}
        </button>
      )}
    </div>
  );
}

// ── Onglet Suivi ──────────────────────────────────────────────────────────────
function TabSuivi({ fiche, ficheId, setFiche, interventions, setInterventions, user }) {
  const [statut, setStatut] = useState(fiche.statut || 'Nouveau');
  const [savingStatut, setSavingStatut] = useState(false);
  const [addingIntervention, setAddingIntervention] = useState(false);
  const [newIntervention, setNewIntervention] = useState({ date: '', type: 'Équipe éducative', profession: 'Psy EN EDA', description: '' });
  const [showRapport, setShowRapport] = useState(false);

  const handleSaveStatut = async () => {
    setSavingStatut(true);
    await base44.entities.FicheEleve.update(ficheId, { statut });
    setFiche(f => ({ ...f, statut }));
    setSavingStatut(false);
  };

  const addIntervention = async () => {
    if (!newIntervention.date) return;
    const updated = [...interventions, newIntervention];
    await base44.entities.FicheEleve.update(ficheId, { interventions: updated });
    setFiche(f => ({ ...f, interventions: updated }));
    setInterventions(updated);
    setNewIntervention({ date: '', type: 'Équipe éducative', profession: 'Psy EN EDA', description: '' });
    setAddingIntervention(false);
  };

  const deleteIntervention = async (idx) => {
    const updated = interventions.filter((_, i) => i !== idx);
    await base44.entities.FicheEleve.update(ficheId, { interventions: updated });
    setFiche(f => ({ ...f, interventions: updated }));
    setInterventions(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Statut */}
      <Card>
        <CardHead icon="🔖" title="Statut du suivi" action={savingStatut ? 'Enregistrement…' : 'Enregistrer'} onAction={handleSaveStatut} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 14 }}>
          {Object.entries(STATUT_CFG).map(([key, cfg]) => (
            <div key={key} onClick={() => setStatut(key)}
              style={{ padding: '12px', borderRadius: 10, border: `1.5px solid ${statut === key ? '#3B82C4' : '#D8E1EE'}`, background: statut === key ? '#EAF2FB' : '#fff', cursor: 'pointer', textAlign: 'center', transition: 'all .14s' }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{cfg.ico}</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#182840' }}>{cfg.lbl}</div>
              <div style={{ fontSize: 11, color: '#566880', marginTop: 2 }}>{cfg.sub}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Motif */}
      {fiche.observations && (
        <Card>
          <CardHead icon="📌" title="Motif du signalement" />
          <div style={{ padding: '14px 16px', fontSize: 13.5, lineHeight: 1.65, color: '#182840', background: '#FAFBFD', borderLeft: '3px solid #3B82C4' }}>
            {fiche.observations}
          </div>
        </Card>
      )}

      {/* Photo EE */}
      <Card>
        <CardHead icon="📸" title="Synthèse EE (photo)" />
        <div style={{ padding: 14 }}>
          <PhotoEEUpload ficheId={ficheId} />
          {fiche.photo_ee_url && (
            <img src={fiche.photo_ee_url} alt="Photo EE" style={{ width: '100%', borderRadius: 8, marginTop: 10, maxHeight: 300, objectFit: 'cover' }} />
          )}
        </div>
      </Card>

      {/* Notes équipe */}
      <Card>
        <CardHead icon="💬" title="Notes de l'équipe" />
        <div style={{ padding: 14 }}>
          <NotesMembreSection ficheId={ficheId} />
        </div>
      </Card>

      {/* Intervenants */}
      <Card>
        <CardHead icon="👥" title="Intervenants RASED" />
        <div style={{ padding: 14 }}>
          <IntervenantsSection ficheId={ficheId} fichePrenomNom={`${fiche.prenom} ${fiche.nom}`} />
        </div>
      </Card>

      {/* Interventions */}
      <Card>
        <CardHead icon="📋" title="Interventions"
          action={addingIntervention ? undefined : '+ Ajouter'}
          onAction={() => setAddingIntervention(true)} />
        <div style={{ padding: 14 }}>
          {addingIntervention && (
            <div style={{ background: '#F8FAFD', borderRadius: 10, padding: 14, marginBottom: 14, border: '1px solid #D8E1EE', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Date', content: <input type="date" value={newIntervention.date} onChange={e => setNewIntervention({...newIntervention, date: e.target.value})} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid #D8E1EE', fontSize: 13, outline: 'none' }} /> },
                { label: 'Type', content: <select value={newIntervention.type} onChange={e => setNewIntervention({...newIntervention, type: e.target.value})} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid #D8E1EE', fontSize: 13, outline: 'none', background: '#fff' }}>{TYPES_INTERVENTION.map(t => <option key={t}>{t}</option>)}</select> },
                { label: 'Profession', content: <select value={newIntervention.profession} onChange={e => setNewIntervention({...newIntervention, profession: e.target.value})} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid #D8E1EE', fontSize: 13, outline: 'none', background: '#fff' }}><option>Psy EN EDA</option><option>MaDR</option><option>MaDP</option></select> },
                { label: 'Description', content: <textarea value={newIntervention.description} onChange={e => setNewIntervention({...newIntervention, description: e.target.value})} placeholder="Décrivez l'intervention…" style={{ width: '100%', minHeight: 80, padding: '8px 10px', borderRadius: 7, border: '1px solid #D8E1EE', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box' }} /> },
              ].map(({ label, content }) => (
                <div key={label}>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: '#566880', display: 'block', marginBottom: 5 }}>{label}</label>
                  {content}
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setAddingIntervention(false)} style={{ padding: '7px 14px', fontSize: 12.5, borderRadius: 7, background: 'transparent', border: '1px solid #D8E1EE', cursor: 'pointer', color: '#566880' }}>Annuler</button>
                <button onClick={addIntervention} disabled={!newIntervention.date} style={{ padding: '7px 14px', fontSize: 12.5, borderRadius: 7, background: '#1A3353', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, opacity: !newIntervention.date ? 0.5 : 1 }}>Ajouter</button>
              </div>
            </div>
          )}
          {interventions.length === 0 && !addingIntervention && (
            <p style={{ fontSize: 13, color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>Aucune intervention enregistrée</p>
          )}
          {interventions.map((iv, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: idx < interventions.length - 1 ? '1px solid #F0F3F8' : 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: '#566880' }}>{new Date(iv.date).toLocaleDateString('fr-FR')}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, padding: '1px 7px', borderRadius: 8, background: PROF_BG[iv.profession] || '#F0F3F8', color: PROF_TEXT[iv.profession] || '#566880' }}>{PROF_LABEL[iv.profession] || iv.profession}</span>
                  {iv.type && <span style={{ fontSize: 10.5, padding: '1px 7px', borderRadius: 8, background: '#FEF0E4', color: '#B85C1A' }}>{iv.type}</span>}
                </div>
                {iv.description && <p style={{ fontSize: 13, color: '#182840', lineHeight: 1.5, margin: 0 }}>{iv.description}</p>}
              </div>
              <button onClick={() => deleteIntervention(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4, flexShrink: 0 }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Rapport */}
      {fiche.rapport && (
        <Card>
          <CardHead icon="📄" title="Rapport généré" />
          <div style={{ padding: '14px 16px', display: 'flex', gap: 10, justifyContent: 'space-between' }}>
            <p style={{ fontSize: 12.5, color: '#566880', lineHeight: 1.6, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', flex: 1 }}>
              {fiche.rapport.substring(0, 200)}…
            </p>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button onClick={() => setShowRapport(true)} style={{ fontSize: 12, color: '#3B82C4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}>
                Voir →
              </button>
              <button onClick={async () => {
                const userInfo = user || { full_name: fiche.createdByName, profession: fiche.createdByProfession };
                const doc = await generateReport({
                  type: 'synthese',
                  eleve: fiche,
                  motif: fiche.observations || '',
                  observations: fiche.rapport,
                  hypotheses: fiche.hypotheses || [],
                  actions: fiche.recommandations || [],
                  suites: 'À déterminer'
                }, { ...userInfo, profession: userInfo.profession || fiche.createdByProfession, full_name: userInfo.full_name || fiche.createdByName });
                downloadReport(doc, `Rapport_${fiche.prenom}_${fiche.nom}_${new Date().toISOString().split('T')[0]}.pdf`);
              }} style={{ fontSize: 12, color: '#1E7A52', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}>
                📥 PDF
              </button>
              <button onClick={async () => {
                if (confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
                  await base44.entities.FicheEleve.update(ficheId, { rapport: '' });
                  setFiche(f => ({ ...f, rapport: '' }));
                }
              }} style={{ fontSize: 12, color: '#B85C1A', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap', padding: '4px 6px', borderRadius: 4 }}
                onMouseEnter={e => e.currentTarget.style.background = '#FEF0E4'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                Supprimer
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Modal Rapport */}
      <AnimatePresence>
        {showRapport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
            onClick={() => setShowRapport(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 640, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #F0F3F8' }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#182840' }}>📋 Rapport — {fiche.prenom} {fiche.nom}</span>
                <button onClick={() => setShowRapport(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
                <RapportContent text={fiche.rapport} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Onglet Hypothèses ─────────────────────────────────────────────────────────
function TabHypotheses({ fiche, ficheId, navigate, historiqueEDA }) {
  const DOMAINE_ICO = { apprentissages: '📖', comportement: '🧠', developpement: '🌱', contexte: '🏠' };
  const DOMAINE_BG  = { apprentissages: '#EAF2FB', comportement: '#EEE9FF', developpement: '#E4F4ED', contexte: '#FEF0E4' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card>
        <CardHead icon="🔍" title="Hypothèses de travail formulées"
          action="+ Nouvelles hypothèses"
          onAction={() => navigate(`/hypotheses-eleve?id=${ficheId}`)} />

        {historiqueEDA.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#182840', marginBottom: 6 }}>Aucune hypothèse formulée</div>
            <div style={{ fontSize: 12.5, color: '#566880', marginBottom: 18 }}>Utilisez l'arbre décisionnel pour analyser les difficultés de {fiche.prenom}.</div>
            <button onClick={() => navigate(`/hypotheses-eleve?id=${ficheId}`)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 9, fontSize: 13.5, fontWeight: 700, background: '#1A3353', color: '#fff', border: 'none', cursor: 'pointer' }}>
              🔍 Formuler des hypothèses de travail
            </button>
          </div>
        ) : (
          historiqueEDA.map((h, i) => (
            <div key={h.id} style={{ padding: '16px', borderBottom: i < historiqueEDA.length - 1 ? '1px solid #F0F3F8' : 'none', display: 'flex', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, background: DOMAINE_BG[h.domaine] || '#F0F3F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {DOMAINE_ICO[h.domaine] || '🔍'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#182840', marginBottom: 2, textTransform: 'capitalize' }}>
                  {h.domaine} {h.sous_domaine ? `— ${h.sous_domaine}` : ''}
                </div>
                {h.hypotheses?.length > 0 && (
                  <div style={{ background: '#F0F3F8', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.07em', color: '#566880', fontWeight: 700, marginBottom: 6 }}>Hypothèses retenues</div>
                    {h.hypotheses.map((hyp, j) => (
                      <div key={j} style={{ fontSize: 12.5, color: '#182840', padding: '3px 0', display: 'flex', gap: 6 }}>
                        <span style={{ color: '#3B82C4', fontWeight: 700, flexShrink: 0 }}>·</span>
                        {hyp}
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: '#566880' }}>📅 {new Date(h.date || h.created_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </Card>

      {/* Explorer autres domaines */}
      <Card>
        <CardHead icon="🌐" title="Explorer un autre domaine" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 14 }}>
          {[
            { ico: '📖', lbl: 'Apprentissages', sub: 'Lecture, écriture, maths', to: '/apprentissage' },
            { ico: '🧠', lbl: 'Comportement',   sub: 'Anxiété, impulsivité',     to: '/comportement' },
            { ico: '🌱', lbl: 'Développement',  sub: 'Attention, langage',       to: '/developpement' },
            { ico: '🏠', lbl: 'Contexte',       sub: 'Famille, classe',          to: '/contexte' },
          ].map(d => (
            <Link key={d.to} to={`${d.to}?ficheId=${ficheId}&prenom=${fiche.prenom}`}
              style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #D8E1EE', borderRadius: 9, padding: '12px', cursor: 'pointer', textDecoration: 'none', transition: 'all .14s', background: '#fff' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#3B82C4'; e.currentTarget.style.background = '#EAF2FB'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#D8E1EE'; e.currentTarget.style.background = '#fff'; }}>
              <span style={{ fontSize: 22 }}>{d.ico}</span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#182840' }}>{d.lbl}</div>
                <div style={{ fontSize: 11, color: '#566880', marginTop: 2 }}>{d.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Onglet Historique ─────────────────────────────────────────────────────────
function TabHistorique({ fiche, interventions, historiqueEDA }) {
  const events = [
    ...interventions.map(iv => ({ date: new Date(iv.date), ico: '💬', type: 'note', title: `Intervention : ${iv.type || 'Action'}`, meta: iv.description })),
    ...historiqueEDA.map(h => ({ date: new Date(h.date || h.created_date), ico: '🔍', type: 'hyp', title: `Hypothèses de travail — ${h.domaine}`, meta: `${h.hypotheses?.length || 0} hypothèse(s) retenue(s)` })),
    { date: new Date(fiche.created_date), ico: '📄', type: 'imp', title: 'Fiche créée', meta: `${fiche.ecole || ''}${fiche.classe ? ' · ' + fiche.classe : ''}` },
  ].sort((a, b) => b.date - a.date);

  const DOT_BG = { note: '#E4F4ED', hyp: '#EAF2FB', stat: '#FEF0E4', imp: '#EEE9FF' };

  return (
    <Card>
      <CardHead icon="🕐" title="Fil chronologique" />
      <div style={{ padding: '10px 16px 16px' }}>
        {events.map((ev, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, padding: '10px 0', position: 'relative' }}>
            {i < events.length - 1 && <div style={{ position: 'absolute', left: 15, top: 34, bottom: -6, width: 1, background: '#D8E1EE' }} />}
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: DOT_BG[ev.type] || '#F0F3F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0, position: 'relative', zIndex: 1, border: '2px solid #fff' }}>
              {ev.ico}
            </div>
            <div style={{ flex: 1, paddingTop: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#182840', marginBottom: 2 }}>{ev.title}</div>
              {ev.meta && <div style={{ fontSize: 11.5, color: '#566880' }}>{ev.meta}</div>}
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{ev.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Onglet Infos ──────────────────────────────────────────────────────────────
function TabInfos({ fiche, ficheId, navigate, user }) {
  const [showReportModal, setShowReportModal] = useState(false);
  
  const InfoRow = ({ label, value }) => (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0F3F8' }}>
      <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.07em', color: '#566880', fontWeight: 600, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 500, color: value ? '#182840' : '#94A3B8', fontStyle: value ? 'normal' : 'italic' }}>{value || 'Non renseigné'}</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card>
        <CardHead icon="👤" title="Informations sur l'élève" action="✏️ Modifier" onAction={() => navigate(`/edit-eleve?id=${ficheId}`)} />
        <InfoRow label="Nom" value={fiche.nom?.toUpperCase()} />
        <InfoRow label="Prénom" value={fiche.prenom} />
        <InfoRow label="Date de naissance" value={fiche.date_naissance ? new Date(fiche.date_naissance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null} />
        <InfoRow label="Âge" value={fiche.age ? `${fiche.age} ans` : null} />
        <InfoRow label="École" value={fiche.ecole} />
        <InfoRow label="Classe" value={fiche.classe} />
        <InfoRow label="Créé par" value={fiche.createdByName} />
        <InfoRow label="Profession" value={fiche.createdByProfession} />
      </Card>

      <Card>
        <CardHead icon="📤" title="Exporter" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 14 }}>
          {[
            { ico: '📄', lbl: 'Rapport de suivi', sub: 'Générer un PDF officiel', action: () => setShowReportModal(true) },
            { ico: '📝', lbl: 'Hypothèses de travail',    sub: 'Lancer l\'analyse de situation', action: () => navigate(`/hypotheses-eleve?id=${ficheId}`) },
          ].map((opt, i) => (
            <div key={i} onClick={opt.action} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #D8E1EE', borderRadius: 9, padding: '12px', cursor: 'pointer', transition: 'all .14s', background: '#fff' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#3B82C4'; e.currentTarget.style.background = '#EAF2FB'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#D8E1EE'; e.currentTarget.style.background = '#fff'; }}>
              <span style={{ fontSize: 22 }}>{opt.ico}</span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#182840' }}>{opt.lbl}</div>
                <div style={{ fontSize: 11, color: '#566880', marginTop: 2 }}>{opt.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal d'export de rapport */}
      <ReportExportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        eleve={fiche}
        user={user}
        reportType="synthese"
      />
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function DetailFiche() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [fiche, setFiche] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('suivi');
  const [interventions, setInterventions] = useState([]);
  const [historiqueEDA, setHistoriqueEDA] = useState([]);
  const [user, setUser] = useState(null);

  const ficheId = searchParams.get('id');
  const { onFiche } = usePresence(ficheId);

  useEffect(() => {
    if (!ficheId) { setLoading(false); return; }
    Promise.all([
      base44.entities.FicheEleve.get(ficheId),
      base44.entities.HistoriqueEDA.filter({ eleve_id: ficheId }).catch(() => []),
      base44.auth.me().catch(() => null),
    ]).then(([ficheData, histo, userData]) => {
      setFiche(ficheData);
      setInterventions(ficheData?.interventions || []);
      setHistoriqueEDA(histo.sort((a, b) => new Date(b.date || b.created_date) - new Date(a.date || a.created_date)));
      setUser(userData);
    }).catch(() => setFiche(null)).finally(() => setLoading(false));
  }, [ficheId]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F3F8' }}>
      <Loader style={{ animation: 'spin 1s linear infinite', color: '#3B82C4' }} size={28} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!fiche) return (
    <div style={{ minHeight: '100vh', background: '#F0F3F8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <span style={{ fontSize: 36 }}>😕</span>
      <p style={{ fontSize: 15, color: '#566880' }}>Cette fiche n'existe pas.</p>
      <button onClick={() => navigate('/dashboard')} style={{ padding: '9px 20px', borderRadius: 9, background: '#1A3353', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Retour au tableau de bord</button>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#F0F3F8', minHeight: '100vh', paddingBottom: 80 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap');`}</style>

      <Topbar fiche={fiche} ficheId={ficheId} onHypotheses={() => navigate(`/hypotheses-eleve?id=${ficheId}`)} />
      <HeroFiche fiche={fiche} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px 14px 80px' }}>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {activeTab === 'suivi' && (
              <TabSuivi fiche={fiche} ficheId={ficheId} setFiche={setFiche} interventions={interventions} setInterventions={setInterventions} user={user} />
            )}
            {activeTab === 'hypotheses' && (
              <TabHypotheses fiche={fiche} ficheId={ficheId} navigate={navigate} historiqueEDA={historiqueEDA} />
            )}
            {activeTab === 'historique' && (
              <TabHistorique fiche={fiche} interventions={interventions} historiqueEDA={historiqueEDA} />
            )}
            {activeTab === 'infos' && (
              <TabInfos fiche={fiche} ficheId={ficheId} navigate={navigate} user={user} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}