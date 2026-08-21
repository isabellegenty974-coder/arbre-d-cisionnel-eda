// Couche de lecture/écriture : chiffre/déchiffre les champs identifiants des élèves
// et calcule l'empreinte déterministe (_fp) pour la détection de doublons.
// Champs concernés : nom, prenom, date_naissance.
// Les autres champs (classe, ecole, etc.) restent en clair.

import { getKeyMaterial, encrypt, decrypt, fingerprint } from './crypto.js';

const ENCRYPTED_FIELDS = ['nom', 'prenom', 'date_naissance'];
const ENC_PREFIX = 'enc:';

function isEncrypted(val) {
  return typeof val === 'string' && val.startsWith(ENC_PREFIX);
}

// Chiffre les champs sensibles d'un enregistrement élève avant envoi au serveur.
// Ajoute _fp (empreinte HMAC) pour la déduplication côté serveur.
export async function encryptEleveFields(rawRecord) {
  const km = getKeyMaterial();
  if (!km) throw new Error('Crypto verrouillé : déverrouillez avec la phrase de passe');
  const out = { ...rawRecord };
  for (const f of ENCRYPTED_FIELDS) {
    const v = rawRecord[f];
    if (v != null && v !== '') {
      const { ciphertext, iv } = await encrypt(km.aesKey, String(v));
      out[f] = `${ENC_PREFIX}${ciphertext}:${iv}`;
    }
  }
  out._fp = await fingerprint(km.hmacKey, rawRecord.nom, rawRecord.prenom, rawRecord.date_naissance || '');
  return out;
}

// Déchiffre les champs sensibles d'un enregistrement élève après lecture depuis le serveur.
export async function decryptEleveFields(record) {
  const km = getKeyMaterial();
  if (!km) throw new Error('Crypto verrouillé');
  const out = { ...record };
  for (const f of ENCRYPTED_FIELDS) {
    if (isEncrypted(out[f])) {
      const rest = out[f].slice(ENC_PREFIX.length);
      const [ciphertext, iv] = rest.split(':');
      out[f] = await decrypt(km.aesKey, ciphertext, iv);
    }
  }
  return out;
}

// Déchiffre une liste d'enregistrements (pour list/filter).
export async function decryptEleveList(records) {
  return Promise.all(records.map(decryptEleveFields));
}

// Calcule l'empreinte pour un élève (comparaison de doublons).
export async function computeEleveFingerprint(nom, prenom, dateNaissance) {
  const km = getKeyMaterial();
  if (!km) throw new Error('Crypto verrouillé');
  return fingerprint(km.hmacKey, nom, prenom, dateNaissance || '');
}

export { ENCRYPTED_FIELDS, ENC_PREFIX, isEncrypted };