// Persistance IndexedDB : sel, jeton de vérification, et copie chiffrée de la clé
// pour la session (évite de ressaisir la phrase à chaque rechargement de page).
// La clé maîtresse est chiffrée par une clé de session aléatoire stockée en
// sessionStorage (éphémère, limitée à l'onglet) — jamais en clair sur disque.

import {
  bufToB64, b64ToBuf, generateSalt, deriveKeys,
  makeVerificationToken, checkVerificationToken,
  setKeyMaterial, clearKeyMaterial,
} from './crypto.js';

const DB_NAME = 'rased-crypto';
const STORE = 'kv';
const REC_MAIN = 'main';
const REC_WRAP = 'session-wrap';
const SESSION_KEY_STORAGE = 'rased-session-key';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const r = tx.objectStore(STORE).get(key);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

async function dbPut(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function dbDelete(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// --- Session wrap : clé aléatoire en sessionStorage chiffre la clé maîtresse ---
async function storeSessionWrap(aesKey, hmacKey) {
  const sessionKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']
  );
  const rawSession = await crypto.subtle.exportKey('raw', sessionKey);
  sessionStorage.setItem(SESSION_KEY_STORAGE, bufToB64(rawSession));

  const rawAes = await crypto.subtle.exportKey('raw', aesKey);
  const rawHmac = await crypto.subtle.exportKey('raw', hmacKey);
  const payload = JSON.stringify({ aes: bufToB64(rawAes), hmac: bufToB64(rawHmac) });
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, sessionKey, new TextEncoder().encode(payload)
  );
  await dbPut(REC_WRAP, { data: bufToB64(ct), iv: bufToB64(iv) });
}

async function restoreSessionWrap() {
  const sk = sessionStorage.getItem(SESSION_KEY_STORAGE);
  if (!sk) return false;
  const wrap = await dbGet(REC_WRAP);
  if (!wrap) return false;
  try {
    const sessionKey = await crypto.subtle.importKey(
      'raw', b64ToBuf(sk), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']
    );
    const pt = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(b64ToBuf(wrap.iv)) },
      sessionKey, b64ToBuf(wrap.data)
    );
    const { aes, hmac } = JSON.parse(new TextDecoder().decode(pt));
    const aesKey = await crypto.subtle.importKey(
      'raw', b64ToBuf(aes), { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']
    );
    const hmacKey = await crypto.subtle.importKey(
      'raw', b64ToBuf(hmac), { name: 'HMAC', hash: 'SHA-256' }, true, ['sign']
    );
    setKeyMaterial({ aesKey, hmacKey });
    return true;
  } catch {
    return false;
  }
}

// --- API publique ---

export async function isInitialized() {
  return !!(await dbGet(REC_MAIN));
}

export async function initializeCrypto(passphrase) {
  const salt = generateSalt();
  const { aesKey, hmacKey } = await deriveKeys(passphrase, salt);
  const verification = await makeVerificationToken(aesKey);
  await dbPut(REC_MAIN, { salt: bufToB64(salt), verification });
  setKeyMaterial({ aesKey, hmacKey });
  await storeSessionWrap(aesKey, hmacKey);
}

export async function unlockCrypto(passphrase) {
  const rec = await dbGet(REC_MAIN);
  if (!rec) throw new Error('Crypto non initialisé');
  const salt = new Uint8Array(b64ToBuf(rec.salt));
  const { aesKey, hmacKey } = await deriveKeys(passphrase, salt);
  if (!(await checkVerificationToken(aesKey, rec.verification))) {
    throw new Error('Phrase de passe incorrecte');
  }
  setKeyMaterial({ aesKey, hmacKey });
  await storeSessionWrap(aesKey, hmacKey);
}

export async function tryRestoreSession() {
  return restoreSessionWrap();
}

export async function lockCrypto() {
  sessionStorage.removeItem(SESSION_KEY_STORAGE);
  await dbDelete(REC_WRAP);
  clearKeyMaterial();
}

export async function destroyCrypto() {
  sessionStorage.removeItem(SESSION_KEY_STORAGE);
  await dbDelete(REC_MAIN);
  await dbDelete(REC_WRAP);
  clearKeyMaterial();
}