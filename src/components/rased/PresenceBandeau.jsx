/**
 * Bandeau affiché en haut d'une fiche si d'autres membres la consultent.
 */
const PROF_COLOR = {
  'Psy EN EDA': { bg: '#EAF2FB', color: '#254D7A', label: 'Psy-EN' },
  'MaDR':       { bg: '#E4F4ED', color: '#1E7A52', label: 'Maître G' },
  'MaDP':       { bg: '#FEF0E4', color: '#B85C1A', label: 'Maître E' },
};

export default function PresenceBandeau({ onFiche }) {
  if (!onFiche || onFiche.length === 0) return null;

  return (
    <div style={{
      background: '#FFF8E1',
      border: '1px solid #FFD54F',
      borderRadius: 10,
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16,
      flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 16 }}>👁️</span>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#7A4F00' }}>
          {onFiche.map((p, i) => {
            const cfg = PROF_COLOR[p.user_profession] || { bg: '#F0F3F8', color: '#566880', label: p.user_profession };
            return (
              <span key={p.id}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '1px 8px', borderRadius: 8, background: cfg.bg, color: cfg.color, fontSize: 12, fontWeight: 700, margin: '0 3px' }}>
                  {p.user_name || cfg.label}
                </span>
                {i < onFiche.length - 1 && ' et '}
              </span>
            );
          })}
          {' '}consulte{onFiche.length > 1 ? 'nt' : ''} aussi cette fiche en ce moment
        </span>
      </div>
      <span style={{ fontSize: 11, color: '#A67B00' }}>Évitez les modifications simultanées</span>
    </div>
  );
}