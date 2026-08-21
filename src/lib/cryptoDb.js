// Persistance IndexedDB : sel + enveloppe (clé maîtresse chiffrée par la phrase de passe
// du membre) + jeton de vérification. Copie chiffrée de la clé maîtresse en session-wrap
// pour les rechargements de page (clé de session éphémère en sessionStorage).
// Chaque membre a son propre sel et sa propre enveloppe, mais la clé maîtresse déchiffrée
// est identique pour toute l'équipe.

import {
  bufToB64, b64ToBuf, generateSalt, deriveWrapKeys,
  generateMasterKey, wrapMasterKey, unwrapMasterKey,
  makeVerificationToken, checkVerificationToken,
  setKeyMaterial, clearKeyMaterial,
} from './crypto.js';

const DB_NAME = 'rased-crypto';
const STORE = 'kv';
const REC_MEMBER = 'member';   // { salt, envelope, verification }
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
async function storeSessionWrap(masterKey) {
  const sessionKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']
  );
  const rawSession = await crypto.subtle.exportKey('raw', sessionKey);
  sessionStorage.setItem(SESSION_KEY_STORAGE, bufToB64(rawSession));

  const rawAes = await crypto.subtle.exportKey('raw', masterKey.aesKey);
  const rawHmac = await crypto.subtle.exportKey('raw', masterKey.hmacKey);
  const payload = JSON.stringify({ aes: bufToB64(rawAes), hmac: bufToB64(rawHmac) });
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, sessionKey, new TextEncoder().encode(payload)
  );
  await dbPut(REC_WRAP, { data: bufToB64(ct), iv: bufToB64(iv) });
}

async function restoreSessionWrap() {
  const sk = sessionStorage.getItem(SESSION_KEY_STORAGE);
  if (!sk) return null;
  const wrap = await dbGet(REC_WRAP);
  if (!wrap) return null;
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
    const masterKey = { aesKey, hmacKey };
    setKeyMaterial(masterKey);
    return masterKey;
  } catch {
    return null;
  }
}

// --- API publique ---

// L'équipe est-elle déjà configurée sur ce poste ?
export async function isInitialized() {
  return !!(await dbGet(REC_MEMBER));
}

// Étape 1 (admin, une seule fois) : génère la clé maîtresse + crée VOTRE enveloppe.
export async function initializeCrypto(passphrase) {
  const masterKey = await generateMasterKey();
  const salt = generateSalt();
  const wrapKey = await deriveWrapKeys(passphrase, salt);
  const envelope = await wrapMasterKey(masterKey, wrapKey);
  const verification = await makeVerificationToken(wrapKey);
  await dbPut(REC_MEMBER, { salt: bufToB64(salt), envelope, verification });
  setKeyMaterial(masterKey);
  await storeSessionWrap(masterKey);
  return masterKey;
}

// Étape 2 (membres) : importe la clé maîtresse depuis un fichier, crée SON enveloppe.
export async function importCrypto(masterKey, passphrase) {
  const salt = generateSalt();
  const wrapKey = await deriveWrapKeys(passphrase, salt);
  const envelope = await wrapMasterKey(masterKey, wrapKey);
  const verification = await makeVerificationToken(wrapKey);
  await dbPut(REC_MEMBER, { salt: bufToB64(salt), envelope, verification });
  setKeyMaterial(masterKey);
  await storeSessionWrap(masterKey);
}

// Déverrouillage quotidien : phrase de passe → dérive clé d'enveloppe → déchiffre enveloppe.
export async function unlockCrypto(passphrase) {
  const rec = await dbGet(REC_MEMBER);
  if (!rec) throw new Error('Crypto non configuré sur ce poste');
  const salt = new Uint8Array(b64ToBuf(rec.salt));
  const wrapKey = await deriveWrapKeys(passphrase, salt);
  if (!(await checkVerificationToken(wrapKey, rec.verification))) {
    throw new Error('Phrase de passe incorrecte');
  }
  const masterKey = await unwrapMasterKey(rec.envelope, wrapKey);
  setKeyMaterial(masterKey);
  await storeSessionWrap(masterKey);
  return masterKey;
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
  await dbDelete(REC_MEMBER);
  await dbDelete(REC_WRAP);
  clearKeyMaterial();
}