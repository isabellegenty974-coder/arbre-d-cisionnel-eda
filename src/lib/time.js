// Fuseau horaire de l'application : La Réunion (Indian/Reunion, UTC+4)
export const APP_TIMEZONE = 'Indian/Reunion';

// Les datetimes stockés par la base ne comportent pas de marqueur de fuseau
// (ex: "2026-07-22T18:27:03.767000"). En l'absence de "Z" ou d'offset, le
// navigateur les interprète en heure locale, ce qui décale les calculs
// relatifs ("il y a Xh") du décalage UTC. On les interprète donc comme UTC.
export function parseDate(s) {
  if (s == null || s === '') return null;
  if (s instanceof Date) return s;
  if (typeof s !== 'string') return new Date(s);
  const str = s.trim();
  if (!str) return null;
  // Date seule (YYYY-MM-DD) : déjà interprétée en UTC par JS
  if (!str.includes('T')) return new Date(str);
  // Déjà un fuseau (Z ou +HH:MM)
  if (/Z$|[+-]\d{2}:?\d{2}$/.test(str)) return new Date(str);
  // Datetime sans fuseau → on suppose UTC
  return new Date(str + 'Z');
}

export function timeAgo(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return '';
  const diff = Date.now() - d.getTime();
  if (diff < 0) return "à l'instant";
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  if (h < 24) return `il y a ${h}h`;
  if (days === 1) return 'hier';
  return `il y a ${days}j`;
}

export function daysSince(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return 0;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

// Formatage absolu dans le fuseau de La Réunion
export function formatDateTime(dateStr, withTime = true) {
  const d = parseDate(dateStr);
  if (!d) return '';
  const opts = {
    timeZone: APP_TIMEZONE,
    day: '2-digit', month: '2-digit', year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  };
  return new Intl.DateTimeFormat('fr-FR', opts).format(d);
}

export function formatDate(dateStr) {
  return formatDateTime(dateStr, false);
}