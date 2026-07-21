import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Check } from 'lucide-react';

const CATEGORIES = {
  apprentissages: {
    label: 'Apprentissages',
    icon: '📖',
    color: '#3B82C4',
    bg: '#EAF2FB',
    items: [
      'Lecture / Décodage',
      'Écriture / Graphisme',
      'Mathématiques / Numération',
      'Production écrite',
      'Compréhension',
      'Méthodes de travail',
    ],
  },
  comportement: {
    label: 'Comportement',
    icon: '🧠',
    color: '#EC6B8A',
    bg: '#FCE8EE',
    items: [
      'Anxiété / Inhibition',
      'Agitation / Impulsivité',
      'Opposition / Refus',
      'Difficultés relationnelles',
      'Repli sur soi',
    ],
  },
  developpement: {
    label: 'Développement',
    icon: '🌱',
    color: '#1E7A52',
    bg: '#E4F4ED',
    items: [
      'Attention / Concentration',
      'Langage oral',
      'Motricité fine',
      'Motricité globale',
      'Interactions sociales',
    ],
  },
  contexte: {
    label: 'Contexte',
    icon: '🏠',
    color: '#B85C1A',
    bg: '#FEF0E4',
    items: [
      'Difficultés familiales',
      'Absentéisme',
      'Changements récents',
      'Climat de classe',
    ],
  },
  autre: {
    label: 'Autre',
    icon: '📌',
    color: '#5B3FA6',
    bg: '#EEE9FF',
    items: [
      'Situation de handicap',
      'Autre (préciser)',
    ],
  },
};

export default function ProblematiquesSection({ ficheId, problematiques, onUpdate }) {
  const [data, setData] = useState(problematiques || {});
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const toggle = async (catKey, item) => {
    const current = data[catKey] || [];
    const exists = current.includes(item);
    const next = exists ? current.filter(i => i !== item) : [...current, item];
    const updated = { ...data, [catKey]: next };
    setData(updated);
    setSaving(true);
    try {
      await base44.entities.FicheEleve.update(ficheId, { problematiques: updated });
      onUpdate?.(updated);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1800);
    } catch (e) {
      console.error('Erreur sauvegarde problématiques:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleAutreDetail = async (value) => {
    const updated = { ...data, autre_detail: value };
    setData(updated);
    setSaving(true);
    try {
      await base44.entities.FicheEleve.update(ficheId, { problematiques: updated });
      onUpdate?.(updated);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1800);
    } catch (e) {
      console.error('Erreur sauvegarde détail autre:', e);
    } finally {
      setSaving(false);
    }
  };

  const isChecked = (catKey, item) => (data[catKey] || []).includes(item);
  const autreChecked = isChecked('autre', 'Autre (préciser)');

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Object.entries(CATEGORIES).map(([catKey, cat]) => (
          <div key={catKey}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
              <span style={{ fontSize: 15 }}>{cat.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: cat.color, textTransform: 'uppercase', letterSpacing: '.05em' }}>{cat.label}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {cat.items.map(item => {
                const checked = isChecked(catKey, item);
                return (
                  <button
                    key={item}
                    onClick={() => toggle(catKey, item)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '9px 11px', borderRadius: 8,
                      border: `1.5px solid ${checked ? cat.color : '#D8E1EE'}`,
                      background: checked ? cat.bg : '#fff',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all .14s', fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                      border: `1.5px solid ${checked ? cat.color : '#94A3B8'}`,
                      background: checked ? cat.color : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {checked && <Check size={12} color="#fff" strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: 12.5, fontWeight: checked ? 600 : 400, color: checked ? cat.color : '#182840', lineHeight: 1.25 }}>{item}</span>
                  </button>
                );
              })}
            </div>
            {catKey === 'autre' && autreChecked && (
              <input
                type="text"
                value={data.autre_detail || ''}
                onChange={e => handleAutreDetail(e.target.value)}
                placeholder="Précisez la problématique…"
                style={{
                  width: '100%', marginTop: 8, padding: '8px 10px',
                  borderRadius: 8, border: '1.5px solid #5B3FA6',
                  fontSize: 12.5, outline: 'none', boxSizing: 'border-box',
                  fontFamily: 'Inter, sans-serif', background: '#FAFBFE',
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 7, minHeight: 18 }}>
        {saving && <span style={{ fontSize: 11, color: '#566880' }}>Enregistrement…</span>}
        {savedFlash && !saving && (
          <span style={{ fontSize: 11, fontWeight: 600, color: '#1E7A52' }}>✅ Enregistré</span>
        )}
      </div>
    </div>
  );
}