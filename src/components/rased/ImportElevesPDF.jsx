import { useState, useRef, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, Loader, Check, Search } from 'lucide-react';

export default function ImportElevesPDF({ onDone }) {
  const [step, setStep]       = useState('choix-ecole'); // choix-ecole | upload | parsing | validate | importing | done
  const [ecoles, setEcoles]   = useState([]);
  const [ecoleId, setEcoleId] = useState('');
  const [file, setFile]       = useState(null);
  const [dragging, setDragging] = useState(false);
  const [eleves, setEleves]   = useState([]);
  const [selected, setSelected] = useState({});
  const [searchQ, setSearchQ] = useState('');
  const [importing, setImporting] = useState(false);
  const [stats, setStats]     = useState(null);
  const inputRef = useRef();

  useEffect(() => {
    base44.entities.EcoleRased.list('-nom', 100).then(setEcoles).catch(() => []);
  }, []);

  const handleFile = (f) => {
    if (f && (f.type === 'application/pdf' || f.name.endsWith('.pdf'))) {
      setFile(f);
      parsePDF(f);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }, [ecoleId]);

  const parsePDF = async (f) => {
    setStep('parsing');
    const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
    const ecole = ecoles.find(e => e.id === ecoleId);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un assistant qui extrait des listes d'élèves depuis un PDF.
Ce PDF provient de l'école "${ecole?.nom || ''}".
Extrais tous les élèves présents: nom, prenom, date_naissance (format YYYY-MM-DD si possible), classe, enseignant.
Si une information est absente, laisse le champ vide.
Retourne un tableau JSON.`,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          eleves: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                nom: { type: 'string' },
                prenom: { type: 'string' },
                date_naissance: { type: 'string' },
                classe: { type: 'string' },
                enseignant: { type: 'string' }
              }
            }
          }
        }
      }
    });
    const extracted = result?.eleves || [];
    setEleves(extracted);
    const sel = {};
    extracted.forEach((_, i) => { sel[i] = true; });
    setSelected(sel);
    setStep('validate');
  };

  const handleImport = async () => {
    setImporting(true);
    const ecole = ecoles.find(e => e.id === ecoleId);
    const toImport = eleves.filter((_, i) => selected[i]);
    let ok = 0, err = 0;
    for (const el of toImport) {
      try {
        await base44.entities.FicheEleve.create({
          nom: el.nom,
          prenom: el.prenom,
          classe: el.classe || '',
          ecole: ecole?.nom || '',
          date_naissance: el.date_naissance || null,
          date: new Date().toISOString().split('T')[0],
        });
        ok++;
      } catch { err++; }
    }
    setStats({ ok, err });
    setImporting(false);
    setStep('done');
  };

  const toggleAll = (val) => {
    const s = {};
    eleves.forEach((_, i) => { s[i] = val; });
    setSelected(s);
  };

  const displayedEleves = eleves.filter((el, i) => {
    const name = `${el.prenom} ${el.nom}`.toLowerCase();
    return !searchQ.trim() || name.includes(searchQ.toLowerCase());
  });

  const nbSelected = Object.values(selected).filter(Boolean).length;

  // ── CHOIX ÉCOLE ──────────────────────────────────────────────────────────
  if (step === 'choix-ecole') return (
    <div>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#182840', marginBottom: 10 }}>1. Choisissez l'école concernée</p>
      <select value={ecoleId} onChange={e => setEcoleId(e.target.value)}
        style={{ width: '100%', padding: '11px 14px', border: '1px solid #D8E1EE', borderRadius: 10, fontSize: 14, color: ecoleId ? '#182840' : '#94A3B8', background: '#fff', outline: 'none', marginBottom: 20 }}>
        <option value="">— Sélectionner une école —</option>
        {ecoles.map(ec => <option key={ec.id} value={ec.id}>{ec.nom}</option>)}
      </select>
      <button onClick={() => setStep('upload')} disabled={!ecoleId}
        style={{ padding: '10px 22px', background: '#3B82C4', color: '#fff', border: 'none', borderRadius: 9, cursor: ecoleId ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 600, opacity: ecoleId ? 1 : 0.4 }}>
        Continuer →
      </button>
      {ecoles.length === 0 && (
        <p style={{ marginTop: 14, fontSize: 13, color: '#B85C1A' }}>⚠️ Aucune école enregistrée. Importez d'abord une liste d'écoles.</p>
      )}
    </div>
  );

  // ── UPLOAD ──────────────────────────────────────────────────────────────
  if (step === 'upload') return (
    <div>
      <p style={{ fontSize: 13, color: '#566880', marginBottom: 14 }}>
        École : <strong style={{ color: '#182840' }}>{ecoles.find(e => e.id === ecoleId)?.nom}</strong>
        <button onClick={() => setStep('choix-ecole')} style={{ marginLeft: 10, fontSize: 12, color: '#3B82C4', background: 'none', border: 'none', cursor: 'pointer' }}>Changer</button>
      </p>
      <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        style={{ border: `2px dashed ${dragging ? '#3B82C4' : '#D8E1EE'}`, borderRadius: 16, padding: '52px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer', background: dragging ? '#EAF2FB' : '#fff', transition: 'all .15s' }}>
        <Upload size={36} style={{ color: dragging ? '#3B82C4' : '#94A3B8' }} />
        <p style={{ fontSize: 16, fontWeight: 700, color: '#182840', margin: 0 }}>Déposez le PDF de la liste de classe</p>
        <p style={{ fontSize: 13, color: '#566880', margin: 0 }}>Onde, Base élèves, liste imprimée…</p>
        <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
      </div>
    </div>
  );

  // ── PARSING ──────────────────────────────────────────────────────────────
  if (step === 'parsing') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '60px 0' }}>
      <Loader size={36} style={{ color: '#3B82C4', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#182840', margin: 0 }}>Analyse du PDF en cours…</p>
      <p style={{ fontSize: 13, color: '#566880', margin: 0 }}>L'IA extrait la liste des élèves</p>
    </div>
  );

  // ── VALIDATE ─────────────────────────────────────────────────────────────
  if (step === 'validate') return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#182840', margin: 0 }}>{eleves.length} élève{eleves.length !== 1 ? 's' : ''} extrait{eleves.length !== 1 ? 's' : ''}</h3>
          <p style={{ fontSize: 13, color: '#566880', marginTop: 3 }}>{nbSelected} sélectionné{nbSelected !== 1 ? 's' : ''} sur {eleves.length}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => toggleAll(true)} style={{ fontSize: 12, padding: '6px 12px', border: '1px solid #D8E1EE', borderRadius: 7, background: '#fff', cursor: 'pointer', color: '#182840' }}>Tout cocher</button>
          <button onClick={() => toggleAll(false)} style={{ fontSize: 12, padding: '6px 12px', border: '1px solid #D8E1EE', borderRadius: 7, background: '#fff', cursor: 'pointer', color: '#182840' }}>Tout décocher</button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94A3B8' }} />
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Filtrer par nom…"
          style={{ width: '100%', paddingLeft: 38, paddingRight: 14, paddingTop: 9, paddingBottom: 9, fontSize: 13, border: '1px solid #D8E1EE', borderRadius: 9, outline: 'none', boxSizing: 'border-box' }} />
      </div>

      <div style={{ border: '1px solid #D8E1EE', borderRadius: 12, overflow: 'hidden', background: '#fff', maxHeight: 400, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ position: 'sticky', top: 0 }}>
            <tr style={{ background: '#F0F3F8', borderBottom: '1px solid #D8E1EE' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#566880', width: 40 }}></th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#566880' }}>Nom</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#566880' }}>Prénom</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#566880' }}>Classe</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#566880' }}>Enseignant·e</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#566880' }}>Naissance</th>
            </tr>
          </thead>
          <tbody>
            {displayedEleves.map((el, rawIdx) => {
              const realIdx = eleves.indexOf(el);
              return (
                <tr key={rawIdx} style={{ borderBottom: rawIdx < displayedEleves.length - 1 ? '1px solid #F0F3F8' : 'none', background: selected[realIdx] ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '9px 14px' }}>
                    <input type="checkbox" checked={!!selected[realIdx]} onChange={e => setSelected(s => ({ ...s, [realIdx]: e.target.checked }))} style={{ width: 15, height: 15, cursor: 'pointer' }} />
                  </td>
                  <td style={{ padding: '9px 14px', fontWeight: 600, color: '#182840' }}>{el.nom}</td>
                  <td style={{ padding: '9px 14px', color: '#182840' }}>{el.prenom}</td>
                  <td style={{ padding: '9px 14px', color: '#566880' }}>{el.classe || '—'}</td>
                  <td style={{ padding: '9px 14px', color: '#566880' }}>{el.enseignant || '—'}</td>
                  <td style={{ padding: '9px 14px', color: '#566880' }}>{el.date_naissance || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleImport} disabled={nbSelected === 0 || importing}
          style={{ padding: '10px 22px', background: '#1E7A52', color: '#fff', border: 'none', borderRadius: 9, cursor: nbSelected === 0 ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600, opacity: nbSelected === 0 ? 0.5 : 1 }}>
          {importing ? 'Import en cours…' : `Importer ${nbSelected} élève${nbSelected !== 1 ? 's' : ''} sélectionné${nbSelected !== 1 ? 's' : ''}`}
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
      <p style={{ fontSize: 14, color: '#566880', margin: 0 }}>{stats?.ok} élève{stats?.ok !== 1 ? 's' : ''} importé{stats?.ok !== 1 ? 's' : ''}{stats?.err > 0 ? ` · ${stats.err} erreur${stats.err > 1 ? 's' : ''}` : ''}</p>
      <button onClick={onDone} style={{ padding: '10px 22px', background: '#3B82C4', color: '#fff', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
        Voir les élèves →
      </button>
    </div>
  );

  return null;
}