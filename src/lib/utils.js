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