import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar } from 'lucide-react';

export default function Parametres() {
  const navigate = useNavigate();
  const [annees, setAnnees]     = useState([]);
  const [fiches, setFiches]     = useState([]);
  const [diags, setDiags]       = useState([]);
  const [elevesR, setElevesR]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);
  const [newLibelle, setNewLibelle] = useState('');
  const [saving, setSaving]     = useState(false);
  const [selected, setSelected] = useState(null); // id de l'année consultée

  const load = async () => {
    const [ans, f, d, el] = await Promise.all([
      base44.entities.AnneeScolaire.list('libelle', 50).catch(() => []),
      base44.entities.FicheEleve.list('-created_date', 500).catch(() => []),
      base44.entities.HistoriqueEDA.list('-date', 1000).catch(() => []),
      base44.entities.EleveRased.list('-created_date', 500).catch(() => []),
    ]);
    setAnnees(ans);
    setFiches(f);
    setDiags(d);
    setElevesR(el);
    // Sélection par défaut = année active
    const active = ans.find(a => a.active);
    if (active && !selected) setSelected(active.id);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newLibelle.trim()) return;
    setSaving(true);
    await base44.entities.AnneeScolaire.create({ libelle: newLibelle.trim(), statut: 'future', active: false });
    setNewLibelle(''); setShowAdd(false); setSaving(false);
    load();
  };

  const handleSetActive = async (annee) => {
    setSaving(true);
    await Promise.all(annees.filter(a => a.id !== annee.id && a.active).map(a =>
      base44.entities.AnneeScolaire.update(a.id, { active: false, statut: 'archivee' })
    ));
    await base44.entities.AnneeScolaire.update(annee.id, { active: true, statut: 'active' });
    setSaving(false);
    load();
  };

  // Stats par année
  const statsParAnnee = (annee) => {
    const debut = annee.date_debut ? new Date(annee.date_debut) : new Date(`${annee.libelle.split('-')[0]}-09-01`);
    const fin   = annee.date_fin   ? new Date(annee.date_fin)   : new Date(`${annee.libelle.split('-')[1] || (parseInt(annee.libelle.split('-')[0]) + 1)}-08-31`);
    const fichesAnnee = fiches.filter(f => { const d = new Date(f.created_date); return d >= debut && d <= fin; });
    const diagsAnnee  = diags.filter(d2 => { const d = new Date(d2.date || d2.created_date); return d >= debut && d <= fin; });
    const clotures    = elevesR.filter(e => e.statut === 'Clôturé' && e.date_derniere_action && new Date(e.date_derniere_action) >= debut && new Date(e.date_derniere_action) <= fin);
    return { eleves: fichesAnnee.length, hypotheses: diagsAnnee.length, clotures: clotures.length };
  };

  const anneeConsultee = annees.find(a => a.id === selected);

  const statutConfig = {
    active:   { label: 'En cours',  bg: '#1A3353', color: '#fff',    badgeBg: '#4ADE80', badgeColor: '#fff' },
    future:   { label: 'À venir',   bg: '#fff',    color: '#182840', border: '2px dashed #D8E1EE', badgeBg: '#EEE9FF', badgeColor: '#5B3FA6' },
    archivee: { label: 'Archivée',  bg: '#F0F3F8', color: '#94A3B8', badgeBg: '#E2E8F0', badgeColor: '#64748B' },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F0F3F8', fontFamily: 'Inter, sans-serif', paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ background: '#1A3353', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 14px' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-.01em' }}>Suivis RASED</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>La Possession · La Réunion</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.12)', padding: '7px 14px', borderRadius: 20 }}>
            <Calendar size={14} style={{ color: '#fff' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Années scolaires</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 540, margin: '0 auto', padding: '28px 16px' }}>

        {/* Titre */}
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#566880', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, marginBottom: 16 }}>
            <ArrowLeft size={14} /> Tableau de bord
          </button>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#182840', margin: 0, lineHeight: 1.2 }}>Gestion des années scolaires</h1>
          <p style={{ fontSize: 13.5, color: '#566880', marginTop: 8, lineHeight: 1.6 }}>
            Basculez entre les années pour consulter les données historiques. Ajoutez les années à venir pour anticiper la rentrée.
          </p>
        </div>

        {/* Carte sélecteur */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '24px 20px', boxShadow: '0 2px 16px rgba(0,0,0,.06)', marginBottom: 16 }}>

          {/* Formulaire ajout */}
          {showAdd && (
            <div style={{ marginBottom: 20, padding: '14px 16px', background: '#F8FAFD', borderRadius: 12, border: '1px solid #D8E1EE', display: 'flex', gap: 10, alignItems: 'center' }}>
              <input autoFocus value={newLibelle} onChange={e => setNewLibelle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="Ex : 2026-2027"
                style={{ flex: 1, padding: '9px 12px', border: '1px solid #D8E1EE', borderRadius: 8, fontSize: 14, outline: 'none' }} />
              <button onClick={handleAdd} disabled={saving || !newLibelle.trim()}
                style={{ padding: '9px 14px', background: '#1A3353', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, opacity: !newLibelle.trim() ? .5 : 1 }}>
                Créer
              </button>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '9px 12px', background: 'transparent', color: '#566880', border: '1px solid #D8E1EE', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                ✕
              </button>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#566880' }}>Chargement…</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Colonne étiquette */}
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#94A3B8', width: 70, flexShrink: 0 }}>
                ANNÉE<br />ACTIVE
              </div>

              {/* Cartes années */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {annees.map(a => {
                  const cfg = statutConfig[a.statut] || statutConfig.future;
                  const isActive = a.active;
                  const isSelected = selected === a.id;
                  return (
                    <button key={a.id} onClick={() => setSelected(a.id)}
                      style={{
                        width: '100%', textAlign: 'left', cursor: 'pointer',
                        padding: '14px 16px', borderRadius: 14,
                        background: isActive ? '#1A3353' : isSelected ? '#EAF2FB' : (a.statut === 'archivee' ? '#F8F9FB' : '#fff'),
                        border: isActive ? 'none' : isSelected ? '2px solid #3B82C4' : (a.statut === 'future' ? '2px dashed #D8E1EE' : '1px solid #E8EDF5'),
                        transition: 'all .15s',
                        outline: 'none',
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ fontSize: 17, fontWeight: 700, color: isActive ? '#fff' : a.statut === 'archivee' ? '#94A3B8' : '#182840', lineHeight: 1.2 }}>
                          {a.libelle.replace('-', '–')}
                        </span>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 10, background: isActive ? '#4ADE80' : a.statut === 'future' ? '#EEE9FF' : '#E2E8F0', color: isActive ? '#fff' : a.statut === 'future' ? '#5B3FA6' : '#64748B' }}>
                            {isActive ? 'En cours' : a.statut === 'future' ? 'À venir' : 'Archivée'}
                          </span>
                          {!isActive && a.statut !== 'archivee' && (
                            <button onClick={e => { e.stopPropagation(); handleSetActive(a); }} disabled={saving}
                              style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, background: '#3B82C4', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, opacity: saving ? .6 : 1 }}>
                              Activer
                            </button>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bouton nouvelle année */}
              <button onClick={() => setShowAdd(true)}
                style={{ flexShrink: 0, padding: '10px 14px', background: '#3B82C4', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Plus size={14} /> Nouvelle année
              </button>
            </div>
          )}
        </div>

        {/* Bandeau info année consultée */}
        {anneeConsultee && (
          <div style={{ background: '#EAF2FB', border: '1px solid #BFD9F2', borderRadius: 14, padding: '14px 18px', marginBottom: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18 }}>ℹ️</span>
            <div style={{ fontSize: 13, color: '#254D7A', lineHeight: 1.6 }}>
              <span style={{ fontWeight: 700 }}>Vous consultez l'année </span>
              <span style={{ fontWeight: 700, color: '#1A3353' }}>{anneeConsultee.libelle.replace('-', '–')}</span>
              <br />
              Toutes les données (élèves suivis, hypothèses, statistiques) correspondent à cette année scolaire.
              {anneeConsultee.active && (
                <> Pour préparer la rentrée suivante, sélectionnez une année à venir puis importez les nouvelles listes de classes.</>
              )}
            </div>
          </div>
        )}

        {/* Tableau récapitulatif */}
        <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F3F8' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#182840' }}>Récapitulatif par année</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F0F3F8' }}>
                <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.08em' }}>Année</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10.5, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.08em' }}>Élèves<br />suivis</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10.5, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.08em' }}>Hypothèses</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10.5, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.08em' }}>Clôturés</th>
              </tr>
            </thead>
            <tbody>
              {annees.map((a, i) => {
                const s = statsParAnnee(a);
                const isActive = a.active;
                const isSelected = selected === a.id;
                return (
                  <tr key={a.id} onClick={() => setSelected(a.id)}
                    style={{ borderBottom: i < annees.length - 1 ? '1px solid #F0F3F8' : 'none', cursor: 'pointer', background: isSelected ? '#F0F7FF' : 'transparent', transition: 'background .1s' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: 13.5, fontWeight: isActive ? 700 : 500, color: isActive ? '#1A3353' : a.statut === 'archivee' ? '#94A3B8' : '#182840' }}>
                        {a.libelle.replace('-', '–')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'center', fontSize: 15, fontWeight: isActive ? 700 : 400, color: s.eleves > 0 ? '#182840' : '#CBD5E1' }}>
                      {s.eleves > 0 ? s.eleves : '—'}
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'center', fontSize: 15, fontWeight: isActive ? 700 : 400, color: s.hypotheses > 0 ? '#182840' : '#CBD5E1' }}>
                      {s.hypotheses > 0 ? s.hypotheses : '—'}
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'center', fontSize: 15, fontWeight: isActive ? 700 : 400, color: s.clotures > 0 ? '#182840' : '#CBD5E1' }}>
                      {s.clotures > 0 ? s.clotures : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}