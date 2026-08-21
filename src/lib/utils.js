import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
} 


export const isIframe = window.self !== window.top;

// Capitalisation normale : première lettre de chaque mot en majuscule, reste en minuscule.
// Gère les espaces et les tirets (ex: "ECOLE PRIMAIRE PUBLIQUE ROLAND JAMIN" → "Ecole Primaire Publique Roland Jamin").
export function titleCase(str) {
  if (!str) return str;
  return str.toLowerCase().replace(/(^|[\s-])(.)/g, (_m, sep, c) => sep + c.toUpperCase());
}

// Normalisation pour comparaison de noms d'école : insensible à la casse, aux
// accents, aux apostrophes typographiques, aux tirets et aux espaces superflus
// (ex: "École St-Exupéry" et "ecole st exupery" deviennent identiques).
export function normalizeName(str) {
  if (!str) return '';
  return str
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[‘’ʼ`]/g, "'")
    .replace(/[-–—]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}