import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const CLASSES_DEFAULT = ['TPS', 'PS', 'MS', 'GS', 'CP', 'CE1', 'CE2', 'CM1', 'CM2', 'ULIS', 'Autre'];

export default function AddEleveModal({ open, onClose, ecoleId, classes, onSaved }) {
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    date_naissance: '',
    classe_id: '',
    nouvelle_classe: '',
    motif_signalement: '',
    statut: 'Nouveau',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [createClass, setCreateClass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.prenom.trim() || !form.nom.trim()) { setError('Prénom et nom sont requis.'); return; }
    setSaving(true);
    setError('');

    let classeId = form.classe_id;

    // Créer la classe si besoin
    if (createClass && form.nouvelle_classe) {
      const newClasse = await base44.entities.ClasseEcole.create({
        nom: form.nouvelle_classe,
        ecole_id: ecoleId,
      });
      classeId = newClasse.id;
    }

    await base44.entities.EleveRased.create({
      prenom: form.prenom.trim(),
      nom: form.nom.trim(),
      date_naissance: form.date_naissance || undefined,
      classe_id: classeId || undefined,
      ecole_id: ecoleId,
      statut: form.statut,
      origine_import_pdf: false,
      motif_signalement: form.motif_signalement || undefined,
      date_derniere_action: new Date().toISOString().split('T')[0],
    });

    setSaving(false);
    setForm({ prenom: '', nom: '', date_naissance: '', classe_id: '', nouvelle_classe: '', motif_signalement: '', statut: 'Nouveau' });
    setCreateClass(false);
    onSaved();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-bold text-[#0F172A]">Ajouter un élève</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Prénom *</label>
              <input
                type="text"
                value={form.prenom}
                onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                placeholder="Marie"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Nom *</label>
              <input
                type="text"
                value={form.nom}
                onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                placeholder="Dupont"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Date de naissance</label>
            <input
              type="date"
              value={form.date_naissance}
              onChange={e => setForm(f => ({ ...f, date_naissance: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Classe</label>
            {!createClass ? (
              <div className="space-y-2">
                <select
                  value={form.classe_id}
                  onChange={e => setForm(f => ({ ...f, classe_id: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">— Sélectionner ou créer —</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
                <button type="button" onClick={() => setCreateClass(true)} className="text-xs text-blue-500 hover:underline">+ Créer une nouvelle classe</button>
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  value={form.nouvelle_classe}
                  onChange={e => setForm(f => ({ ...f, nouvelle_classe: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Choisir un niveau</option>
                  {CLASSES_DEFAULT.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button type="button" onClick={() => setCreateClass(false)} className="text-xs text-gray-500 hover:underline">← Utiliser une classe existante</button>
              </div>
            )}
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Statut</label>
            <select
              value={form.statut}
              onChange={e => setForm(f => ({ ...f, statut: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option>Nouveau</option>
              <option>Suivi actif</option>
              <option>En attente</option>
              <option>Clôturé</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Motif de signalement</label>
            <textarea
              value={form.motif_signalement}
              onChange={e => setForm(f => ({ ...f, motif_signalement: e.target.value }))}
              placeholder="Difficultés en lecture, comportement agité en classe..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={saving} className="bg-blue-500 hover:bg-blue-600 text-white border-0">
              {saving ? 'Enregistrement...' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}