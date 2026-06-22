import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Check, Archive, Star } from 'lucide-react';

export default function Parametres() {
  const navigate = useNavigate();
  const [annees, setAnnees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newLibelle, setNewLibelle] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const data = await base44.entities.AnneeScolaire.list('-libelle', 50).catch(() => []);
    setAnnees(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newLibelle.trim()) return;
    setSaving(true);
    await base44.entities.AnneeScolaire.create({
      libelle: newLibelle.trim(),
      statut: 'future',
      active: false,
    });
    setNewLibelle('');
    setShowAdd(false);
    setSaving(false);
    load();
  };

  const handleSetActive = async (annee) => {
    setSaving(true);
    // Désactiver toutes les autres
    await Promise.all(annees.filter(a => a.id !== annee.id && a.active).map(a =>
      base44.entities.AnneeScolaire.update(a.id, { active: false, statut: 'archivee' })
    ));
    await base44.entities.AnneeScolaire.update(annee.id, { active: true, statut: 'active' });
    setSaving(false);
    load();
  };

  const handleArchive = async (annee) => {
    await base44.entities.AnneeScolaire.update(annee.id, { active: false, statut: 'archivee' });
    load();
  };

  const statutStyle = {
    active:   { bg: '#E4F4ED', color: '#1E7A52', label: 'En cours' },
    future:   { bg: '#EAF2FB', color: '#254D7A', label: 'À venir' },
    archivee: { bg: '#F0F3F8', color: '#566880', label: 'Archivée' },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F0F3F8', fontFamily: 'Inter, sans-serif', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: '#1A3353', padding: '20px 24px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,.6)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginBottom: 12 }}>
          <ArrowLeft size={16} /> Retour au tableau de bord
        </button>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>Paramètres</h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, marginTop: 4 }}>Suivis RASED · Circonscription de La Possession</p>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px' }}>

        {/* Section Années scolaires */}
        <div style={{ background: '#fff', border: '1px solid #D8E1EE', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #D8E1EE', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#182840', margin: 0 }}>📅 Années scolaires</h2>
              <p style={{ fontSize: 12, color: '#566880', marginTop: 3 }}>Gérez les années scolaires et définissez celle qui est active</p>
            </div>
            <button onClick={() => setShowAdd(!showAdd)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: '#3B82C4', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              <Plus size={15} /> Nouvelle année
            </button>
          </div>

          {/* Formulaire ajout */}
          {showAdd && (
            <div style={{ padding: '16px 22px', background: '#F8FAFD', borderBottom: '1px solid #D8E1EE', display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                autoFocus
                value={newLibelle}
                onChange={e => setNewLibelle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="Ex : 2026-2027"
                style={{ flex: 1, padding: '9px 14px', border: '1px solid #D8E1EE', borderRadius: 8, fontSize: 14, outline: 'none' }}
              />
              <button onClick={handleAdd} disabled={saving || !newLibelle.trim()} style={{ padding: '9px 16px', background: '#1E7A52', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                Créer
              </button>
              <button onClick={() => setShowAdd(false)} style={{ padding: '9px 14px', background: 'transparent', color: '#566880', border: '1px solid #D8E1EE', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                Annuler
              </button>
            </div>
          )}

          {/* Liste */}
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#566880' }}>Chargement…</div>
          ) : annees.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#566880', fontSize: 13 }}>
              Aucune année scolaire créée. Commencez par en ajouter une.
            </div>
          ) : annees.map((a, i) => {
            const s = statutStyle[a.statut] || statutStyle.future;
            return (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 22px', borderBottom: i < annees.length - 1 ? '1px solid #F0F3F8' : 'none' }}>
                {a.active && <Star size={14} style={{ color: '#B85C1A', flexShrink: 0 }} />}
                {!a.active && <div style={{ width: 14, flexShrink: 0 }} />}
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#182840' }}>{a.libelle}</span>
                  {a.active && <span style={{ marginLeft: 8, fontSize: 11, color: '#B85C1A', fontWeight: 600 }}>Année active</span>}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 10, background: s.bg, color: s.color }}>
                  {s.label}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {!a.active && (
                    <button onClick={() => handleSetActive(a)} title="Définir comme année active" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#1E7A52', background: '#E4F4ED', border: 'none', borderRadius: 7, cursor: 'pointer' }}>
                      <Check size={13} /> Activer
                    </button>
                  )}
                  {a.statut !== 'archivee' && !a.active && (
                    <button onClick={() => handleArchive(a)} title="Archiver" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#566880', background: '#F0F3F8', border: 'none', borderRadius: 7, cursor: 'pointer' }}>
                      <Archive size={13} /> Archiver
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info reconduction */}
        <div style={{ background: '#EAF2FB', border: '1px solid #BFD9F2', borderRadius: 12, padding: '16px 20px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#254D7A', marginBottom: 6 }}>ℹ️ Lors du passage à une nouvelle année scolaire</p>
          <ul style={{ fontSize: 12.5, color: '#254D7A', lineHeight: 1.7, paddingLeft: 18, margin: 0 }}>
            <li>Les écoles sont automatiquement conservées</li>
            <li>Les élèves peuvent être réimportés via PDF depuis la page Import</li>
            <li>Les suivis actifs peuvent être reconduits ou clôturés manuellement depuis la liste élèves</li>
            <li>Les statistiques repartent à zéro pour la nouvelle année</li>
          </ul>
        </div>
      </div>
    </div>
  );
}