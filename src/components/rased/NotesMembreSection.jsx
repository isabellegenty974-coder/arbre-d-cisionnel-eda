import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const PROF_LABELS = {
  'Psy EN EDA': 'Psychologue de l\'Éducation Nationale · Spécialité EDA',
  'MaDR': 'Maître à Dominante Relationnelle (MaDR)',
  'MaDP': 'Maître à Dominante Pédagogique (MaDP)',
};

const PROF_COLOR = {
  'Psy EN EDA': { bg: '#EAF2FB', color: '#254D7A', border: '#BFD9F2', text: '#3B82C4' },
  'MaDR':       { bg: '#E4F4ED', color: '#1E7A52', border: '#B2DFCC', text: '#1E7A52' },
  'MaDP':       { bg: '#FEF0E4', color: '#B85C1A', border: '#F5CFA5', text: '#B85C1A' },
};

const TAGS = ['Observation', 'Entretien famille', 'Liaison enseignant·e', 'Réunion équipe', 'Autre'];

export default function NotesMembreSection({ ficheId, fichePrenomNom = '' }) {
  const [user, setUser]           = useState(null);
  const [notesEquipe, setNotesEquipe] = useState([]);
  const [adding, setAdding]       = useState(false);
  const [draft, setDraft]         = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [editing, setEditing]     = useState(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);

  const load = async () => {
    const [u, all] = await Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.NotesMembre.filter({ fiche_id: ficheId }).catch(() => []),
    ]);
    setUser(u);
    setNotesEquipe((all || []).sort((a, b) => new Date(b.updated_at || b.created_date) - new Date(a.updated_at || a.created_date)));
  };

  useEffect(() => { load(); }, [ficheId]);

  // Souscription temps réel aux notes
  useEffect(() => {
    const unsub = base44.entities.NotesMembre.subscribe(() => load());
    return unsub;
  }, [ficheId]);

  const handlePublish = async () => {
    if (!user) {
      setError('Vous devez être connecté pour ajouter une note.');
      return;
    }
    if (!draft.trim()) {
      setError('La note ne peut pas être vide.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const profession = user.profession || 'Psy EN EDA';
      const noteData = {
        fiche_id: ficheId,
        membre_id: user.id,
        membre_nom: user.full_name,
        membre_profession: profession,
        contenu: draft,
        tags: selectedTags.length > 0 ? selectedTags : null,
        updated_at: new Date().toISOString(),
      };

      if (editing) {
        await base44.entities.NotesMembre.update(editing.id, noteData);
      } else {
        await base44.entities.NotesMembre.create(noteData);
        // Créer une notification pour les autres membres
        await base44.entities.Notification.create({
          type: 'note_member',
          titre: `${user.full_name} a ajouté une note`,
          message: `Note ajoutée sur ${fichePrenomNom}`,
          fiche_id: ficheId,
          expediteur_nom: user.full_name,
          lu: false,
        }).catch(() => {});
      }
      
      setAdding(false);
      setEditing(null);
      setDraft('');
      setSelectedTags([]);
      await load();
    } catch (e) {
      console.error('Erreur publication note:', e);
      setError('Erreur lors de l\'enregistrement. Réessayez ou contactez l\'administratrice.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!confirm('Supprimer cette note ?')) return;
    setSaving(true);
    try {
      await base44.entities.NotesMembre.delete(noteId);
      await load();
    } catch (e) {
      console.error('Erreur suppression note:', e);
    } finally {
      setSaving(false);
    }
  };

  const canEditDelete = (note) => user && (note.membre_id === user.id || user.role === 'admin');
  const cfg = PROF_COLOR[user?.profession] || { bg: '#F0F3F8', color: '#566880', border: '#D8E1EE' };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#182840', margin: 0 }}>💬 Notes de l'équipe</h3>
        {!adding && !editing && (
          <button onClick={() => setAdding(true)}
            style={{ fontSize: 11.5, padding: '6px 14px', borderRadius: 7, background: '#1A3353', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            + Ajouter une note
          </button>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div style={{ background: '#FEF0E4', border: '1px solid #B85C1A', borderRadius: 10, padding: '12px 14px', marginBottom: 14, fontSize: 12.5, color: '#B85C1A', fontWeight: 500, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 14 }}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Zone d'ajout/modification */}
      {(adding || editing) && (
        <div style={{ background: '#F8FAFD', border: '1px solid #D8E1EE', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
          <textarea value={draft} onChange={e => { setDraft(e.target.value); setError(null); }}
            placeholder="Partagez vos observations, actions, discussions…"
            style={{ width: '100%', minHeight: 100, padding: '10px 12px', fontSize: 13, border: '1px solid #D8E1EE', borderRadius: 8, outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', marginBottom: 10 }}
          />
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11.5, fontWeight: 600, color: '#566880', marginBottom: 8 }}>Tags (optionnel)</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TAGS.map(tag => (
                <label key={tag} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: '#182840', fontWeight: 500 }}>
                  <input type="checkbox" checked={selectedTags.includes(tag)} onChange={e => {
                    if (e.target.checked) {
                      setSelectedTags([...selectedTags, tag]);
                    } else {
                      setSelectedTags(selectedTags.filter(t => t !== tag));
                    }
                  }} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                  {tag}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => { setAdding(false); setEditing(null); setDraft(''); setSelectedTags([]); setError(null); }}
              style={{ padding: '8px 16px', fontSize: 12.5, borderRadius: 7, background: 'transparent', border: '1px solid #D8E1EE', cursor: 'pointer', color: '#566880', fontWeight: 600 }}>
              Annuler
            </button>
            <button onClick={handlePublish} disabled={saving || !draft.trim() || !user}
              title={!user ? 'Vous devez être connecté' : !draft.trim() ? 'Veuillez saisir du texte' : ''}
              style={{ padding: '8px 16px', fontSize: 12.5, borderRadius: 7, background: '#1A3353', color: '#fff', border: 'none', cursor: (!user || saving || !draft.trim()) ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: (!user || saving || !draft.trim()) ? 0.5 : 1 }}>
              {saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Publier la note'}
            </button>
          </div>
        </div>
      )}

      {/* Affichage des notes */}
      {notesEquipe.length === 0 ? (
        <p style={{ fontSize: 13, color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
          Aucune note pour le moment. Soyez le premier·e à partager une observation.
        </p>
      ) : (
        notesEquipe.map(note => {
          const isAuthor = user && note.membre_id === user.id;
          const isAdmin = user && user.role === 'admin';
          const displayedProfession = (isAuthor && user.profession) ? user.profession : note.membre_profession;
          const c = PROF_COLOR[displayedProfession] || { bg: '#F0F3F8', color: '#566880', border: '#D8E1EE', text: '#566880' };
          return (
            <div key={note.id} style={{ background: '#fff', border: `1px solid ${c.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {note.membre_nom?.split(' ').map(x => x[0]).join('').slice(0, 2) || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#182840' }}>{note.membre_nom}</div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '.03em', background: c.bg, color: c.text }} title={PROF_LABELS[displayedProfession] || displayedProfession}>
                      {displayedProfession === 'Psy EN EDA' ? 'Psy-EN EDA' : displayedProfession}
                    </span>
                    {note.updated_at && (
                      <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 'auto' }}>
                        {new Date(note.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#182840', lineHeight: 1.6, margin: '0 0 8px 0', whiteSpace: 'pre-wrap' }}>
                {note.contenu}
              </p>
              {note.tags && note.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {note.tags.map((tag, i) => (
                    <span key={i} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 12, background: '#F0F3F8', color: '#566880' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {(isAuthor || isAdmin) && (
                <div style={{ display: 'flex', gap: 8 }}>
                  {isAuthor && (
                    <button onClick={() => { setEditing(note); setDraft(note.contenu); setSelectedTags(note.tags || []); setAdding(false); }}
                      style={{ fontSize: 11.5, padding: '4px 10px', borderRadius: 6, background: 'transparent', border: `1px solid ${c.text}`, color: c.text, cursor: 'pointer', fontWeight: 600 }}>
                      ✏️ Modifier
                    </button>
                  )}
                  <button onClick={() => handleDelete(note.id)} disabled={saving}
                    style={{ fontSize: 11.5, padding: '4px 10px', borderRadius: 6, background: 'transparent', border: '1px solid #EF4444', color: '#EF4444', cursor: 'pointer', fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
                    🗑️ Supprimer
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}