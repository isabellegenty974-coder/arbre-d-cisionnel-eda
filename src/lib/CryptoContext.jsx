import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  isInitialized, initializeCrypto, importCrypto, unlockCrypto,
  tryRestoreSession, lockCrypto, destroyCrypto,
} from './cryptoDb.js';
import { createExportBundle, openExportBundle } from './crypto.js';

const CryptoCtx = createContext(null);

// status : loading | not_initialized | locked | unlocked
export function CryptoProvider({ children }) {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      const restored = await tryRestoreSession();
      if (restored) { setStatus('unlocked'); return; }
      const init = await isInitialized();
      setStatus(init ? 'locked' : 'not_initialized');
    })().catch(() => setStatus('not_initialized'));
  }, []);

  const setup = useCallback(async (passphrase) => {
    setError(null);
    try {
      await initializeCrypto(passphrase);
      setStatus('unlocked');
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, []);

  const importKey = useCallback(async (bundle, exportPassphrase, memberPassphrase) => {
    setError(null);
    try {
      const masterKey = await openExportBundle(bundle, exportPassphrase);
      await importCrypto(masterKey, memberPassphrase);
      setStatus('unlocked');
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, []);

  const unlock = useCallback(async (passphrase) => {
    setError(null);
    try {
      await unlockCrypto(passphrase);
      setStatus('unlocked');
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, []);

  const lock = useCallback(async () => {
    await lockCrypto();
    setStatus('locked');
  }, []);

  const destroy = useCallback(async () => {
    await destroyCrypto();
    setStatus('not_initialized');
  }, []);

  return (
    <CryptoCtx.Provider
      value={{
        status,
        error,
        setup,
        importKey,
        unlock,
        lock,
        destroy,
        createExportBundle,
        isUnlocked: status === 'unlocked',
      }}
    >
      {children}
    </CryptoCtx.Provider>
  );
}

export function useCrypto() {
  const ctx = useContext(CryptoCtx);
  if (!ctx) throw new Error('useCrypto must be used within CryptoProvider');
  return ctx;
}