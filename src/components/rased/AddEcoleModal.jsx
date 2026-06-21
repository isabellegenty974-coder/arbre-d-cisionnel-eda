import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const TYPES = ['Maternelle', 'Élémentaire', 'Les deux'];

const EMPTY_FORM = {
  nom: '',
  type: 'Élémentaire',
  commune: '',
  adresse: '',
  telephone: '',
  email: '',
  directeur: '',
  nombre_classes: '',
  membres_rased: [],
};

export default function AddEcoleModal({ open, onClose, membres, onSaved, ecole = null }) {
  const isEdit = !!ecole;
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (ecole) {
        setForm({
          nom: ecole.nom || '',
          type: ecole.type || 'Élémentaire',
          commune: ecole.commune || '',
          adresse: ecole.adresse || '',
          telephone: ecole.telephone || '',
          email: ecole.email || '',
          directeur: ecole.directeur || '',
          nombre_classes: ecole.nombre_classes || '',
          membres_rased: ecole.membres_rased || [],
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setError('');
    }
  }, [open, ecole]);

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
    const data = {
      ...form,
      nombre_classes: form.nombre_classes ? Number(form.nombre_classes) : undefined,
    };
    if (isEdit) {
      await base44.entities.EcoleRased.update(ecole.id, data);
    } else {
      await base44.entities.EcoleRased.create(data);
    }
    setSaving(false);
    onSaved();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-[#0F172A]">{isEdit ? 'Modifier l\'école' : 'Ajouter une école'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Nom */}
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

          {/* Type + Commune */}
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
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Commune</label>
              <input
                type="text"
                value={form.commune}
                onChange={e => setForm(f => ({ ...f, commune: e.target.value }))}
                placeholder="Saint-Denis"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Adresse */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Adresse postale</label>
            <input
              type="text"
              value={form.adresse}
              onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))}
              placeholder="12 rue de la République, 97400 Saint-Denis"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Téléphone + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Téléphone</label>
              <input
                type="tel"
                value={form.telephone}
                onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                placeholder="02 62 12 34 56"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="ce.974000@ac-reunion.fr"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Directeur + Nb classes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Directeur / Directrice</label>
              <input
                type="text"
                value={form.directeur}
                onChange={e => setForm(f => ({ ...f, directeur: e.target.value }))}
                placeholder="Mme Dupont"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Nb de classes</label>
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

          {/* Membres RASED */}
          {membres && membres.length > 0 && (
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Membres RASED affectés</label>
              <div className="space-y-2 max-h-36 overflow-y-auto border border-gray-100 rounded-xl p-2">
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
              {saving ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}