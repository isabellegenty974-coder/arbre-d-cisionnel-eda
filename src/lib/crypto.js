// Chiffrement côté navigateur des données identifiantes des élèves.
// AES-GCM 256 + PBKDF2 (250k itérations) via Web Crypto API.
// La clé dérivée n'est jamais envoyée au serveur ni stockée en clair.

const enc = new TextEncoder();
const dec = new TextDecoder();

const PBKDF2_ITERATIONS = 250000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const VERIFICATION_TOKEN = 'RASED_CRYPTO_OK';

// --- Base64 helpers ---
export function bufToB64(buf) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function b64ToBuf(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

// --- Key derivation ---
export function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

export async function deriveKeys(passphrase, salt) {
  const baseKey = await crypto.subtle.importKey(
    'raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']
  );
  const aesKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']
  );
  const hmacKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey, { name: 'HMAC', hash: 'SHA-256' }, true, ['sign']
  );
  return { aesKey, hmacKey };
}

// --- AES-GCM encrypt / decrypt (IV aléatoire => cipher différent à chaque fois) ---
export async function encrypt(aesKey, plaintext) {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, enc.encode(plaintext));
  return { ciphertext: bufToB64(ct), iv: bufToB64(iv) };
}

export async function decrypt(aesKey, ciphertextB64, ivB64) {
  const pt = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(b64ToBuf(ivB64)) },
    aesKey, b64ToBuf(ciphertextB64)
  );
  return dec.decode(pt);
}

// --- Normalisation pour empreinte déterministe ---
export function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// --- Empreinte HMAC déterministe (pour déduplication) ---
export async function fingerprint(hmacKey, ...parts) {
  const message = parts.map(normalize).join('|');
  const sig = await crypto.subtle.sign('HMAC', hmacKey, enc.encode(message));
  return bufToB64(sig);
}

// --- Jeton de vérification (valide la phrase de passe au déverrouillage) ---
export async function makeVerificationToken(aesKey) {
  return encrypt(aesKey, VERIFICATION_TOKEN);
}

export async function checkVerificationToken(aesKey, token) {
  try {
    const val = await decrypt(aesKey, token.ciphertext, token.iv);
    return val === VERIFICATION_TOKEN;
  } catch {
    return false;
  }
}

// --- Clé en mémoire (perdue au rechargement, restaurée via session-wrap) ---
let _keyMaterial = null;

export function setKeyMaterial(km) { _keyMaterial = km; }
export function getKeyMaterial() { return _keyMaterial; }
export function clearKeyMaterial() { _keyMaterial = null; }
export function isUnlocked() { return _keyMaterial !== null; }