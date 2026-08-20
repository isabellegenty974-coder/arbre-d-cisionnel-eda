import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { fetchAllPages } from '@/lib/fetchAllPages';

function isEnRetard(rappel) {
  if (rappel.fait || !rappel.echeance) return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return new Date(rappel.echeance) < today;
}

function trierRappels(rappels) {
  return [...rappels].sort((a, b) => {
    if (a.fait !== b.fait) return a.fait ? 1 : -1;
    if (!a.fait) {
      if (a.echeance && b.echeance) return new Date(a.echeance) - new Date(b.echeance);
      if (a.echeance) return -1;
      if (b.echeance) return 1;
    }
    return new Date(b.created_date || 0) - new Date(a.created_date || 0);
  });
}

export default function RappelsSection({ ficheId, fichePrenomNom = '', user }) {
  const [rappels, setRappels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [texte, setTexte] = useState('');
  const [echeance, setEcheance] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await fetchAllPages('RappelEleve', '-created_date', {
        query: { fiche_id: ficheId },
        throwOnError: true,
      });
      setRappels(all);
    } catch (e) {
      console.error('Erreur chargement rappels:', e);
      setError('Impossible de charger les rappels. Réessayez plus tard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [ficheId]);

  const handleAdd = async () => {
    if (!texte.trim()) { setError('Le rappel ne peut pas être vide.'); return; }
    setSaving(true);
    setError(null);
    try {
      await base44.entities.RappelEleve.create({
        fiche_id: ficheId,
        eleve_nom: fichePrenomNom,
        texte: texte.trim(),
        echeance: echeance || undefined,
        fait: false,
        auteur_nom: user?.full_name || '',
      });
      setTexte('');
      setEcheance('');
      setAdding(false);
      await load();
    } catch (e) {
      console.error('Erreur ajout rappel:', e);
      setError("Erreur lors de l'ajout du rappel. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  const toggleFait = async (rappel) => {
    setError(null);
    const next = !rappel.fait;
    setRappels(prev => prev.map(r => r.id === rappel.id ? { ...r, fait: next } : r));
    try {
      await base44.entities.RappelEleve.update(rappel.id, { fait: next });
    } catch (e) {
      console.error('Erreur mise à jour rappel:', e);
      setRappels(prev => prev.map(r => r.id === rappel.id ? { ...r, fait: rappel.fait } : r));
      setError('Erreur lors de la mise à jour du rappel. Réessayez.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce rappel ?')) return;
    setError(null);
    try {
      await base44.entities.RappelEleve.delete(id);
      setRappels(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error('Erreur suppression rappel:', e);
      setError('Erreur lors de la suppression du rappel. Réessayez.');
    }
  };

  const trie = trierRappels(rappels);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 12 }}>
        {!adding && (
          <button onClick={() => setAdding(true)}
            style={{ fontSize: 11.5, padding: '6px 14px', borderRadius: 7, background: '#1A3353', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            + Ajouter un rappel
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: '#FEF0E4', border: '1px solid #B85C1A', borderRadius: 10, padding: '12px 14px', marginBottom: 14, fontSize: 12.5, color: '#B85C1A', fontWeight: 500, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 14 }}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {adding && (
        <div style={{ background: '#F8FAFD', border: '1px solid #D8E1EE', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
          <textarea value={texte} onChange={e => { setTexte(e.target.value); setError(null); }}
            placeholder="Que faut-il faire ?"
            style={{ width: '100%', minHeight: 70, padding: '10px 12px', fontSize: 13, border: '1px solid #D8E1EE', borderRadius: 8, outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', marginBottom: 10 }}
          />
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: '#566880', display: 'block', marginBottom: 5 }}>Échéance (optionnel)</label>
            <input type="date" value={echeance} onChange={e => setEcheance(e.target.value)}
              style={{ padding: '8px 10px', fontSize: 13, border: '1px solid #D8E1EE', borderRadius: 8, outline: 'none', fontFamily: 'Inter, sans-serif' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => { setAdding(false); setTexte(''); setEcheance(''); setError(null); }}
              style={{ padding: '7px 14px', fontSize: 12.5, borderRadius: 7, background: 'transparent', border: '1px solid #D8E1EE', cursor: 'pointer', color: '#566880', fontWeight: 600 }}>
              Annuler
            </button>
            <button onClick={handleAdd} disabled={saving || !texte.trim()}
              style={{ padding: '7px 14px', fontSize: 12.5, borderRadius: 7, background: '#1A3353', color: '#fff', border: 'none', cursor: (saving || !texte.trim()) ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: (saving || !texte.trim()) ? 0.5 : 1 }}>
              {saving ? 'Enregistrement…' : 'Ajouter'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>Chargement des rappels…</p>
      ) : trie.length === 0 ? (
        <p style={{ fontSize: 13, color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
          Aucun rappel pour le moment.
        </p>
      ) : (
        trie.map(rappel => {
          const enRetard = isEnRetard(rappel);
          return (
            <div key={rappel.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid #F0F3F8' }}>
              <input type="checkbox" checked={!!rappel.fait} onChange={() => toggleFait(rappel)}
                style={{ width: 18, height: 18, marginTop: 2, cursor: 'pointer', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: rappel.fait ? '#94A3B8' : '#182840', textDecoration: rappel.fait ? 'line-through' : 'none', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {rappel.texte}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                  {rappel.echeance && (
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                      background: enRetard ? '#FEE4E2' : '#F0F3F8', color: enRetard ? '#B42318' : '#566880',
                    }}>
                      {enRetard ? '⏰ En retard · ' : '📅 '}
                      {new Date(rappel.echeance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>
                    {rappel.auteur_nom || 'Auteur inconnu'}
                    {rappel.created_date && ` · ${new Date(rappel.created_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  </span>
                </div>
              </div>
              <button onClick={() => handleDelete(rappel.id)}
                style={{ fontSize: 11.5, padding: '4px 10px', borderRadius: 6, background: 'transparent', border: '1px solid #EF4444', color: '#EF4444', cursor: 'pointer', fontWeight: 600, flexShrink: 0 }}>
                🗑️
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}
