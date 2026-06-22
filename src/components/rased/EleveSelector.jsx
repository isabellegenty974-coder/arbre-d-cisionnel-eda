import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Sélecteur d'élève intelligent réutilisable.
 * Props:
 *   onSelect(fiche) — appelé quand un élève est sélectionné
 *   placeholder — texte du champ
 *   selectedEleve — élève déjà sélectionné {prenom, nom, classe, ecole}
 *   onClear — callback quand on efface la sélection
 */
export default function EleveSelector({ onSelect, placeholder = 'Rechercher un élève…', selectedEleve, onClear }) {
  const navigate = useNavigate();
  const [query, setQuery]       = useState('');
  const [fiches, setFiches]     = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [open, setOpen]         = useState(false);
  const [filterEcole, setFilterEcole]   = useState('');
  const [filterClasse, setFilterClasse] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const ref = useRef();

  useEffect(() => {
    base44.entities.FicheEleve.list('-updated_date', 300).then(setFiches).catch(() => []);
  }, []);

  useEffect(() => {
    let res = fiches;
    if (query.trim()) {
      const q = query.toLowerCase();
      res = res.filter(f => `${f.prenom} ${f.nom}`.toLowerCase().includes(q) || `${f.nom} ${f.prenom}`.toLowerCase().includes(q));
    }
    if (filterEcole)  res = res.filter(f => f.ecole === filterEcole);
    if (filterClasse) res = res.filter(f => f.classe === filterClasse);
    setFiltered(res.slice(0, 20));
  }, [query, fiches, filterEcole, filterClasse]);

  // Fermer si clic extérieur
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const ecoles  = [...new Set(fiches.map(f => f.ecole).filter(Boolean))].sort();
  const classes = [...new Set(fiches.filter(f => !filterEcole || f.ecole === filterEcole).map(f => f.classe).filter(Boolean))].sort();

  if (selectedEleve) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#EAF2FB', border: '1px solid #BFD9F2', borderRadius: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#3B82C4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          {selectedEleve.prenom?.[0]}{selectedEleve.nom?.[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#182840' }}>{selectedEleve.prenom} {selectedEleve.nom}</div>
          <div style={{ fontSize: 12, color: '#566880' }}>{[selectedEleve.classe, selectedEleve.ecole].filter(Boolean).join(' · ')}</div>
        </div>
        {onClear && (
          <button onClick={onClear} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#566880', padding: 4 }}>
            <X size={16} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Champ recherche */}
      <div style={{ position: 'relative' }}>
        <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94A3B8' }} />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          style={{ width: '100%', paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10, fontSize: 14, border: '1px solid #D8E1EE', borderRadius: 10, outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, background: '#fff', border: '1px solid #D8E1EE', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,.12)', marginTop: 4, overflow: 'hidden' }}>
          {/* Filtres rapides */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #F0F3F8', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select value={filterEcole} onChange={e => setFilterEcole(e.target.value)} style={{ fontSize: 12, padding: '4px 8px', border: '1px solid #D8E1EE', borderRadius: 6, color: filterEcole ? '#182840' : '#94A3B8', background: '#fff', cursor: 'pointer' }}>
              <option value="">Toutes les écoles</option>
              {ecoles.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <select value={filterClasse} onChange={e => setFilterClasse(e.target.value)} style={{ fontSize: 12, padding: '4px 8px', border: '1px solid #D8E1EE', borderRadius: 6, color: filterClasse ? '#182840' : '#94A3B8', background: '#fff', cursor: 'pointer' }}>
              <option value="">Toutes les classes</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Résultats */}
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '20px', fontSize: 13, color: '#566880' }}>Aucun élève trouvé</p>
            ) : filtered.map(f => (
              <button key={f.id} onClick={() => { onSelect(f); setOpen(false); setQuery(''); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background .1s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFD'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#3B82C4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {f.prenom?.[0]}{f.nom?.[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#182840' }}>{f.prenom} {f.nom}</div>
                  <div style={{ fontSize: 11.5, color: '#566880', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {[f.classe, f.ecole].filter(Boolean).join(' · ')}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Créer nouveau */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid #F0F3F8' }}>
            <button onClick={() => { setOpen(false); navigate('/fiche-eleve'); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: '#F0F3F8', border: '1px dashed #D8E1EE', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#3B82C4' }}>
              <Plus size={15} /> Créer une nouvelle fiche élève
            </button>
          </div>
        </div>
      )}
    </div>
  );
}