import { useState, useRef, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, Loader, Check, Search, AlertCircle } from 'lucide-react';

export default function ImportElevesPDF({ onDone }) {
  const [step, setStep] = useState('upload'); // upload | parsing | validate | importing | done
  const [dragging, setDragging] = useState(false);
  const [extracted, setExtracted] = useState(null); // { ecole, classe, enseignant, eleves[] }
  const [selected, setSelected] = useState({});
  const [searchQ, setSearchQ] = useState('');
  const [importing, setImporting] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (f && (f.type === 'application/pdf' || f.name.endsWith('.pdf'))) {
      parsePDF(f);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }, []);

  const parsePDF = async (f) => {
    setStep('parsing');
    setError(null);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un assistant expert en extraction de données scolaires françaises.
Ce PDF est une liste de classe issue de Onde ou Base Élèves.
Extrais :
- nom_ecole : le nom complet de l'école (cherche "École", "Ecole", un en-tête)
- nom_classe : la classe (ex: CP, CE1, CE2, CM1, CM2, MS, GS, PS, ULIS, TPS...)
- enseignant : le nom de l'enseignant·e responsable de la classe
- eleves : tableau d'élèves avec nom, prenom, date_naissance (format YYYY-MM-DD si trouvé, sinon vide)

Si plusieurs classes sont dans le PDF, extrais la première ou la classe principale.
Retourne uniquement un objet JSON valide.`,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          nom_ecole: { type: 'string' },
          nom_classe: { type: 'string' },
          enseignant: { type: 'string' },
          eleves: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                nom: { type: 'string' },
                prenom: { type: 'string' },
                date_naissance: { type: 'string' },
              }
            }
          }
        }
      }
    });

    if (!result?.eleves?.length) {
      setError('Aucun élève trouvé dans ce PDF. Vérifiez que c\'est bien une liste de classe.');
      setStep('upload');
      return;
    }

    setExtracted(result);
    const sel = {};
    result.eleves.forEach((_, i) => { sel[i] = true; });
    setSelected(sel);
    setStep('validate');
  };

  const handleImport = async () => {
    setImporting(true);
    const toImport = extracted.eleves.filter((_, i) => selected[i]);
    let ok = 0, err = 0;

    // 1. Récupérer l'année scolaire active
    const annees = await base44.entities.AnneeScolaire.list('-libelle', 50).catch(() => []);
    const anneeActive = annees.find(a => a.est_active || a.active) || annees[0] || null;
    const anneeId = anneeActive?.id || null;

    // 2. Créer ou retrouver l'école
    let ecoleId = null;
    const ecoles = await base44.entities.EcoleRased.list('-nom', 200).catch(() => []);
    const nomEcole = (extracted.nom_ecole || '').trim();
    const ecoleExistante = ecoles.find(e => e.nom?.toLowerCase() === nomEcole.toLowerCase());
    if (ecoleExistante) {
      ecoleId = ecoleExistante.id;
    } else if (nomEcole) {
      const nouvelleEcole = await base44.entities.EcoleRased.create({ nom: nomEcole });
      ecoleId = nouvelleEcole.id;
    }

    // 3. Créer ou retrouver la classe
    let classeId = null;
    const nomClasse = (extracted.nom_classe || '').trim();
    if (ecoleId && nomClasse) {
      const classes = await base44.entities.ClasseEcole.filter({ ecole_id: ecoleId }).catch(() => []);
      const classeExistante = classes.find(c => c.nom?.toLowerCase() === nomClasse.toLowerCase());
      if (classeExistante) {
        classeId = classeExistante.id;
        // Mettre à jour l'enseignant si fourni
        if (extracted.enseignant && extracted.enseignant !== classeExistante.enseignant) {
          await base44.entities.ClasseEcole.update(classeId, { enseignant: extracted.enseignant }).catch(() => {});
        }
      } else {
        const nouvelleClasse = await base44.entities.ClasseEcole.create({
          nom: nomClasse,
          ecole_id: ecoleId,
          enseignant: extracted.enseignant || '',
        });
        classeId = nouvelleClasse.id;
      }
    }

    // 4. Créer ou mettre à jour chaque élève
    const elevesExistants = classeId
      ? await base44.entities.EleveRased.filter({ classe_id: classeId }).catch(() => [])
      : [];

    for (const el of toImport) {
      try {
        const nomNorm = el.nom?.trim().toUpperCase();
        const prenomNorm = el.prenom?.trim();
        const existe = elevesExistants.find(e =>
          e.nom?.toUpperCase() === nomNorm && e.prenom?.trim() === prenomNorm
        );

        if (existe) {
          // Mise à jour si besoin
          await base44.entities.EleveRased.update(existe.id, {
            date_naissance: el.date_naissance || existe.date_naissance,
            ecole_id: ecoleId || existe.ecole_id,
            classe_id: classeId || existe.classe_id,
          });
        } else {
          await base44.entities.EleveRased.create({
            nom: nomNorm,
            prenom: prenomNorm,
            date_naissance: el.date_naissance || null,
            classe_id: classeId || null,
            ecole_id: ecoleId || null,
            statut: 'Nouveau',
          });
        }
        ok++;
      } catch { err++; }
    }

    setStats({ ok, err, ecole: nomEcole, classe: nomClasse, ecoleId });
    setImporting(false);
    setStep('done');
  };

  const toggleAll = (val) => {
    const s = {};
    extracted?.eleves.forEach((_, i) => { s[i] = val; });
    setSelected(s);
  };

  const displayedEleves = (extracted?.eleves || []).filter(el => {
    const name = `${el.prenom} ${el.nom}`.toLowerCase();
    return !searchQ.trim() || name.includes(searchQ.toLowerCase());
  });

  const nbSelected = Object.values(selected).filter(Boolean).length;

  // ── UPLOAD ──────────────────────────────────────────────────────────────
  if (step === 'upload') return (
    <div>
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#FEF0E4', border: '1px solid #F5C6A0', borderRadius: 10, marginBottom: 16, fontSize: 13, color: '#B85C1A' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}
      <div
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        style={{ border: `2px dashed ${dragging ? '#3B82C4' : '#D8E1EE'}`, borderRadius: 16, padding: '60px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, cursor: 'pointer', background: dragging ? '#EAF2FB' : '#fff', transition: 'all .15s' }}
      >
        <Upload size={40} style={{ color: dragging ? '#3B82C4' : '#94A3B8' }} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#182840', margin: '0 0 6px' }}>Déposez le PDF de liste de classe</p>
          <p style={{ fontSize: 13, color: '#566880', margin: 0 }}>Onde, Base Élèves, liste imprimée…</p>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: '8px 0 0' }}>L'IA extraira automatiquement l'école, la classe et les élèves</p>
        </div>
        <input ref={inputRef} type="file" accept="application/pdf,.pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0])} />
      </div>
    </div>
  );

  // ── PARSING ──────────────────────────────────────────────────────────────
  if (step === 'parsing') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '70px 0' }}>
      <Loader size={38} style={{ color: '#3B82C4', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: 16, fontWeight: 700, color: '#182840', margin: 0 }}>Analyse du PDF en cours…</p>
      <p style={{ fontSize: 13, color: '#566880', margin: 0 }}>L'IA extrait l'école, la classe et les élèves</p>
    </div>
  );

  // ── VALIDATE ─────────────────────────────────────────────────────────────
  if (step === 'validate') return (
    <div>
      {/* Récapitulatif extrait */}
      <div style={{ background: '#EAF2FB', border: '1px solid #BFD9F2', borderRadius: 12, padding: '14px 18px', marginBottom: 18, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div>
          <p style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.07em', color: '#566880', margin: '0 0 4px', fontWeight: 600 }}>École</p>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: '#182840', margin: 0 }}>{extracted?.nom_ecole || <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Non détectée</span>}</p>
        </div>
        <div>
          <p style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.07em', color: '#566880', margin: '0 0 4px', fontWeight: 600 }}>Classe</p>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: '#182840', margin: 0 }}>{extracted?.nom_classe || <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Non détectée</span>}</p>
        </div>
        <div>
          <p style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.07em', color: '#566880', margin: '0 0 4px', fontWeight: 600 }}>Enseignant·e</p>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: '#182840', margin: 0 }}>{extracted?.enseignant || <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Non détecté·e</span>}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#182840', margin: 0 }}>{extracted?.eleves.length} élève{extracted?.eleves.length !== 1 ? 's' : ''} extrait{extracted?.eleves.length !== 1 ? 's' : ''}</h3>
          <p style={{ fontSize: 13, color: '#566880', marginTop: 3 }}>{nbSelected} sélectionné{nbSelected !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => toggleAll(true)} style={{ fontSize: 12, padding: '6px 12px', border: '1px solid #D8E1EE', borderRadius: 7, background: '#fff', cursor: 'pointer', color: '#182840' }}>Tout cocher</button>
          <button onClick={() => toggleAll(false)} style={{ fontSize: 12, padding: '6px 12px', border: '1px solid #D8E1EE', borderRadius: 7, background: '#fff', cursor: 'pointer', color: '#182840' }}>Tout décocher</button>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94A3B8' }} />
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Filtrer par nom…"
          style={{ width: '100%', paddingLeft: 38, paddingRight: 14, paddingTop: 9, paddingBottom: 9, fontSize: 13, border: '1px solid #D8E1EE', borderRadius: 9, outline: 'none', boxSizing: 'border-box' }} />
      </div>

      <div style={{ border: '1px solid #D8E1EE', borderRadius: 12, overflow: 'hidden', background: '#fff', maxHeight: 380, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ position: 'sticky', top: 0 }}>
            <tr style={{ background: '#F0F3F8', borderBottom: '1px solid #D8E1EE' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#566880', width: 40 }}></th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#566880' }}>Nom</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#566880' }}>Prénom</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#566880' }}>Date de naissance</th>
            </tr>
          </thead>
          <tbody>
            {displayedEleves.map((el, rawIdx) => {
              const realIdx = extracted.eleves.indexOf(el);
              return (
                <tr key={rawIdx} style={{ borderBottom: rawIdx < displayedEleves.length - 1 ? '1px solid #F0F3F8' : 'none', background: selected[realIdx] ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '9px 14px' }}>
                    <input type="checkbox" checked={!!selected[realIdx]} onChange={e => setSelected(s => ({ ...s, [realIdx]: e.target.checked }))} style={{ width: 15, height: 15, cursor: 'pointer' }} />
                  </td>
                  <td style={{ padding: '9px 14px', fontWeight: 600, color: '#182840' }}>{el.nom}</td>
                  <td style={{ padding: '9px 14px', color: '#182840' }}>{el.prenom}</td>
                  <td style={{ padding: '9px 14px', color: '#566880' }}>{el.date_naissance || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleImport} disabled={nbSelected === 0 || importing}
          style={{ padding: '11px 24px', background: '#1E7A52', color: '#fff', border: 'none', borderRadius: 9, cursor: nbSelected === 0 ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600, opacity: nbSelected === 0 ? 0.5 : 1 }}>
          {importing ? 'Import en cours…' : `Importer ${nbSelected} élève${nbSelected !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );

  // ── IMPORTING ─────────────────────────────────────────────────────────────
  if (step === 'importing') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '70px 0' }}>
      <Loader size={38} style={{ color: '#1E7A52', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#182840', margin: 0 }}>Import en cours…</p>
    </div>
  );

  // ── DONE ─────────────────────────────────────────────────────────────────
  if (step === 'done') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '50px 0' }}>
      <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#E4F4ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Check size={30} style={{ color: '#1E7A52' }} />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#182840', margin: 0 }}>Import terminé !</h3>
      <div style={{ textAlign: 'center', fontSize: 14, color: '#566880', lineHeight: 1.7 }}>
        <p style={{ margin: 0 }}><strong style={{ color: '#182840' }}>{stats?.ok}</strong> élève{stats?.ok !== 1 ? 's' : ''} importé{stats?.ok !== 1 ? 's' : ''}{stats?.err > 0 ? ` · ${stats.err} erreur${stats.err > 1 ? 's' : ''}` : ''}</p>
        {stats?.ecole && <p style={{ margin: '4px 0 0', fontSize: 13 }}>École : <strong>{stats.ecole}</strong> · Classe : <strong>{stats?.classe}</strong></p>}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button onClick={() => { setStep('upload'); setExtracted(null); setSelected({}); setSearchQ(''); setStats(null); }}
          style={{ padding: '10px 20px', background: 'transparent', color: '#566880', border: '1px solid #D8E1EE', borderRadius: 9, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
          Importer un autre PDF
        </button>
        <button onClick={onDone}
          style={{ padding: '10px 22px', background: '#3B82C4', color: '#fff', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          Voir mes écoles →
        </button>
      </div>
    </div>
  );

  return null;
}