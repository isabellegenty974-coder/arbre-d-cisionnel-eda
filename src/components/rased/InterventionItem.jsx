import { Trash2 } from 'lucide-react';

export default function InterventionItem({ iv, idx, onDelete }) {
  // Si la description contient un rapport complet, on n'en garde qu'un court résumé
  const cleanDescription = (desc) => {
    if (!desc) return '';
    // Supprimer les marqueurs markdown et titres de rapport
    let cleaned = desc
      .replace(/\[.*?\]/g, '')
      .replace(/^#+\s.*$/gm, '')
      .replace(/\*\*/g, '')
      .replace(/---/g, '')
      .trim();
    // Prendre uniquement la première phrase/ligne pertinente
    const firstLine = cleaned.split('\n').find(l => l.trim().length > 0) || '';
    // Tronquer à 120 caractères
    return firstLine.length > 120 ? firstLine.substring(0, 120) + '…' : firstLine;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
          {iv.date && (
            <span style={{ fontSize: 11.5, fontWeight: 600, color: '#566880' }}>
              {new Date(iv.date).toLocaleDateString('fr-FR')}
            </span>
          )}
          {iv.nom && (
            <span style={{ fontSize: 11.5, fontWeight: 600, color: '#3B82C4' }}>{iv.nom}</span>
          )}
        </div>
        {iv.description && (
          <p style={{ fontSize: 13, color: '#182840', lineHeight: 1.5, margin: 0 }}>
            {cleanDescription(iv.description)}
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