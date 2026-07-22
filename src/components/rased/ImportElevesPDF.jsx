import { useState, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, Loader, Check, Search, AlertCircle, ChevronDown, ChevronRight, Users } from 'lucide-react';
import { titleCase } from '@/lib/utils';

export default function ImportElevesPDF({ onDone }) {
  const [step, setStep] = useState('upload'); // upload | parsing | validate | importing | done
  const [dragging, setDragging] = useState(false);
  const [extracted, setExtracted] = useState(null); // { nom_ecole, classes: [{ nom_classe, enseignant, eleves }] }
  const [classSel, setClassSel] = useState({}); // { [classIdx]: true/false }
  const [expandedClass, setExpandedClass] = useState(0);
  const [searchQ, setSearchQ] = useState('');
  const [importing, setImporting] = useState(false);
  const [stats, setStats] = useState(null); // { classes: [{ nom, ok, err }], totalOk, totalErr, ecole }
  const [error, setError] = useState(null);
  const [duplicates, setDuplicates] = useState([]); // [{ key, nom, prenom, classIndices: [0,2], chosenClass: 0 }]
  const [dupResolved, setDupResolved] = useState(false);
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

  // ── Détection des doublons entre classes ──────────────────────────────────
  const detectDuplicates = (classes) => {
    const map = {}; // "NOM|prenom" -> [classIdx, ...]
    classes.forEach((cls, ci) => {
      (cls.eleves || []).forEach((el) => {
        const key = `${(el.nom || '').trim().toUpperCase()}|${(el.prenom || '').trim().toLowerCase()}`;
        if (!map[key]) map[key] = { nom: el.nom, prenom: el.prenom, classIndices: [] };
        if (!map[key].classIndices.includes(ci)) map[key].classIndices.push(ci);
      });
    });
    const dups = Object.entries(map)
      .filter(([, v]) => v.classIndices.length > 1)
      .map(([key, v]) => ({ key, nom: v.nom, prenom: v.prenom, classIndices: v.classIndices, chosenClass: v.classIndices[0] }));
    return dups;
  };

  const parsePDF = async (f) => {
    setStep('parsing');
    setError(null);
    setDuplicates([]);
    setDupResolved(false);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: f });

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un assistant expert en extraction de données scolaires françaises.
Ce PDF est une liste de classe issue de Onde ou Base Élèves. Le PDF peut contenir PLUSIEURS classes à la suite (CP, CE1, CE2, CM1, CM2, etc.).

IMPORTANT : Parcours l'intégralité du document et extrais TOUTES les classes présentes, pas uniquement la première.

Pour chaque classe détectée, extrais :
- nom_classe : le nom de la classe (ex: CP, CE1, CE2, CM1, CM2, MS, GS, PS, ULIS, TPS...)
- enseignant : le nom de l'enseignant·e responsable de cette classe
- eleves : tableau d'élèves avec nom, prenom, date_naissance (format YYYY-MM-DD si trouvé, sinon vide)

Extrais aussi :
- nom_ecole : le nom complet de l'école (cherche "École", "Ecole", un en-tête)

