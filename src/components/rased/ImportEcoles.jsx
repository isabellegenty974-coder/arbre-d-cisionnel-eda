import { useState, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, File, Loader, Check } from 'lucide-react';

export default function ImportEcoles({ onDone }) {
  const [step, setStep]         = useState('upload'); // upload | parsing | validate | importing | done
  const [file, setFile]         = useState(null);
  const [dragging, setDragging] = useState(false);
  const [ecoles, setEcoles]     = useState([]);
  const [selected, setSelected] = useState({});
  const [importing, setImporting] = useState(false);
  const [stats, setStats]       = useState(null);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (f && (f.type === 'application/pdf' || f.name.endsWith('.pdf'))) {
      setFile(f);
      parsePDF(f);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }, []);

  const parsePDF = async (f) => {
    setStep('parsing');
    const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un assistant qui extrait des données d'un PDF de liste d'écoles d'une circonscription.
Extrais toutes les écoles présentes dans ce document.
Pour chaque école, extrais: nom, adresse, telephone, email, directeur (nom du directeur/directrice), type (parmi: "Maternelle", "Élémentaire", "Les deux").
Si une information est absente, laisse le champ vide.
Retourne un tableau JSON.`,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          ecoles: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                nom: { type: 'string' },
                adresse: { type: 'string' },
                telephone: { type: 'string' },
                email: { type: 'string' },
                directeur: { type: 'string' },
                type: { type: 'string' }
              }
            }
          }
        }
      }
    });
    const extracted = result?.ecoles || [];
    setEcoles(extracted);
    const sel = {};
    extracted.forEach((_, i) => { sel[i] = true; });
    setSelected(sel);
    setStep('validate');
  };

  const handleImport = async () => {
    setImporting(true);
    const toImport = ecoles.filter((_, i) => selected[i]);
    let ok = 0, err = 0;
    for (const ec of toImport) {
      try {
        await base44.entities.EcoleRased.create({
          nom: ec.nom,
          adresse: ec.adresse || '',
          telephone: ec.telephone || '',
          email: ec.email || '',
          directeur: ec.directeur || '',
          type: ['Maternelle', 'Élémentaire', 'Les deux'].includes(ec.type) ? ec.type : 'Élémentaire',
        });
        ok++;
      } catch { err++; }
    }
    setStats({ ok, err, total: toImport.length });
    setImporting(false);
    setStep('done');
  };

  const toggleAll = (val) => {
    const s = {};
    ecoles.forEach((_, i) => { s[i] = val; });
    setSelected(s);
  };

  const nbSelected = Object.values(selected).filter(Boolean).length;

  // ── UPLOAD ──────────────────────────────────────────────────────────────
  if (step === 'upload') return (
    <div>
      <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        style={{ border: `2px dashed ${dragging ? '#3B82C4' : '#D8E1EE'}`, borderRadius: 16, padding: '52px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer', background: dragging ? '#EAF2FB' : '#fff', transition: 'all .15s' }}>
        <Upload size={36} style={{ color: dragging ? '#3B82C4' : '#94A3B8' }} />
        <p style={{ fontSize: 16, fontWeight: 700, color: '#182840', margin: 0 }}>Déposez le PDF de la liste des écoles</p>
        <p style={{ fontSize: 13, color: '#566880', margin: 0 }}>ou cliquez pour choisir un fichier</p>
        <p style={{ fontSize: 11.5, color: '#94A3B8', margin: 0 }}>PDF uniquement · max 10 Mo</p>
        <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
      </div>
      <div style={{ marginTop: 16, padding: '14px 18px', background: '#EAF2FB', borderRadius: 12, fontSize: 13, color: '#254D7A' }}>
        💡 Déposez la liste des écoles de la circonscription (annuaire, document IEN, PDF officiel). L'IA extrait automatiquement les informations de chaque école.
      </div>
    </div>
  );

  // ── PARSING ──────────────────────────────────────────────────────────────
  if (step === 'parsing') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '60px 0' }}>
      <Loader size={36} style={{ color: '#3B82C4', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#182840', margin: 0 }}>Analyse du PDF en cours…</p>
      <p style={{ fontSize: 13, color: '#566880', margin: 0 }}>L'IA extrait les informations de chaque école</p>
    </div>
  );

  // ── VALIDATE ─────────────────────────────────────────────────────────────
  if (step === 'validate') return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#182840', margin: 0 }}>{ecoles.length} école{ecoles.length !== 1 ? 's' : ''} extraite{ecoles.length !== 1 ? 's' : ''}</h3>
          <p style={{ fontSize: 13, color: '#566880', marginTop: 3 }}>Cochez les écoles à importer</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => toggleAll(true)} style={{ fontSize: 12, padding: '6px 12px', border: '1px solid #D8E1EE', borderRadius: 7, background: '#fff', cursor: 'pointer', color: '#182840' }}>Tout cocher</button>
          <button onClick={() => toggleAll(false)} style={{ fontSize: 12, padding: '6px 12px', border: '1px solid #D8E1EE', borderRadius: 7, background: '#fff', cursor: 'pointer', color: '#182840' }}>Tout décocher</button>
        </div>
      </div>

      <div style={{ border: '1px solid #D8E1EE', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F0F3F8', borderBottom: '1px solid #D8E1EE' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#566880', width: 40 }}></th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#566880' }}>Nom de l'école</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#566880' }}>Type</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#566880' }}>Directeur·rice</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#566880' }}>Téléphone</th>
            </tr>
          </thead>
          <tbody>
            {ecoles.map((ec, i) => (
              <tr key={i} style={{ borderBottom: i < ecoles.length - 1 ? '1px solid #F0F3F8' : 'none', background: selected[i] ? '#fff' : '#FAFAFA' }}>
                <td style={{ padding: '10px 14px' }}>
                  <input type="checkbox" checked={!!selected[i]} onChange={e => setSelected(s => ({ ...s, [i]: e.target.checked }))} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                </td>
                <td style={{ padding: '10px 14px', fontWeight: 600, color: '#182840' }}>{ec.nom || '—'}</td>
                <td style={{ padding: '10px 14px', color: '#566880' }}>{ec.type || '—'}</td>
                <td style={{ padding: '10px 14px', color: '#566880' }}>{ec.directeur || '—'}</td>
                <td style={{ padding: '10px 14px', color: '#566880' }}>{ec.telephone || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleImport} disabled={nbSelected === 0 || importing}
          style={{ padding: '10px 22px', background: '#1E7A52', color: '#fff', border: 'none', borderRadius: 9, cursor: nbSelected === 0 ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600, opacity: nbSelected === 0 ? 0.5 : 1 }}>
          {importing ? 'Import en cours…' : `Importer ${nbSelected} école${nbSelected !== 1 ? 's' : ''} sélectionnée${nbSelected !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );

  // ── DONE ─────────────────────────────────────────────────────────────────
  if (step === 'done') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '48px 0' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#E4F4ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Check size={28} style={{ color: '#1E7A52' }} />
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#182840', margin: 0 }}>Import terminé !</h3>
      <p style={{ fontSize: 14, color: '#566880', margin: 0 }}>{stats?.ok} école{stats?.ok !== 1 ? 's' : ''} importée{stats?.ok !== 1 ? 's' : ''} avec succès{stats?.err > 0 ? ` · ${stats.err} erreur${stats.err > 1 ? 's' : ''}` : ''}</p>
      <button onClick={onDone} style={{ padding: '10px 22px', background: '#3B82C4', color: '#fff', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
        Voir mes écoles →
      </button>
    </div>
  );

  return null;
}