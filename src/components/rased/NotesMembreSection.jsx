import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const PROF_COLOR = {
  'Psy EN EDA': { bg: '#EAF2FB', color: '#254D7A', border: '#BFD9F2' },
  'MaDR':       { bg: '#E4F4ED', color: '#1E7A52', border: '#B2DFCC' },
  'MaDP':       { bg: '#FEF0E4', color: '#B85C1A', border: '#F5CFA5' },
};

export default function NotesMembreSection({ ficheId }) {
  const [user, setUser]           = useState(null);
  const [notesEquipe, setNotesEquipe] = useState([]);
  const [myNotes, setMyNotes]     = useState(null);
  const [editing, setEditing]     = useState(false);
  const [draft, setDraft]         = useState('');
  const [saving, setSaving]       = useState(false);

  const load = async () => {
    const [u, all] = await Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.NotesMembre.filter({ fiche_id: ficheId }).catch(() => []),
    ]);
    setUser(u);
    setNotesEquipe(all);
    if (u) {
      const mine = all.find(n => n.membre_id === u.id);
      setMyNotes(mine || null);
      setDraft(mine?.contenu || '');
    }
  };

  useEffect(() => { load(); }, [ficheId]);

  // Souscription temps réel aux notes
  useEffect(() => {
    const unsub = base44.entities.NotesMembre.subscribe(() => load());
    return unsub;
  }, [ficheId]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const profession = user.profession || 'Psy EN EDA';
    if (myNotes) {
      await base44.entities.NotesMembre.update(myNotes.id, {
        contenu: draft,
        updated_at: new Date().toISOString(),
      });
    } else {
      await base44.entities.NotesMembre.create({
        fiche_id: ficheId,
        membre_id: user.id,
        membre_nom: user.full_name,
        membre_profession: profession,
        contenu: draft,
        updated_at: new Date().toISOString(),
      });
    }
    setSaving(false);
    setEditing(false);
    load();
  };

  const autresMembres = notesEquipe.filter(n => n.membre_id !== user?.id && n.contenu?.trim());
  const cfg = PROF_COLOR[user?.profession] || { bg: '#F0F3F8', color: '#566880', border: '#D8E1EE' };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#182840', marginBottom: 12 }}>📝 Notes de l'équipe</h3>

      {/* Mes notes */}
      <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: cfg.color }}>
            Mes notes {user?.full_name ? `(${user.full_name})` : ''}
          </span>
          {!editing && (
            <button onClick={() => setEditing(true)}
              style={{ fontSize: 11.5, padding: '4px 10px', borderRadius: 6, background: cfg.color, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              {myNotes?.contenu ? 'Modifier' : '+ Ajouter'}
            </button>
          )}
        </div>

        {editing ? (
          <div>
            <textarea value={draft} onChange={e => setDraft(e.target.value)}
              placeholder="Mes observations, actions en cours…"
              style={{ width: '100%', minHeight: 100, padding: '10px 12px', fontSize: 13, border: '1px solid #D8E1EE', borderRadius: 8, outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={() => { setEditing(false); setDraft(myNotes?.contenu || ''); }}
                style={{ padding: '6px 14px', fontSize: 12.5, borderRadius: 7, background: 'transparent', border: '1px solid #D8E1EE', cursor: 'pointer', color: '#566880' }}>
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ padding: '6px 14px', fontSize: 12.5, borderRadius: 7, background: cfg.color, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: myNotes?.contenu ? '#182840' : '#94A3B8', fontStyle: myNotes?.contenu ? 'normal' : 'italic', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
            {myNotes?.contenu || 'Aucune note personnelle pour le moment.'}
          </p>
        )}
      </div>

      {/* Notes des collègues */}
      {autresMembres.map(n => {
        const c = PROF_COLOR[n.membre_profession] || { bg: '#F0F3F8', color: '#566880', border: '#D8E1EE' };
        return (
          <div key={n.id} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 10, opacity: 0.85 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {n.membre_nom?.split(' ').map(x => x[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: c.color }}>{n.membre_nom}</div>
                <div style={{ fontSize: 11, color: '#566880' }}>{n.membre_profession}</div>
              </div>
              {n.updated_at && (
                <span style={{ marginLeft: 'auto', fontSize: 10.5, color: '#94A3B8' }}>
                  {new Date(n.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: '#182840', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{n.contenu}</p>
          </div>
        );
      })}
    </div>
  );
}