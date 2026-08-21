// Chiffrement côté navigateur des données identifiantes des élèves.
// Clé maîtresse unique (aléatoire) partagée par l'équipe, enveloppée séparément
// par la phrase de passe de chaque membre. AES-GCM 256 + HMAC-SHA256 via Web Crypto.
// La clé maîtresse n'est jamais envoyée au serveur.

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

// --- Génération de la clé maîtresse (aléatoire, unique pour l'équipe) ---
export async function generateMasterKey() {
  const aesKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']
  );
  const hmacKey = await crypto.subtle.generateKey(
    { name: 'HMAC', hash: 'SHA-256' }, true, ['sign']
  );
  return { aesKey, hmacKey };
}

// --- Dérivation de clé d'enveloppe (propre à chaque membre, depuis sa phrase de passe) ---
export function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

export async function deriveWrapKeys(passphrase, salt) {
  const baseKey = await crypto.subtle.importKey(
    'raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']
  );
  const aesKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']
  );
  return aesKey;
}

// --- Export / import de la clé maîtresse (brut, pour enveloppage) ---
export async function exportMasterKey(masterKey) {
  const rawAes = await crypto.subtle.exportKey('raw', masterKey.aesKey);
  const rawHmac = await crypto.subtle.exportKey('raw', masterKey.hmacKey);
  return { aes: bufToB64(rawAes), hmac: bufToB64(rawHmac) };
}

export async function importMasterKey(exported) {
  const aesKey = await crypto.subtle.importKey(
    'raw', b64ToBuf(exported.aes), { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']
  );
  const hmacKey = await crypto.subtle.importKey(
    'raw', b64ToBuf(exported.hmac), { name: 'HMAC', hash: 'SHA-256' }, true, ['sign']
  );
  return { aesKey, hmacKey };
}

// --- Envelopper la clé maîtresse avec une clé d'enveloppe (phrase de passe d'un membre) ---
export async function wrapMasterKey(masterKey, wrapKey) {
  const raw = await exportMasterKey(masterKey);
  const payload = JSON.stringify(raw);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, wrapKey, enc.encode(payload)
  );
  return { data: bufToB64(ct), iv: bufToB64(iv) };
}

export async function unwrapMasterKey(envelope, wrapKey) {
  const pt = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(b64ToBuf(envelope.iv)) },
    wrapKey, b64ToBuf(envelope.data)
  );
  const exported = JSON.parse(dec.decode(pt));
  return importMasterKey(exported);
}

// --- Fichier d'export chiffré par une phrase de passe temporaire ---
// Format : { version, salt, data } où data = clé maîtresse chiffrée par clé dérivée de la phrase temporaire.
export async function createExportBundle(masterKey, exportPassphrase) {
  const salt = generateSalt();
  const wrapKey = await deriveWrapKeys(exportPassphrase, salt);
  const envelope = await wrapMasterKey(masterKey, wrapKey);
  return {
    version: 1,
    format: 'rased-master-key-export',
    salt: bufToB64(salt),
    data: envelope.data,
    iv: envelope.iv,
  };
}

export async function openExportBundle(bundle, exportPassphrase) {
  if (!bundle || bundle.format !== 'rased-master-key-export') {
    throw new Error('Fichier de clé invalide');
  }
  const salt = new Uint8Array(b64ToBuf(bundle.salt));
  const wrapKey = await deriveWrapKeys(exportPassphrase, salt);
  try {
    return await unwrapMasterKey({ data: bundle.data, iv: bundle.iv }, wrapKey);
  } catch {
    throw new Error('Phrase de passe d\'export incorrecte');
  }
}

// --- AES-GCM encrypt / decrypt (pour les champs élèves) ---
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

// --- Jeton de vérification (valide la phrase de passe d'un membre au déverrouillage) ---
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

// --- Clé maîtresse en mémoire (perdue au rechargement, restaurée via session-wrap) ---
let _keyMaterial = null;

export function setKeyMaterial(km) { _keyMaterial = km; }
export function getKeyMaterial() { return _keyMaterial; }
export function clearKeyMaterial() { _keyMaterial = null; }
export function isUnlocked() { return _keyMaterial !== null; }