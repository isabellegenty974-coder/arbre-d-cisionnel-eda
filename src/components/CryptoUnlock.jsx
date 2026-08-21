import { useState } from 'react';
import { useCrypto } from '@/lib/CryptoContext';
import { Lock, Shield, Eye, EyeOff, AlertTriangle, Upload, KeyRound } from 'lucide-react';

export default function CryptoUnlock() {
  const { status, setup, importKey, unlock, error } = useCrypto();
  const [mode, setMode] = useState(null); // null | 'setup' | 'import'
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [exportPass, setExportPass] = useState('');
  const [show, setShow] = useState(false);
  const [localErr, setLocalErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const [bundle, setBundle] = useState(null);
  const [fileName, setFileName] = useState('');

  const isSetup = status === 'not_initialized';
  const activeMode = mode || (isSetup ? null : null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setBundle(JSON.parse(reader.result));
        setLocalErr(null);
      } catch {
        setLocalErr('Fichier de clé invalide (format JSON attendu)');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalErr(null);
    if (pass.length < 8) {
      setLocalErr('Votre phrase de passe doit faire au moins 8 caractères.');
      return;
    }
    if (activeMode === 'setup' && pass !== confirm) {
      setLocalErr('Les phrases de passe ne correspondent pas.');
      return;
    }
    if (activeMode === 'import') {
      if (!bundle) { setLocalErr('Sélectionnez le fichier de clé reçu.'); return; }
      if (exportPass.length < 4) { setLocalErr('Saisissez la phrase de passe d\'export.'); return; }
    }
    setBusy(true);
    try {
      if (activeMode === 'setup') await setup(pass);
      else if (activeMode === 'import') await importKey(bundle, exportPass, pass);
      else await unlock(pass);
    } catch (err) {
      setLocalErr(err.message);
    } finally {
      setBusy(false);
    }
  };

  const needsChoice = isSetup && !activeMode;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-display font-semibold text-foreground text-center">
            {activeMode === 'import'
              ? 'Importer la clé de l\'équipe'
              : activeMode === 'setup'
                ? 'Configurer le chiffrement'
                : 'Déverrouillage des données'}
          </h1>
          <p className="text-sm text-muted-foreground text-center mt-1 px-4">
            {activeMode === 'import'
              ? 'Importez la clé maîtresse reçue, puis choisissez votre propre phrase de passe.'
              : activeMode === 'setup'
                ? 'Générez la clé maîtresse de l\'équipe et choisissez votre phrase de passe.'
                : 'Saisissez votre phrase de passe pour déverrouiller les données chiffrées.'}
          </p>
        </div>

        {needsChoice && (
          <div className="space-y-3 mb-4">
            <button
              onClick={() => setMode('setup')}
              className="w-full p-4 rounded-xl border border-border bg-card hover:bg-secondary text-left flex items-start gap-3"
            >
              <KeyRound className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Configurer le chiffrement</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Générez la clé maîtresse de l'équipe. À faire une seule fois, par l'admin.
                </p>
              </div>
            </button>
            <button
              onClick={() => setMode('import')}
              className="w-full p-4 rounded-xl border border-border bg-card hover:bg-secondary text-left flex items-start gap-3"
            >
              <Upload className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Importer la clé de l'équipe</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Vous avez reçu un fichier de clé. Importez-le et choisissez votre phrase de passe.
                </p>
              </div>
            </button>
          </div>
        )}

        {activeMode === 'import' && (
          <div className="bg-card border border-border rounded-xl p-5 mb-4 space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Fichier de clé reçu
              </label>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFile}
                className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground"
              />
              {fileName && (
                <p className="text-xs text-muted-foreground mt-1">Sélectionné : {fileName}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Phrase de passe d'export
              </label>
              <input
                type={show ? 'text' : 'password'}
                value={exportPass}
                onChange={(e) => setExportPass(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm"
                placeholder="Communiquée oralement"
              />
            </div>
          </div>
        )}

        {activeMode && (
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-soft">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                {activeMode === 'unlock' ? 'Phrase de passe' : 'Votre phrase de passe'}
              </label>
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

            {activeMode === 'setup' && (
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Confirmer votre phrase de passe
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
              {busy ? 'Traitement…' : activeMode === 'setup' ? 'Générer la clé maîtresse' : activeMode === 'import' ? 'Importer' : 'Déverrouiller'}
            </button>
          </form>
        )}

        {activeMode === 'setup' && (
          <div className="flex items-start gap-2 mt-4 px-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Si vous perdez votre phrase de passe, vos données chiffrées seront irrécupérables.
              Notez-la en lieu sûr. Vous pourrez exporter la clé maîtresse après configuration pour
              la transmettre à vos collègues.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}