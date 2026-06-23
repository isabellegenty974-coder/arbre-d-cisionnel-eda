import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Plus, X, Eye, MessageSquare, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ACCESS_LEVELS = [
  { value: 'lecture', label: 'Lecture seule', icon: Eye, color: '#6b7280', bg: '#f3f4f6' },
  { value: 'commentaire', label: 'Peut commenter', icon: MessageSquare, color: '#2563eb', bg: '#dbeafe' },
  { value: 'modification', label: 'Peut modifier', icon: Pencil, color: '#16a34a', bg: '#dcfce7' },
];

const PROF_COLORS = {
  'Psy EN EDA': { color: '#3B82C4', bg: '#EAF2FB' },
  'MaDR': { color: '#1E7A52', bg: '#E4F4ED' },
  'MaDP': { color: '#B85C1A', bg: '#FEF0E4' },
};

const PROF_LABEL = {
  'Psy EN EDA': 'Psychologue de l\'Éducation Nationale · Spécialité EDA',
  'MaDR': 'Maître à Dominante Relationnelle (MaDR)',
  'MaDP': 'Maître à Dominante Pédagogique (MaDP)',
};

const PROF_BADGE = {
  'Psy EN EDA': 'Psy-EN EDA',
  'MaDR': 'MaDR',
  'MaDP': 'MaDP',
};

export default function IntervenantsSection({ ficheId, ficheNom, fichePrenomNom, createdByName, createdByProfession }) {
  const [membres, setMembres] = useState([]);
  const [intervenants, setIntervenants] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedMembre, setSelectedMembre] = useState('');
  const [selectedAccess, setSelectedAccess] = useState('lecture');
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [m, fiche, user] = await Promise.all([
        base44.entities.MembreEquipe.list('-created_date', 100).catch(() => []),
        base44.entities.FicheEleve.get(ficheId).catch(() => null),
        base44.auth.me().catch(() => null),
      ]);
      setMembres(m);
      let intervs = fiche?.intervenants || [];
      
      // Ajouter automatiquement le créateur s'il n'est pas déjà présent
      if (createdByName && createdByProfession) {
        const creatorExists = intervs.some(i => i.nom === createdByName);
        if (!creatorExists) {
          intervs = [
            { nom: createdByName, profession: createdByProfession, acces: 'modification', membre_id: 'creator' },
            ...intervs.filter(i => i.membre_id !== 'creator')
          ];
        }
      }
      
      setIntervenants(intervs);
      setCurrentUser(user);
    };
    load();
  }, [ficheId, createdByName, createdByProfession]);

  const handleAdd = async () => {
    if (!selectedMembre) return;
    const membre = membres.find(m => m.id === selectedMembre);
    if (!membre) return;
    setSaving(true);
    const updated = [
      ...intervenants.filter(i => i.membre_id !== selectedMembre),
      { membre_id: selectedMembre, nom: `${membre.prenom} ${membre.nom}`, profession: membre.profession, acces: selectedAccess }
    ];
    await base44.entities.FicheEleve.update(ficheId, { intervenants: updated });

    // Notification au membre
    await base44.entities.Notification.create({
      type: 'dossier_partage',
      titre: 'Dossier partagé avec vous',
      message: `Le dossier de ${fichePrenomNom} vous a été partagé (${ACCESS_LEVELS.find(a => a.value === selectedAccess)?.label})`,
      fiche_id: ficheId,
      eleve_nom: fichePrenomNom,
      destinataire_email: membre.email || '',
      expediteur_nom: currentUser?.full_name || 'Un collègue',
      lu: false,
    }).catch(() => {});

    setIntervenants(updated);
    setShowAdd(false);
    setSelectedMembre('');
    setSelectedAccess('lecture');
    setSaving(false);
  };

  const handleRemove = async (membreId) => {
    const updated = intervenants.filter(i => i.membre_id !== membreId);
    await base44.entities.FicheEleve.update(ficheId, { intervenants: updated });
    setIntervenants(updated);
  };

  const availableToAdd = membres.filter(m => !intervenants.find(i => i.membre_id === m.id));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <Users className="w-4 h-4" /> Intervenants
        </h2>
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Ajouter
          </button>
        )}
      </div>

      {showAdd && (
        <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-3">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Membre</label>
            <select
              value={selectedMembre}
              onChange={e => setSelectedMembre(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">— Sélectionner un membre —</option>
              {availableToAdd.map(m => (
                <option key={m.id} value={m.id}>{m.prenom} {m.nom} ({m.profession})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Niveau d'accès</label>
            <div className="flex gap-2 flex-wrap">
              {ACCESS_LEVELS.map(({ value, label, icon: Icon, color, bg }) => (
                <button
                  key={value}
                  onClick={() => setSelectedAccess(value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all`}
                  style={selectedAccess === value
                    ? { background: bg, borderColor: color, color }
                    : { background: 'transparent', borderColor: '#e5e7eb', color: '#6b7280' }
                  }
                >
                  <Icon className="w-3 h-3" /> {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setShowAdd(false); setSelectedMembre(''); }} className="text-xs px-3 py-1.5 rounded-md bg-secondary text-foreground hover:bg-secondary/80 transition-colors">Annuler</button>
            <button onClick={handleAdd} disabled={!selectedMembre || saving} className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
              {saving ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </div>
      )}

      {intervenants.length === 0 ? (
       <p className="text-sm text-muted-foreground italic">Aucun intervenant sur ce dossier</p>
      ) : (
       <div className="space-y-2">
          {intervenants.map(({ membre_id, nom, profession, acces }) => {
            const profConf = PROF_COLORS[profession] || { color: '#6b7280', bg: '#f3f4f6' };
            const isCreator = membre_id === 'creator';
            return (
              <div key={membre_id} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/20 border border-border">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: profConf.bg, color: profConf.color }}>
                  {nom?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{nom} {isCreator && '(Créateur)'}</p>
                  <p className="text-xs text-muted-foreground">{PROF_LABEL[profession] || profession}</p>
                </div>
                <div className="flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shrink-0" style={{ background: profConf.bg, color: profConf.color }}>
                  {PROF_BADGE[profession] || profession}
                </div>
                {!isCreator && (
                  <button onClick={() => handleRemove(membre_id)} className="text-gray-300 hover:text-red-400 transition-colors shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}