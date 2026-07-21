import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader, ArrowLeft, Search, Clock, Info, ClipboardList, Plus, Trash2, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RapportContent from '@/components/RapportContent';
import InterventionItem from '@/components/rased/InterventionItem';
import IntervenantsSection from '@/components/rased/IntervenantsSection';
import DocumentsSection from '@/components/rased/DocumentsSection';
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
function TabSuivi({ fiche, ficheId, setFiche, interventions, setInterventions, user, highlightField, membres, showCommentModal, setShowCommentModal }) {
  const [statut, setStatut] = useState(fiche.statut || 'Nouveau');
  const [savingStatut, setSavingStatut] = useState(false);
  const [motif, setMotif] = useState(fiche.observations || '');
  const [editingMotif, setEditingMotif] = useState(!fiche.observations);
  const [savingMotif, setSavingMotif] = useState(false);
  const [showMotifSuccess, setShowMotifSuccess] = useState(false);
  const [addingIntervention, setAddingIntervention] = useState(false);
  const [editingInterventionId, setEditingInterventionId] = useState(null);
  const [newIntervention, setNewIntervention] = useState({ date: '', nom: '', description: '', profession: '', commentaire: '' });
  const [showRapport, setShowRapport] = useState(false);
  const [addingSynthese, setAddingSynthese] = useState(false);
  const [newSynthese, setNewSynthese] = useState({ date: '', membres: '', decisions: '', fichier_url: '' });
  const [syntheses, setSyntheses] = useState(fiche.syntheses_ee || []);
  const motifInputRef = useRef(null);

  // Pré-sélectionner le membre connecté
  useEffect(() => {
    if (membres.length > 0 && user && addingIntervention && !newIntervention.nom) {
      const membreUser = membres.find(m => m.prenom === user.full_name?.split(' ')[0]);
      if (membreUser) {
        setNewIntervention(prev => ({ ...prev, nom: `${membreUser.prenom} ${membreUser.nom}`, profession: membreUser.profession }));
      }
    }
  }, [addingIntervention, membres, user]);

  const truncateComment = (text, lines = 2) => {
    if (!text) return '';
    const textLines = text.split('\n');
    if (textLines.length > lines) {
      return textLines.slice(0, lines).join('\n') + '…';
    }
    return text;
  };

  useEffect(() => {
    if (highlightField === 'motif' && motifInputRef.current) {
      motifInputRef.current.focus();
    }
  }, [highlightField]);

  const handleSaveStatut = async () => {
    setSavingStatut(true);
    try {
      // Sauvegarder le statut sur FicheEleve
      await base44.entities.FicheEleve.update(ficheId, { statut });
      // Mettre à jour le statut et la date de dernière action sur l'EleveRased lié
      const elevesRased = await base44.entities.EleveRased.filter({ fiche_eleve_id: ficheId }).catch(() => []);
      if (elevesRased.length > 0) {
        await base44.entities.EleveRased.update(elevesRased[0].id, {
          statut,
          date_derniere_action: new Date().toISOString().split('T')[0],
        });
      }
      setFiche(f => ({ ...f, statut }));
    } catch (e) {
      console.error('Erreur sauvegarde statut:', e);
    } finally {
      setSavingStatut(false);
    }
  };

  const handleSaveMotif = async () => {
    if (!motif.trim()) return;
    setSavingMotif(true);
    try {
      await base44.entities.FicheEleve.update(ficheId, { observations: motif.trim() });
      setFiche(f => ({ ...f, observations: motif.trim() }));
      setEditingMotif(false);
      setShowMotifSuccess(true);
      setTimeout(() => setShowMotifSuccess(false), 3000);
    } catch (e) {
      console.error('Erreur sauvegarde motif:', e);
    } finally {
      setSavingMotif(false);
    }
  };

  const addIntervention = async () => {
    if (!newIntervention.date) return;
    let updated;
    if (editingInterventionId !== null) {
      updated = interventions.map((iv, idx) => idx === editingInterventionId ? newIntervention : iv);
    } else {
      updated = [...interventions, { ...newIntervention, created_by: user?.full_name || 'Inconnu', created_by_id: user?.id }];
    }
    await base44.entities.FicheEleve.update(ficheId, { interventions: updated });
    setFiche(f => ({ ...f, interventions: updated }));
    setInterventions(updated);
    setNewIntervention({ date: '', nom: '', description: '', profession: '', commentaire: '' });
    setAddingIntervention(false);
    setEditingInterventionId(null);
  };

  const deleteIntervention = async (idx) => {
    if (!confirm('Supprimer cette intervention ?')) return;
    const updated = interventions.filter((_, i) => i !== idx);
    await base44.entities.FicheEleve.update(ficheId, { interventions: updated });
    setFiche(f => ({ ...f, interventions: updated }));
    setInterventions(updated);
  };

  const editIntervention = (idx) => {
    setEditingInterventionId(idx);
    setNewIntervention(interventions[idx]);
    setAddingIntervention(true);
  };

  const addSynthese = async () => {
    if (!newSynthese.date) return;
    const synthese = {
      ...newSynthese,
      created_at: new Date().toISOString(),
      created_by_name: user?.full_name || 'Inconnu'
    };
    const updated = [...syntheses, synthese];
    await base44.entities.FicheEleve.update(ficheId, { syntheses_ee: updated });
    setFiche(f => ({ ...f, syntheses_ee: updated }));
    setSyntheses(updated);
    setNewSynthese({ date: '', membres: '', decisions: '', fichier_url: '' });
    setAddingSynthese(false);
  };

  const deleteSynthese = async (idx) => {
    const updated = syntheses.filter((_, i) => i !== idx);
    await base44.entities.FicheEleve.update(ficheId, { syntheses_ee: updated });
    setFiche(f => ({ ...f, syntheses_ee: updated }));
    setSyntheses(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Message de succès motif */}
      {showMotifSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{ padding: '10px 14px', borderRadius: 10, background: '#E4F4ED', border: '1px solid #1E7A52', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>✅</span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#1E7A52' }}>Motif enregistré</span>
        </motion.div>
      )}

      {/* Motif de la demande */}
      <Card style={{ borderTop: highlightField === 'motif' ? '3px solid #B85C1A' : 'none', boxShadow: highlightField === 'motif' ? '0 0 0 3px rgba(184, 92, 26, 0.15)' : 'none' }}>
        <CardHead icon="📌" title="Motif de la demande" />
        {!editingMotif && motif ? (
          <div style={{ padding: '14px 16px' }}>
            <div style={{ background: '#FAFBFD', borderLeft: '3px solid #3B82C4', padding: '14px 16px', borderRadius: 8, marginBottom: 12, fontSize: 13.5, lineHeight: 1.65, color: '#182840' }}>
              {motif}
            </div>
            <button
              onClick={() => setEditingMotif(true)}
              style={{ fontSize: 12.5, color: '#3B82C4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              ✏️ Modifier
            </button>
          </div>
        ) : (
          <div style={{ padding: '14px 16px' }}>
            {highlightField === 'motif' && (
              <div style={{ background: '#FEF0E4', border: '1px solid #B85C1A', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: '#B85C1A', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>⚠️</span>
                <span>Ce champ est requis pour compléter la fiche</span>
              </div>
            )}
            <textarea
              ref={motifInputRef}
              value={motif}
              onChange={e => setMotif(e.target.value)}
              placeholder="Décrivez le motif de la demande (difficultés observées, demande de l'enseignant·e, contexte...)"
              style={{
                width: '100%',
                minHeight: 100,
                padding: '10px 12px',
                borderRadius: 8,
                border: `1.5px solid ${highlightField === 'motif' ? '#B85C1A' : '#D8E1EE'}`,
                fontSize: 13,
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'Inter, sans-serif',
                boxSizing: 'border-box',
                background: highlightField === 'motif' ? '#FFFAF5' : '#fff',
                transition: 'all 0.3s ease'
              }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
              {fiche.observations && (
                <button
                  onClick={() => { setMotif(fiche.observations); setEditingMotif(false); }}
                  style={{ padding: '7px 14px', fontSize: 12.5, borderRadius: 7, background: 'transparent', border: '1px solid #D8E1EE', cursor: 'pointer', color: '#566880' }}>
                  Annuler
                </button>
              )}
              <button
                onClick={handleSaveMotif}
                disabled={!motif.trim() || savingMotif}
                style={{ padding: '7px 14px', fontSize: 12.5, borderRadius: 7, background: '#1A3353', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, opacity: (!motif.trim() || savingMotif) ? 0.5 : 1 }}>
                {savingMotif ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        )}
      </Card>

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



      {/* Synthèse Équipe Éducative */}
      <Card>
        <CardHead icon="📋" title="Synthèse d'Équipe Éducative (ESS/EE)" />
        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {addingSynthese && (
            <div style={{ background: '#F8FAFD', borderRadius: 10, padding: 14, marginBottom: 14, border: '1px solid #D8E1EE', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Date de la réunion EE ou ESS', content: <input type="date" value={newSynthese.date} onChange={e => setNewSynthese({...newSynthese, date: e.target.value})} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid #D8E1EE', fontSize: 13, outline: 'none' }} /> },
                { label: 'Membres présents', content: <textarea value={newSynthese.membres} onChange={e => setNewSynthese({...newSynthese, membres: e.target.value})} placeholder="Énumérez les participants…" style={{ width: '100%', minHeight: 60, padding: '8px 10px', borderRadius: 7, border: '1px solid #D8E1EE', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box' }} /> },
                { label: 'Décisions prises', content: <textarea value={newSynthese.decisions} onChange={e => setNewSynthese({...newSynthese, decisions: e.target.value})} placeholder="Résumez les décisions et actions…" style={{ width: '100%', minHeight: 80, padding: '8px 10px', borderRadius: 7, border: '1px solid #D8E1EE', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box' }} /> },
              ].map(({ label, content }) => (
                <div key={label}>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: '#566880', display: 'block', marginBottom: 5 }}>{label}</label>
                  {content}
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setAddingSynthese(false)} style={{ padding: '7px 14px', fontSize: 12.5, borderRadius: 7, background: 'transparent', border: '1px solid #D8E1EE', cursor: 'pointer', color: '#566880' }}>Annuler</button>
                <button onClick={addSynthese} disabled={!newSynthese.date} style={{ padding: '7px 14px', fontSize: 12.5, borderRadius: 7, background: '#1A3353', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, opacity: !newSynthese.date ? 0.5 : 1 }}>Ajouter</button>
              </div>
            </div>
          )}
          {syntheses.length === 0 && !addingSynthese && (
            <p style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>Aucune synthèse EE enregistrée</p>
          )}
          {syntheses.map((syn, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: idx < syntheses.length - 1 ? '1px solid #F0F3F8' : 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#182840' }}>📅 {new Date(syn.date).toLocaleDateString('fr-FR')}</span>
                  <span style={{ fontSize: 10.5, color: '#566880', padding: '2px 8px', background: '#F0F3F8', borderRadius: 4 }}>par {syn.created_by_name}</span>
                </div>
                {syn.membres && <div style={{ fontSize: 12, color: '#182840', marginBottom: 4, padding: '6px', background: '#F8FAFD', borderRadius: 6, borderLeft: '3px solid #3B82C4' }}><strong>Présents:</strong> {syn.membres}</div>}
                {syn.decisions && <div style={{ fontSize: 12, color: '#182840', padding: '6px', background: '#F8FAFD', borderRadius: 6, borderLeft: '3px solid #1E7A52' }}><strong>Décisions:</strong> {syn.decisions}</div>}
              </div>
              <button onClick={() => deleteSynthese(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4, flexShrink: 0 }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {!addingSynthese && (
            <button onClick={() => setAddingSynthese(true)} style={{ fontSize: 11.5, padding: '6px 14px', borderRadius: 7, background: '#1A3353', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, marginTop: 8 }}>+ Ajouter une synthèse</button>
          )}
        </div>
      </Card>

      {/* Intervenants RASED */}
      <Card>
        <CardHead icon="👥" title="Intervenants RASED" />
        <div style={{ padding: 14 }}>
          <IntervenantsSection ficheId={ficheId} fichePrenomNom={`${fiche.prenom} ${fiche.nom}`} createdByName={fiche.createdByName} createdByProfession={fiche.createdByProfession} />
        </div>
      </Card>

      {/* Séances et interventions */}
      <Card>
        <CardHead icon="📋" title="Séances et interventions"
          action={addingIntervention ? undefined : '+ Ajouter'}
          onAction={() => { setAddingIntervention(true); setEditingInterventionId(null); setNewIntervention({ date: '', nom: '', description: '', profession: '', commentaire: '' }); }} />
        <div style={{ padding: 14 }}>
          {addingIntervention && (
            <div style={{ background: '#F8FAFD', borderRadius: 10, padding: 14, marginBottom: 14, border: '1px solid #D8E1EE', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Date', content: <input type="date" value={newIntervention.date} onChange={e => setNewIntervention({...newIntervention, date: e.target.value})} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid #D8E1EE', fontSize: 13, outline: 'none' }} /> },
                { label: 'Professionnel de l\'équipe RASED', content: (
                  <select value={newIntervention.nom} onChange={e => {
                    const membreId = e.target.value;
                    const membre = membres.find(m => m.id === membreId);
                    setNewIntervention({...newIntervention, nom: membre ? `${membre.prenom} ${membre.nom}` : '', profession: membre?.profession || ''});
                  }} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid #D8E1EE', fontSize: 13, outline: 'none', boxSizing: 'border-box', height: 36 }}>
                    <option value="">— Sélectionner un professionnel —</option>
                    {membres.map(m => (
                      <option key={m.id} value={m.id}>{m.prenom} {m.nom} · {m.profession === 'Psy EN EDA' ? 'Psy-EN EDA' : m.profession}</option>
                    ))}
                  </select>
                ) },
                { label: 'Acte accompli', content: (
                  <select value={newIntervention.description} onChange={e => setNewIntervention({...newIntervention, description: e.target.value})} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid #D8E1EE', fontSize: 13, outline: 'none', boxSizing: 'border-box', height: 36 }}>
                    <option value="">— Sélectionner un acte —</option>
                    <optgroup label="Actes Psy-EN EDA">
                      <option>Entretien avec l'élève (Psy-EN)</option>
                      <option>Passation psychométrique (Psy-EN)</option>
                      <option>Analyse de situation (Psy-EN)</option>
                      <option>Observation en classe (Psy-EN)</option>
                      <option>Entretien avec la famille</option>
                      <option>Participation à une ESS/EE</option>
                      <option>Liaison avec l'enseignant·e</option>
                      <option>Orientation externe (Psy-EN)</option>
                      <option>Dossier MDPH (Psy-EN)</option>
                    </optgroup>
                    <optgroup label="Actes MaDR">
                      <option>Séance de rééducation (MaDR)</option>
                      <option>Suivi individuel (MaDR)</option>
                      <option>Suivi en groupe (MaDR)</option>
                      <option>Observation en classe (MaDR)</option>
                      <option>Liaison avec l'enseignant·e (MaDR)</option>
                    </optgroup>
                    <optgroup label="Actes MaDP">
                      <option>Séance d'aide pédagogique (MaDP)</option>
                      <option>Suivi individuel (MaDP)</option>
                      <option>Suivi en groupe (MaDP)</option>
                      <option>Observation en classe (MaDP)</option>
                      <option>Liaison avec l'enseignant·e (MaDP)</option>
                    </optgroup>
                    <optgroup label="Commun">
                      <option>Participation à une ESS/EE</option>
                      <option>Réunion d'équipe RASED</option>
                      <option>Autre</option>
                    </optgroup>
                  </select>
                ) },
                { label: 'Commentaire (optionnel)', content: (
                  <textarea value={newIntervention.commentaire || ''} onChange={e => setNewIntervention({...newIntervention, commentaire: e.target.value})} placeholder="Décrivez le déroulement de la séance, les observations, les points importants…" style={{ width: '100%', minHeight: 80, padding: '8px 10px', borderRadius: 7, border: '1px solid #D8E1EE', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }} />
                ) },
              ].map(({ label, content }) => (
                <div key={label}>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: '#566880', display: 'block', marginBottom: 5 }}>{label}</label>
                  {content}
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => { setAddingIntervention(false); setEditingInterventionId(null); setNewIntervention({ date: '', nom: '', description: '', profession: '', commentaire: '' }); }} style={{ padding: '7px 14px', fontSize: 12.5, borderRadius: 7, background: 'transparent', border: '1px solid #D8E1EE', cursor: 'pointer', color: '#566880' }}>Annuler</button>
                <button onClick={addIntervention} disabled={!newIntervention.date} style={{ padding: '7px 14px', fontSize: 12.5, borderRadius: 7, background: '#1A3353', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, opacity: !newIntervention.date ? 0.5 : 1 }}>{editingInterventionId !== null ? 'Mettre à jour' : 'Ajouter'}</button>
              </div>
            </div>
          )}
          {interventions.length === 0 && !addingIntervention && (
            <p style={{ fontSize: 13, color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>Aucune séance enregistrée — cliquez sur + Ajouter pour enregistrer une séance ou intervention</p>
          )}
          {interventions.map((iv, idx) => {
            const canEdit = user && (iv.created_by_id === user.id || user.role === 'admin');
            const hasComment = iv.commentaire && iv.commentaire.trim();
            const commentLines = hasComment ? iv.commentaire.split('\n') : [];
            const needsExpand = commentLines.length > 2;
            return (
              <div key={idx} style={{ padding: '12px 0', borderBottom: idx < interventions.length - 1 ? '1px solid #F0F3F8' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#182840', marginBottom: 2 }}>
                      📅 {new Date(iv.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: 13, color: '#182840', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600 }}>{iv.nom}</span>
                      {iv.profession && <span style={{ fontSize: 11, color: '#566880', marginLeft: 6 }}>· {iv.profession === 'Psy EN EDA' ? 'Psy-EN EDA' : iv.profession}</span>}
                    </div>
                    <div style={{ fontSize: 12.5, color: '#566880', marginBottom: 8, paddingLeft: 10, borderLeft: '3px solid #3B82C4' }}>
                      {iv.description}
                    </div>
                    {hasComment && (
                      <div style={{ fontSize: 13, color: '#182840', lineHeight: 1.5, marginBottom: 10, padding: '10px', background: '#F8FAFD', borderRadius: 8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {truncateComment(iv.commentaire, 2)}
                        {needsExpand && (
                          <button onClick={() => setShowCommentModal(idx)} style={{ fontSize: 11.5, color: '#3B82C4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginTop: 6, display: 'block' }}>
                            Voir plus →
                          </button>
                        )}
                      </div>
                    )}
                    {canEdit && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => editIntervention(idx)} style={{ fontSize: 11.5, padding: '4px 10px', borderRadius: 6, background: 'transparent', border: '1px solid #3B82C4', color: '#3B82C4', cursor: 'pointer', fontWeight: 600 }}>
                          ✏️ Modifier
                        </button>
                        <button onClick={() => deleteIntervention(idx)} style={{ fontSize: 11.5, padding: '4px 10px', borderRadius: 6, background: 'transparent', border: '1px solid #EF4444', color: '#EF4444', cursor: 'pointer', fontWeight: 600 }}>
                          🗑️ Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Modale commentaire complet */}
          {showCommentModal !== null && interventions[showCommentModal]?.commentaire && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
              onClick={() => setShowCommentModal(null)}>
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
                style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 640, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #F0F3F8' }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#182840' }}>💬 Commentaire</span>
                  <button onClick={() => setShowCommentModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
                  <p style={{ fontSize: 13, color: '#182840', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                    {interventions[showCommentModal].commentaire}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Documents */}
      <Card>
        <CardHead icon="📎" title="Documents" />
        <div style={{ padding: 14 }}>
          <DocumentsSection ficheId={ficheId} />
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
        <CardHead icon="🔍" title="Analyses de situation"
          action="+ Nouvelle analyse"
          onAction={() => navigate(`/hypotheses-eleve?id=${ficheId}`)} />

        {historiqueEDA.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#182840', marginBottom: 6 }}>Aucune analyse de situation</div>
            <div style={{ fontSize: 12.5, color: '#566880', marginBottom: 18 }}>Utilisez l'arbre décisionnel pour analyser les difficultés de {fiche.prenom}.</div>
            <button onClick={() => navigate(`/hypotheses-eleve?id=${ficheId}`)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 9, fontSize: 13.5, fontWeight: 700, background: '#1A3353', color: '#fff', border: 'none', cursor: 'pointer' }}>
              🔍 Analyser la situation
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
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.07em', color: '#566880', fontWeight: 700, marginBottom: 6 }}>Analyses retenues</div>
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
  const PROF_LABEL_SHORT = { 'Psy EN EDA': 'Psy-EN EDA', 'MaDR': 'MaDR', 'MaDP': 'MaDP' };

  const inferProfession = (desc) => {
    if (!desc) return '';
    if (desc.includes('Psychologue') || desc.includes('Psy-EN') || desc.includes('Psy EN')) return 'Psy EN EDA';
    if (desc.includes('MaDR') || desc.includes('Relationnelle')) return 'MaDR';
    if (desc.includes('MaDP') || desc.includes('Pédagogique')) return 'MaDP';
    return '';
  };

  const formatNomMembre = (iv) => {
    const prof = (iv.profession && iv.profession !== 'RASED') ? iv.profession : inferProfession(iv.description);
    if (iv.nom) return `${iv.nom}${prof ? ` · ${PROF_LABEL_SHORT[prof] || prof}` : ''}`;
    if (prof) return PROF_LABEL_SHORT[prof] || prof;
    return fiche.createdByName ? `${fiche.createdByName}${fiche.createdByProfession ? ` · ${PROF_LABEL_SHORT[fiche.createdByProfession] || fiche.createdByProfession}` : ''}` : '';
  };

  const isRapport = (desc) => {
    if (!desc) return false;
    return /RAPPORT|CLINIQUE|#\s/.test(desc);
  };

  const rapportType = (desc) => {
    const m = desc.match(/\[([^\]]+)\]/);
    return m ? m[1] : 'observation';
  };

  const cleanObservation = (desc) => {
    if (!desc) return '';
    let cleaned = desc
      .replace(/\[.*?\]/g, '')
      .replace(/^#+\s.*$/gm, '')
      .replace(/\*\*/g, '')
      .replace(/---/g, '')
      .replace(/#\s*/g, '')
      .trim();
    const firstLine = cleaned.split('\n').find(l => l.trim().length > 0) || '';
    return firstLine.length > 120 ? firstLine.substring(0, 120) + '…' : firstLine;
  };

  const events = [
    ...interventions.map(iv => {
      if (isRapport(iv.description)) {
        return { date: new Date(iv.date), ico: '📄', type: 'rapport', title: `Rapport généré · ${rapportType(iv.description)}`, meta: formatNomMembre(iv) };
      }
      return { date: new Date(iv.date), ico: '💬', type: 'note', title: iv.description || 'Observation', meta: formatNomMembre(iv) };
    }),
    { date: new Date(fiche.created_date), ico: '📄', type: 'imp', title: 'Fiche créée', meta: [fiche.createdByName, fiche.createdByProfession && (PROF_LABEL_SHORT[fiche.createdByProfession] || fiche.createdByProfession), fiche.ecole, fiche.classe].filter(Boolean).join(' · ') },
  ].sort((a, b) => b.date - a.date);

  const DOT_BG = { note: '#E4F4ED', hyp: '#EAF2FB', stat: '#FEF0E4', imp: '#EEE9FF', rapport: '#F0F3F8' };

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const PROF_LABEL = { 'Psy EN EDA': 'Psychologue de l\'Éducation Nationale · Spécialité EDA', 'MaDR': 'Maître à Dominante Relationnelle (MaDR)', 'MaDP': 'Maître à Dominante Pédagogique (MaDP)' };
  
  const handleDeleteFiche = async () => {
    setDeleting(true);
    try {
      await base44.entities.FicheEleve.delete(ficheId);
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur suppression:', error);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getAnneeFromDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth();
    return month >= 7 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };

  const handleAutoFillAnnee = async () => {
    const annee = getAnneeFromDate(fiche.created_date);
    if (annee) {
      await base44.entities.FicheEleve.update(ficheId, { annee_scolaire: annee });
      window.location.reload();
    }
  };
  
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
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0F3F8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.07em', color: '#566880', fontWeight: 600, marginBottom: 3 }}>Année scolaire</div>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: fiche.annee_scolaire ? '#182840' : '#94A3B8', fontStyle: fiche.annee_scolaire ? 'normal' : 'italic' }}>{fiche.annee_scolaire || 'Non renseigné'}</div>
          </div>
          {!fiche.annee_scolaire && (
            <button onClick={handleAutoFillAnnee}
              style={{ fontSize: 11.5, color: '#3B82C4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap', paddingLeft: 12 }}>
              Remplir auto →
            </button>
          )}
        </div>
        <InfoRow label="Créé par" value={fiche.createdByName ? `${fiche.createdByName} · ${PROF_LABEL[fiche.createdByProfession] || fiche.createdByProfession}` : null} />
        <InfoRow label="Date de création" value={fiche.created_date ? new Date(fiche.created_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null} />
        <InfoRow label="Dernière modification" value={fiche.updated_date ? new Date(fiche.updated_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null} />
      </Card>

      <Card>
        <CardHead icon="📤" title="Exporter" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 14 }}>
          {[
            { ico: '📄', lbl: 'Rapport de suivi', sub: 'Générer un PDF officiel', action: () => setShowReportModal(true) },
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

      {/* Danger zone */}
      <Card style={{ borderTop: '2px solid #B85C1A' }}>
        <CardHead icon="⚠️" title="Zone de danger" />
        <div style={{ padding: '14px 16px', background: '#FEF0E4' }}>
          <p style={{ fontSize: 13, color: '#B85C1A', marginBottom: 12, lineHeight: 1.5 }}>
            La suppression de cette fiche est définitive. Cette action ne peut pas être annulée.
          </p>
          <button onClick={() => setShowDeleteConfirm(true)}
            style={{ fontSize: 12.5, fontWeight: 600, padding: '8px 16px', borderRadius: 8, background: '#B85C1A', color: '#fff', border: 'none', cursor: 'pointer' }}>
            🗑️ Supprimer cette fiche
          </button>
        </div>
      </Card>

      {/* Modal confirmation suppression */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => !deleting && setShowDeleteConfirm(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 14, padding: '24px', maxWidth: 380, textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#182840', marginBottom: 8 }}>Supprimer cette fiche ?</p>
              <p style={{ fontSize: 13, color: '#566880', marginBottom: 20, lineHeight: 1.5 }}>
                Êtes-vous sûr ? La fiche de <strong>{fiche.prenom} {fiche.nom}</strong> sera supprimée définitivement.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting}
                  style={{ padding: '9px 20px', borderRadius: 8, background: '#F0F3F8', color: '#182840', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                  Annuler
                </button>
                <button onClick={handleDeleteFiche} disabled={deleting}
                  style={{ padding: '9px 20px', borderRadius: 8, background: '#B85C1A', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, opacity: deleting ? 0.6 : 1 }}>
                  {deleting ? '⏳ Suppression...' : '🗑️ Supprimer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'suivi');
  const [interventions, setInterventions] = useState([]);
  const [historiqueEDA, setHistoriqueEDA] = useState([]);
  const [user, setUser] = useState(null);
  const [showSuccess, setShowSuccess] = useState(searchParams.get('success') === 'true');
  const [highlightField, setHighlightField] = useState(searchParams.get('highlight') || null);
  const [membres, setMembres] = useState([]);
  const [showCommentModal, setShowCommentModal] = useState(null);

  const ficheId = searchParams.get('id');
  const { onFiche } = usePresence(ficheId);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  useEffect(() => {
    if (highlightField) {
      const timer = setTimeout(() => setHighlightField(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightField]);

  useEffect(() => {
    if (!ficheId) { setLoading(false); return; }
    Promise.all([
      base44.entities.FicheEleve.get(ficheId),
      base44.entities.HistoriqueEDA.filter({ eleve_id: ficheId }).catch(() => []),
      base44.auth.me().catch(() => null),
      base44.entities.MembreEquipe.list().catch(() => []),
    ]).then(([ficheData, histo, userData, membresData]) => {
      setFiche(ficheData);
      setInterventions(ficheData?.interventions || []);
      setHistoriqueEDA(histo.sort((a, b) => new Date(b.date || b.created_date) - new Date(a.date || a.created_date)));
      setUser(userData);
      setMembres(membresData);
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

      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{ maxWidth: 680, margin: '12px auto 0', padding: '0 14px' }}
        >
          <div style={{ padding: '12px 16px', borderRadius: 12, background: '#E4F4ED', border: '1px solid #1E7A52', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1E7A52' }}>Fiche de {fiche.prenom} {fiche.nom} créée avec succès</span>
          </div>
        </motion.div>
      )}

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px 14px 80px' }}>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {activeTab === 'suivi' && (
              <TabSuivi fiche={fiche} ficheId={ficheId} setFiche={setFiche} interventions={interventions} setInterventions={setInterventions} user={user} highlightField={highlightField} membres={membres} showCommentModal={showCommentModal} setShowCommentModal={setShowCommentModal} />
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