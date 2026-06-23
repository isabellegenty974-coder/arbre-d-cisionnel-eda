import { Trash2 } from 'lucide-react';

export default function InterventionItem({ iv, idx, onDelete }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0' }}>
      <div style={{ flex: 1 }}>
        {iv.nom && (
          <span style={{ fontSize: 11.5, fontWeight: 600, color: '#3B82C4', display: 'block', marginBottom: 3 }}>
            {iv.nom}
          </span>
        )}
        {iv.description && (
          <p style={{ fontSize: 13, color: '#182840', lineHeight: 1.5, margin: 0 }}>
            {iv.description}
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