Si le PDF contient une seule classe, retourne un tableau classes avec un seul élément.
Retourne uniquement un objet JSON valide.`,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          nom_ecole: { type: 'string' },
          classes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
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
          }
        }
      }
    });

    // Compat : si l'IA retourne l'ancien format (nom_classe + eleves à plat), on l'adapte
    let classes = result?.classes;
    if (!classes && result?.nom_classe) {
      classes = [{ nom_classe: result.nom_classe, enseignant: result.enseignant || '', eleves: result.eleves || [] }];
    }

    if (!classes || classes.length === 0 || !classes.some(c => (c.eleves || []).length > 0)) {
      setError("Aucun élève trouvé dans ce PDF. Vérifiez que c'est bien une liste de classe.");
      setStep('upload');
      return;
    }

    // Filtrer les classes vides
    classes = classes.filter(c => (c.eleves || []).length > 0);

    const data = { nom_ecole: result?.nom_ecole || '', classes };
    setExtracted(data);

    // Précocher toutes les classes
    const sel = {};
    classes.forEach((_, i) => { sel[i] = true; });
    setClassSel(sel);

    // Détecter les doublons
    const dups = detectDuplicates(classes);
    setDuplicates(dups);
    setDupResolved(dups.length === 0);

    setStep('validate');
  };

  // ── Obtenir les élèves d'une classe après résolution des doublons ──────────
  const getElevesForClass = (classIdx) => {
    const cls = extracted.classes[classIdx];
    if (!cls) return [];
    let eleves = [...(cls.eleves || [])];
    // Retirer les élèves des autres classes que celle choisie pour chaque doublon
    duplicates.forEach((dup) => {
      if (dup.classIndices.includes(classIdx) && dup.chosenClass !== classIdx) {
        eleves = eleves.filter(el =>
          !((el.nom || '').trim().toUpperCase() === (dup.nom || '').trim().toUpperCase() &&
            (el.prenom || '').trim().toLowerCase() === (dup.prenom || '').trim().toLowerCase())
        );
      }
    });
    return eleves;
  };

  // ── Import de toutes les classes sélectionnées ─────────────────────────────
  const handleImport = async () => {
    setImporting(true);
    setStep('importing');

    const nomEcole = (extracted.nom_ecole || '').trim();
    const classResults = [];

    // 1. Récupérer l'année scolaire active
    const annees = await base44.entities.AnneeScolaire.list('-libelle', 50).catch(() => []);
    const anneeActive = annees.find(a => a.est_active || a.active) || annees[0] || null;

    // 2. Créer ou retrouver l'école (commune à toutes les classes)
    let ecoleId = null;
    const ecoles = await base44.entities.EcoleRased.list('-nom', 200).catch(() => []);
    const ecoleExistante = ecoles.find(e => e.nom?.toLowerCase() === nomEcole.toLowerCase());
    if (ecoleExistante) {
      ecoleId = ecoleExistante.id;
    } else if (nomEcole) {
      const nouvelleEcole = await base44.entities.EcoleRased.create({ nom: nomEcole });
      ecoleId = nouvelleEcole.id;
    }

    let totalOk = 0, totalErr = 0;

    // 3. Pour chaque classe sélectionnée
    const selectedIndices = extracted.classes.map((_, i) => i).filter(i => classSel[i]);

    for (const ci of selectedIndices) {
      const cls = extracted.classes[ci];
      const nomClasse = (cls.nom_classe || '').trim();
      const enseignant = cls.enseignant || '';
      const eleves = getElevesForClass(ci);
      let ok = 0, err = 0;

      // Créer ou retrouver la classe
      let classeId = null;
      if (ecoleId && nomClasse) {
        const classes = await base44.entities.ClasseEcole.filter({ ecole_id: ecoleId }).catch(() => []);
        const classeExistante = classes.find(c => c.nom?.toLowerCase() === nomClasse.toLowerCase());
        if (classeExistante) {
          classeId = classeExistante.id;
          if (enseignant && enseignant !== classeExistante.enseignant) {
            await base44.entities.ClasseEcole.update(classeId, { enseignant }).catch(() => {});
          }
        } else {
          const nouvelleClasse = await base44.entities.ClasseEcole.create({
            nom: nomClasse, ecole_id: ecoleId, enseignant,
          });
          classeId = nouvelleClasse.id;
        }
      }

      // Créer ou mettre à jour chaque élève
      const elevesExistants = classeId
        ? await base44.entities.EleveRased.filter({ classe_id: classeId }).catch(() => [])
        : [];

      for (const el of eleves) {
        try {
          const nomNorm = el.nom?.trim().toUpperCase();
          const prenomNorm = el.prenom?.trim();
          const existe = elevesExistants.find(e =>
            e.nom?.toUpperCase() === nomNorm && e.prenom?.trim() === prenomNorm
          );
          if (existe) {
            await base44.entities.EleveRased.update(existe.id, {
              date_naissance: el.date_naissance || existe.date_naissance,
              ecole_id: ecoleId || existe.ecole_id,
              classe_id: classeId || existe.classe_id,
            });
          } else {
            await base44.entities.EleveRased.create({
              nom: nomNorm, prenom: prenomNorm,
              date_naissance: el.date_naissance || null,
              classe_id: classeId || null, ecole_id: ecoleId || null,
              statut: 'Nouveau',
            });
          }
          ok++;
        } catch { err++; }
      }

      classResults.push({ nom: nomClasse, enseignant, ok, err, total: eleves.length });
      totalOk += ok;
      totalErr += err;
    }

    setStats({ classes: classResults, totalOk, totalErr, ecole: nomEcole, ecoleId });
    setImporting(false);
    setStep('done');
  };

  const toggleClass = (ci, val) => {
    setClassSel(s => ({ ...s, [ci]: val }));
  };

  const toggleAllClasses = (val) => {
    const s = {};
    extracted?.classes.forEach((_, i) => { s[i] = val; });
    setClassSel(s);
  };

  const nbSelectedClasses = Object.values(classSel).filter(Boolean).length;
  const nbTotalEleves = extracted?.classes.reduce((acc, _, i) => acc + (classSel[i] ? getElevesForClass(i).length : 0), 0) || 0;

  const filteredEleves = (eleves) => {
    if (!searchQ.trim()) return eleves;
    return eleves.filter(el => `${el.prenom} ${el.nom}`.toLowerCase().includes(searchQ.toLowerCase()));
  };

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
          <p style={{ fontSize: 12, color: '#94A3B8', margin: '8px 0 0' }}>L'IA détectera toutes les classes et leurs élèves</p>
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
      <p style={{ fontSize: 13, color: '#566880', margin: 0 }}>L'IA détecte toutes les classes et leurs élèves</p>
    </div>
  );

  // ── VALIDATE ─────────────────────────────────────────────────────────────
  if (step === 'validate') return (
    <div>
      {/* École détectée */}
      <div style={{ background: '#EAF2FB', border: '1px solid #BFD9F2', borderRadius: 12, padding: '14px 18px', marginBottom: 18 }}>
        <p style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.07em', color: '#566880', margin: '0 0 4px', fontWeight: 600 }}>École détectée</p>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#182840', margin: 0 }}>{extracted?.nom_ecole ? titleCase(extracted.nom_ecole) : <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Non détectée</span>}</p>
      </div>

      {/* Doublons entre classes */}
      {duplicates.length > 0 && !dupResolved && (
        <div style={{ background: '#FEF0E4', border: '1px solid #F5C6A0', borderRadius: 12, padding: '16px 18px', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <AlertCircle size={18} style={{ color: '#B85C1A' }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: '#B85C1A', margin: 0 }}>{duplicates.length} doublon{duplicates.length > 1 ? 's' : ''} détecté{duplicates.length > 1 ? 's' : ''}</p>
          </div>
          <p style={{ fontSize: 12.5, color: '#8B4A1A', marginBottom: 14 }}>Ces élèves apparaissent dans plusieurs classes. Choisissez la classe à laquelle ils appartiennent :</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {duplicates.map((dup, di) => (
              <div key={di} style={{ background: '#fff', border: '1px solid #F5C6A0', borderRadius: 8, padding: '10px 14px' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#182840', margin: '0 0 8px' }}>{dup.prenom} {dup.nom}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {dup.classIndices.map(ci => (
                    <button key={ci} onClick={() => setDuplicates(d => d.map((dd, idx) => idx === di ? { ...dd, chosenClass: ci } : dd))}
                      style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 600,
                        border: dup.chosenClass === ci ? '2px solid #B85C1A' : '1px solid #D8E1EE',
                        background: dup.chosenClass === ci ? '#FEF0E4' : '#fff',
                        color: dup.chosenClass === ci ? '#B85C1A' : '#566880' }}>
                      {extracted.classes[ci].nom_classe}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setDupResolved(true)}
            style={{ marginTop: 14, padding: '8px 18px', background: '#B85C1A', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            Valider les choix
          </button>
        </div>
      )}

      {/* Récapitulatif des classes */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#182840', margin: 0 }}>
            {extracted?.classes.length} classe{extracted?.classes.length !== 1 ? 's' : ''} détectée{extracted?.classes.length !== 1 ? 's' : ''}
          </h3>
          <p style={{ fontSize: 13, color: '#566880', marginTop: 3 }}>{nbSelectedClasses} sélectionnée{nbSelectedClasses !== 1 ? 's' : ''} · {nbTotalEleves} élève{nbTotalEleves !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => toggleAllClasses(true)} style={{ fontSize: 12, padding: '6px 12px', border: '1px solid #D8E1EE', borderRadius: 7, background: '#fff', cursor: 'pointer', color: '#182840' }}>Tout cocher</button>
          <button onClick={() => toggleAllClasses(false)} style={{ fontSize: 12, padding: '6px 12px', border: '1px solid #D8E1EE', borderRadius: 7, background: '#fff', cursor: 'pointer', color: '#182840' }}>Tout décocher</button>
        </div>
      </div>

      {/* Recherche */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94A3B8' }} />
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Filtrer par nom d'élève…"
          style={{ width: '100%', paddingLeft: 38, paddingRight: 14, paddingTop: 9, paddingBottom: 9, fontSize: 13, border: '1px solid #D8E1EE', borderRadius: 9, outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {/* Liste des classes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {extracted?.classes.map((cls, ci) => {
          const isSelected = !!classSel[ci];
          const isExpanded = expandedClass === ci;
          const eleves = getElevesForClass(ci);
          const shown = filteredEleves(eleves);
          return (
            <div key={ci} style={{ border: `1px solid ${isSelected ? '#3B82C4' : '#D8E1EE'}`, borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
              {/* En-tête classe */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer' }}
                onClick={() => setExpandedClass(isExpanded ? -1 : ci)}>
                <input type="checkbox" checked={isSelected} onChange={e => { e.stopPropagation(); toggleClass(ci, e.target.checked); }}
                  onClick={e => e.stopPropagation()} style={{ width: 16, height: 16, cursor: 'pointer', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#182840' }}>{cls.nom_classe || 'Classe ?'}</span>
                    {cls.enseignant && <span style={{ fontSize: 11, color: '#566880', background: '#F0F3F8', padding: '2px 8px', borderRadius: 4 }}>{cls.enseignant}</span>}
                  </div>
                  <p style={{ fontSize: 12, color: '#566880', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users size={12} /> {eleves.length} élève{eleves.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {isExpanded ? <ChevronDown size={16} style={{ color: '#94A3B8' }} /> : <ChevronRight size={16} style={{ color: '#94A3B8' }} />}
              </div>
              {/* Détail élèves */}
              {isExpanded && (
                <div style={{ maxHeight: 280, overflowY: 'auto', borderTop: '1px solid #F0F3F8' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead style={{ position: 'sticky', top: 0 }}>
                      <tr style={{ background: '#F0F3F8', borderBottom: '1px solid #D8E1EE' }}>
                        <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 600, color: '#566880' }}>Nom</th>
                        <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 600, color: '#566880' }}>Prénom</th>
                        <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 600, color: '#566880' }}>Date de naissance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shown.length === 0 ? (
                        <tr><td colSpan={3} style={{ padding: '14px', textAlign: 'center', color: '#94A3B8', fontSize: 12 }}>Aucun élève</td></tr>
                      ) : shown.map((el, ei) => (
                        <tr key={ei} style={{ borderBottom: ei < shown.length - 1 ? '1px solid #F0F3F8' : 'none' }}>
                          <td style={{ padding: '7px 14px', fontWeight: 600, color: '#182840' }}>{el.nom}</td>
                          <td style={{ padding: '7px 14px', color: '#182840' }}>{el.prenom}</td>
                          <td style={{ padding: '7px 14px', color: '#566880' }}>{el.date_naissance || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bouton importer */}
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleImport} disabled={nbSelectedClasses === 0 || importing || (duplicates.length > 0 && !dupResolved)}
          style={{ padding: '11px 24px', background: '#1E7A52', color: '#fff', border: 'none', borderRadius: 9, cursor: nbSelectedClasses === 0 || (duplicates.length > 0 && !dupResolved) ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600, opacity: nbSelectedClasses === 0 || (duplicates.length > 0 && !dupResolved) ? 0.5 : 1 }}>
          {importing ? 'Import en cours…' : `Importer ${nbSelectedClasses} classe${nbSelectedClasses !== 1 ? 's' : ''} · ${nbTotalEleves} élève${nbTotalEleves !== 1 ? 's' : ''}`}
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
      <p style={{ fontSize: 13, color: '#566880', margin: 0 }}>Création des classes et des élèves</p>
    </div>
  );

  // ── DONE ─────────────────────────────────────────────────────────────────
  if (step === 'done') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '40px 0' }}>
      <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#E4F4ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Check size={30} style={{ color: '#1E7A52' }} />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#182840', margin: 0 }}>Import terminé !</h3>

      {/* Bilan par classe */}
      <div style={{ width: '100%', background: '#fff', border: '1px solid #D8E1EE', borderRadius: 12, overflow: 'hidden' }}>
        {stats?.classes.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i < stats.classes.length - 1 ? '1px solid #F0F3F8' : 'none' }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#182840' }}>{c.nom || 'Classe ?'}</span>
              {c.enseignant && <span style={{ fontSize: 11, color: '#566880', marginLeft: 8 }}>{c.enseignant}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, color: '#1E7A52', fontWeight: 600 }}>{c.ok} élève{c.ok !== 1 ? 's' : ''} importé{c.ok !== 1 ? 's' : ''}</span>
              <Check size={15} style={{ color: '#1E7A52' }} />
              {c.err > 0 && <span style={{ fontSize: 12, color: '#B85C1A' }}> · {c.err} err.</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div style={{ background: '#EAF2FB', border: '1px solid #BFD9F2', borderRadius: 10, padding: '12px 20px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#182840' }}>
          Total : {stats?.classes.length} classe{stats?.classes.length !== 1 ? 's' : ''} · {stats?.totalOk} élève{stats?.totalOk !== 1 ? 's' : ''} importé{stats?.totalOk !== 1 ? 's' : ''}
        </p>
        {stats?.totalErr > 0 && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#B85C1A' }}>{stats.totalErr} erreur{stats.totalErr > 1 ? 's' : ''}</p>}
        {stats?.ecole && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#566880' }}>École : {titleCase(stats.ecole)}</p>}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button onClick={() => { setStep('upload'); setExtracted(null); setClassSel({}); setStats(null); setDuplicates([]); setDupResolved(false); }}
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