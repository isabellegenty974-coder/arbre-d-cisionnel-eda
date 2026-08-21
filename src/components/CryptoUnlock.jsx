import { useState } from 'react';
import { useCrypto } from '@/lib/CryptoContext';
import { Lock, Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function CryptoUnlock() {
  const { status, setup, unlock, error } = useCrypto();
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [localErr, setLocalErr] = useState(null);
  const [busy, setBusy] = useState(false);

  const isSetup = status === 'not_initialized';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalErr(null);
    if (pass.length < 8) {
      setLocalErr('La phrase de passe doit faire au moins 8 caractères.');
      return;
    }
    if (isSetup && pass !== confirm) {
      setLocalErr('Les phrases de passe ne correspondent pas.');
      return;
    }
    setBusy(true);
    try {
      if (isSetup) await setup(pass);
      else await unlock(pass);
    } catch (err) {
      setLocalErr(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-display font-semibold text-foreground text-center">
            {isSetup ? 'Configuration du chiffrement' : 'Déverrouillage des données'}
          </h1>
          <p className="text-sm text-muted-foreground text-center mt-1 px-4">
            {isSetup
              ? 'Choisissez une phrase de passe pour chiffrer les noms et dates de naissance des élèves. Elle ne sera jamais stockée ni envoyée au serveur.'
              : 'Saisissez votre phrase de passe pour déverrouiller les données chiffrées.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-soft">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Phrase de passe</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-transparent px-3 pr-10 text-sm"
                placeholder="••••••••"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isSetup && (
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Confirmer la phrase de passe
              </label>
              <input
                type={show ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm"
                placeholder="••••••••"
              />
            </div>
          )}

          {(localErr || error) && (
            <p className="text-sm text-destructive">{localErr || error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            {busy ? 'Traitement…' : isSetup ? 'Activer le chiffrement' : 'Déverrouiller'}
          </button>
        </form>

        {isSetup && (
          <div className="flex items-start gap-2 mt-4 px-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Si vous perdez cette phrase de passe, les données élèves chiffrées seront irrécupérables.
              Notez-la en lieu sûr.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}