import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { AlertTriangle, Plus, Check, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CLASSES_LIST = ['TPS', 'PS', 'MS', 'GS', 'CP', 'CE1', 'CE2', 'CM1', 'CM2', 'ULIS', 'Autre'];

function RowStatus({ row }) {
  if (row.isDuplicate) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">DOUBLON</span>;
  if (row.hasError) return <span className="text-amber-500 text-base">⚠</span>;
  return <span className="text-green-500 text-base">✓</span>;
}

export default function ImportStep3({ rows, setRows, analysisResult, ecoleId, onImportDone, onBack }) {
  const [filter, setFilter] = useState('all');
  const [importing, setImporting] = useState(false);

  const updateRow = (id, field, value) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: value };
      updated.hasError = !updated.nom || !updated.prenom;
      return updated;
    }));
  };

  const toggleRow = (id) => setRows(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));

  const toggleAll = () => {
    const nonDupSelected = rows.filter(r => !r.isDuplicate);
    const allOn = nonDupSelected.every(r => r.selected);
    setRows(prev => prev.map(r => r.isDuplicate ? r : { ...r, selected: !allOn }));
  };

  const addRow = () => {
    const id = `row-manual-${Date.now()}`;
    setRows(prev => [...prev, { id, nom: '', prenom: '', date_naissance: '', classe: analysisResult?.classe || '', selected: true, isDuplicate: false, hasError: true }]);
  };

  const deleteRow = (id) => setRows(prev => prev.filter(r => r.id !== id));

  const filtered = rows.filter(r => {
    if (filter === 'ok') return !r.hasError && !r.isDuplicate;
    if (filter === 'errors') return r.hasError || r.isDuplicate;
    return true;
  });

  const selectedCount = rows.filter(r => r.selected && !r.isDuplicate).length;
  const nbDuplicates = rows.filter(r => r.isDuplicate).length;

  const handleImport = async () => {
    setImporting(true);
    const toImport = rows.filter(r => r.selected && !r.isDuplicate);
    let created = 0;
    let missingDates = 0;

    // Create or find classe
    let classeId = null;
    const classeName = analysisResult?.classe || '';
    if (classeName && ecoleId) {
      const existing = await base44.entities.ClasseEcole.filter({ ecole_id: ecoleId }).catch(() => []);
      const found = existing.find(c => c.nom.toLowerCase() === classeName.toLowerCase());
      if (found) {
        classeId = found.id;
      } else {
        const newClasse = await base44.entities.ClasseEcole.create({
          nom: classeName,
          ecole_id: ecoleId,
          enseignant: analysisResult?.enseignant || '',
        });
        classeId = newClasse.id;
      }
    }

    for (const row of toImport) {
      if (!row.date_naissance) missingDates++;
      await base44.entities.EleveRased.create({
        nom: row.nom.trim(),
        prenom: row.prenom.trim(),
        date_naissance: row.date_naissance || undefined,
        classe_id: classeId || undefined,
        ecole_id: ecoleId || undefined,
        statut: 'Nouveau',
        date_derniere_action: new Date().toISOString().split('T')[0],
      });
      created++;
    }

    setImporting(false);
    onImportDone({ created, duplicatesIgnored: nbDuplicates, missingDates });
  };

  return (
    <div className="space-y-4">
      {/* Doublon warning */}
      {nbDuplicates > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span><strong>{nbDuplicates} doublon{nbDuplicates > 1 ? 's' : ''} détecté{nbDuplicates > 1 ? 's' : ''}</strong> — ces élèves sont déjà présents dans l'application et sont décochés par défaut.</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1">
          {['all', 'ok', 'errors'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f ? 'bg-[#0F172A] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}
            >
              {f === 'all' ? `Tous (${rows.length})` : f === 'ok' ? `OK (${rows.filter(r => !r.hasError && !r.isDuplicate).length})` : `À corriger (${rows.filter(r => r.hasError || r.isDuplicate).length})`}
            </button>
          ))}
        </div>
        <button onClick={addRow} className="flex items-center gap-1.5 text-sm text-blue-500 hover:underline font-medium">
          <Plus className="w-4 h-4" /> Ajouter une ligne
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" onChange={toggleAll} checked={rows.filter(r => !r.isDuplicate).every(r => r.selected)} className="rounded" />
                </th>
                <th className="px-4 py-3 w-10 text-xs font-bold text-gray-500">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nom</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Prénom</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date de naissance</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Classe</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(row => (
                <tr
                  key={row.id}
                  className={`transition-colors ${
                    row.isDuplicate ? 'bg-red-50' :
                    row.hasError ? 'bg-amber-50' :
                    'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={row.selected}
                      onChange={() => toggleRow(row.id)}
                      disabled={row.isDuplicate}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <RowStatus row={row} />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      value={row.nom}
                      onChange={e => updateRow(row.id, 'nom', e.target.value)}
                      className={`w-full px-2 py-1 rounded-lg border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-400 ${!row.nom ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      placeholder="NOM"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      value={row.prenom}
                      onChange={e => updateRow(row.id, 'prenom', e.target.value)}
                      className={`w-full px-2 py-1 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 ${!row.prenom ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      placeholder="Prénom"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="date"
                      value={row.date_naissance}
                      onChange={e => updateRow(row.id, 'date_naissance', e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <select
                      value={row.classe}
                      onChange={e => updateRow(row.id, 'classe', e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                    >
                      <option value="">—</option>
                      {CLASSES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => deleteRow(row.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Button>
        <Button
          onClick={handleImport}
          disabled={selectedCount === 0 || importing}
          className="gap-2 bg-blue-500 hover:bg-blue-600 text-white border-0"
        >
          {importing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Import en cours…
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Importer {selectedCount} élève{selectedCount > 1 ? 's' : ''}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}