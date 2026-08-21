import { useState } from 'react';
import { useCrypto } from '@/lib/CryptoContext';
import CryptoUnlock from '@/components/CryptoUnlock';
import { encrypt, decrypt, fingerprint, getKeyMaterial } from '@/lib/crypto.js';
import { encryptEleveFields, decryptEleveFields, computeEleveFingerprint } from '@/lib/encryptedFields';

export default function CryptoDemo() {
  const { status, isUnlocked, lock, destroy } = useCrypto();
  const [nom, setNom] = useState('Dupont');
  const [prenom, setPrenom] = useState('Marie');
  const [dob, setDob] = useState('2015-03-12');
  const [encrypted, setEncrypted] = useState(null);
  const [decrypted, setDecrypted] = useState(null);
  const [fp1, setFp1] = useState(null);
  const [fp2, setFp2] = useState(null);
  const [log, setLog] = useState([]);

  if (status === 'loading') {
    return <div className="p-8 text-center text-muted-foreground">Chargement…</div>;
  }
  if (!isUnlocked) return <CryptoUnlock />;

  const addLog = (msg) => setLog((l) => [...l, { id: Date.now() + Math.random(), msg }]);

  const runDemo = async () => {
    setEncrypted(null);
    setDecrypted(null);
    setFp1(null);
    setFp2(null);
    setLog([]);
    const km = getKeyMaterial();

    addLog('Clé dérivée : AES-GCM 256 + HMAC-SHA256 (PBKDF2, 250 000 itérations)');

    // Chiffrement : IV aléatoire => cipher différent à chaque fois
    const enc1 = await encrypt(km.aesKey, nom);
    const enc2 = await encrypt(km.aesKey, nom);
    addLog(`Chiffrement de "${nom}" → cipher1 = ${enc1.ciphertext.slice(0, 24)}…`);
    addLog(`Re-chiffrement du même "${nom}" → cipher2 = ${enc2.ciphertext.slice(0, 24)}… (différent !)`);
    setEncrypted({ c1: enc1, c2: enc2 });

    // Déchiffrement
    const dec1 = await decrypt(km.aesKey, enc1.ciphertext, enc1.iv);
    addLog(`Déchiffrement de cipher1 → "${dec1}" ${dec1 === nom ? '✅' : '❌'}`);
    setDecrypted(dec1);

    // Empreintes déterministes (insensibles à la casse/accents)
    const f1 = await fingerprint(km.hmacKey, nom, prenom, dob);
    const f2 = await fingerprint(km.hmacKey, 'DUPONT', 'marie', '2015-03-12');
    setFp1(f1);
    setFp2(f2);
    addLog(`Empreinte HMAC("${nom}|${prenom}|${dob}") = ${f1.slice(0, 24)}…`);
    addLog(`Empreinte HMAC("DUPONT|marie|2015-03-12") = ${f2.slice(0, 24)}…`);
    addLog(`Empreintes identiques malgré casse/accents ? ${f1 === f2 ? '✅ Oui (dédup possible)' : '❌ Non'}`);

    // Enregistrement complet : champs chiffrés + classe en clair + _fp
    const record = { id: 'demo-1', nom, prenom, date_naissance: dob, classe: 'CE1', ecole: 'École Test' };
    const encRecord = await encryptEleveFields(record);
    addLog(`Enregistrement chiffré : nom=${encRecord.nom.slice(0, 20)}… prenom=${encRecord.prenom.slice(0, 20)}…`);
    addLog(`_fp=${encRecord._fp?.slice(0, 16)}… · classe="${encRecord.classe}" (en clair)`);
    const decRecord = await decryptEleveFields(encRecord);
    addLog(`Déchiffrement → nom=${decRecord.nom} prenom=${decRecord.prenom} dob=${decRecord.date_naissance} ✅`);
  };

  const dedupDemo = async () => {
    const a = await computeEleveFingerprint('Dupont', 'Marie', '2015-03-12');
    const b = await computeEleveFingerprint('dupont', 'MARIE', '2015-03-12');
    const c = await computeEleveFingerprint('Durand', 'Marie', '2015-03-12');
    addLog('--- Test déduplication ---');
    addLog(`Élève A (Dupont, Marie, 2015-03-12) → ${a.slice(0, 16)}…`);
    addLog(`Élève B (dupont, MARIE, 2015-03-12)  → ${b.slice(0, 16)}…`);
    addLog(`Élève C (Durand, Marie, 2015-03-12)  → ${c.slice(0, 16)}…`);
    addLog(`A == B (même élève) ? ${a === b ? '✅ Oui' : '❌ Non'}`);
    addLog(`A == C (élèves différents) ? ${a === c ? '❌ Erreur !' : '✅ Non (correct)'}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-display font-semibold text-foreground">Démo chiffrement</h1>
            <p className="text-sm text-muted-foreground">AES-GCM + PBKDF2 · Web Crypto API</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={lock}
              className="px-3 py-1.5 text-xs rounded-md border border-border hover:bg-secondary"
            >
              Verrouiller
            </button>
            <button
              onClick={() => {
                if (confirm('Supprimer définitivement la configuration du chiffrement ? (les données chiffrées existantes deviendraient illisibles)')) {
                  destroy();
                }
              }}
              className="px-3 py-1.5 text-xs rounded-md border border-destructive text-destructive hover:bg-destructive/10"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 mb-4 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Données de test</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Nom</label>
              <input
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Prénom</label>
              <input
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-2 text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground">Date de naissance</label>
              <input
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-2 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={runDemo}
              className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Chiffrer / Déchiffrer
            </button>
            <button
              onClick={dedupDemo}
              className="px-4 py-2 text-sm rounded-md border border-border hover:bg-secondary"
            >
              Test déduplication
            </button>
          </div>
        </div>

        {encrypted && (
          <div className="bg-card border border-border rounded-xl p-5 mb-4 space-y-2 text-sm">
            <h2 className="text-sm font-semibold text-foreground">Résultat du chiffrement</h2>
            <p className="text-xs text-muted-foreground break-all">
              Cipher 1 : {encrypted.c1.ciphertext.slice(0, 40)}…
            </p>
            <p className="text-xs text-muted-foreground break-all">
              Cipher 2 : {encrypted.c2.ciphertext.slice(0, 40)}…
            </p>
            <p className="text-xs">
              Déchiffré : <strong>{decrypted}</strong> {decrypted === nom ? '✅' : '❌'}
            </p>
          </div>
        )}

        {fp1 && (
          <div className="bg-card border border-border rounded-xl p-5 mb-4 space-y-1 text-sm">
            <h2 className="text-sm font-semibold text-foreground mb-2">Empreintes (déduplication)</h2>
            <p className="text-xs break-all">FP normalisé : {fp1}</p>
            <p className="text-xs break-all">FP « DUPONT » : {fp2}</p>
            <p className="text-xs">Identiques : {fp1 === fp2 ? '✅' : '❌'}</p>
          </div>
        )}

        {log.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-1.5">
            <h2 className="text-sm font-semibold text-foreground mb-2">Journal</h2>
            {log.map((l) => (
              <p key={l.id} className="text-xs text-muted-foreground font-mono break-all">
                {l.msg}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}