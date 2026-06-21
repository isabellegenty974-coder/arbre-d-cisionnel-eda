import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const TYPES = ['Maternelle', 'Élémentaire', 'Les deux'];

export default function AddEcoleModal({ open, onClose, membres, onSaved }) {
  const [form, setForm] = useState({
    nom: '',
    type: 'Élémentaire',
    commune: '',
    nombre_classes: '',
    membres_rased: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggle = (id) => {
    setForm(f => ({
      ...f,
      membres_rased: f.membres_rased.includes(id)
        ? f.membres_rased.filter(m => m !== id)
        : [...f.membres_rased, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom.trim()) { setError('Le nom est requis.'); return; }
    setSaving(true);
    setError('');
    await base44.entities.EcoleRased.create({
      ...form,
      nombre_classes: form.nombre_classes ? Number(form.nombre_classes) : undefined,
    });
    setSaving(false);
    setForm({ nom: '', type: 'Élémentaire', commune: '', nombre_classes: '', membres_rased: [] });
    onSaved();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#0F172A]">Ajouter une école</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Nom de l'école *</label>
            <input
              type="text"
              value={form.nom}
              onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
              placeholder="École primaire Jules Ferry"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Nb classes</label>
              <input
                type="number"
                min="1"
                value={form.nombre_classes}
                onChange={e => setForm(f => ({ ...f, nombre_classes: e.target.value }))}
                placeholder="6"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Commune</label>
            <input
              type="text"
              value={form.commune}
              onChange={e => setForm(f => ({ ...f, commune: e.target.value }))}
              placeholder="Saint-Denis"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          {membres.length > 0 && (
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Membres RASED affectés</label>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {membres.map(m => (
                  <label key={m.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={form.membres_rased.includes(m.id)}
                      onChange={() => toggle(m.id)}
                      className="w-4 h-4 rounded text-blue-500"
                    />
                    <span className="text-sm text-gray-700">{m.prenom} {m.nom} <span className="text-gray-400">({m.profession})</span></span>
                  </label>
                ))}
              </div>
            </div>
          )}
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