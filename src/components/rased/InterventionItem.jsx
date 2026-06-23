import { useState } from 'react';
import { Trash2 } from 'lucide-react';

const MAX_CHARS = 120;

export default function InterventionItem({ iv, idx, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = iv.description && iv.description.length > MAX_CHARS;
  const displayText = expanded || !isLong ? iv.description : iv.description.substring(0, MAX_CHARS) + '…';

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: 'none' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: '#566880' }}>
            {new Date(iv.date).toLocaleDateString('fr-FR')}
          </span>
          {iv.nom && (
            <span style={{ fontSize: 11.5, fontWeight: 600, color: '#3B82C4' }}>{iv.nom}</span>
          )}
        </div>
        {iv.description && (
          <p style={{ fontSize: 13, color: '#182840', lineHeight: 1.5, margin: 0 }}>
            {displayText}
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                style={{
                  fontSize: 12,
                  color: '#3B82C4',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  marginLeft: 4,
                  padding: 0,
                }}
              >
                {expanded ? 'voir moins' : 'voir plus'}
              </button>
            )}
          </p>
        )}
      </div>
      <button
        onClick={() => onDelete(idx)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4, flexShrink: 0 }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}