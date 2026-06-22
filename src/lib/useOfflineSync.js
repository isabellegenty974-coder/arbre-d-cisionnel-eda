import { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [pendingChanges, setPendingChanges] = useState([]);

  // Initialiser le service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('Service Worker registration failed:', err);
      });
    }
  }, []);

  // Écouter les changements de connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncMessage(null);
      // Déclencher la synchronisation automatique
      syncOfflineChanges();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sauvegarder un changement hors ligne
  const saveOfflineChange = useCallback((change) => {
    if (!isOnline) {
      const changes = JSON.parse(localStorage.getItem('offlineChanges') || '[]');
      changes.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...change
      });
      localStorage.setItem('offlineChanges', JSON.stringify(changes));
      setPendingChanges(changes);
      setSyncMessage(`Enregistré localement`);
    }
  }, [isOnline]);

  // Synchroniser les changements hors ligne
  const syncOfflineChanges = useCallback(async () => {
    const changes = JSON.parse(localStorage.getItem('offlineChanges') || '[]');
    if (changes.length === 0) return;

    setIsSyncing(true);
    try {
      let successCount = 0;
      const conflicts = [];

      for (const change of changes) {
        try {
          if (change.type === 'update') {
            // Vérifier s'il y a un conflit
            const currentData = await base44.entities[change.entity].get(change.id);
            if (currentData.updated_date && new Date(currentData.updated_date) > new Date(change.timestamp)) {
              conflicts.push({
                id: change.id,
                local: change.data,
                remote: currentData,
                entity: change.entity
              });
            } else {
              await base44.entities[change.entity].update(change.id, change.data);
              successCount++;
            }
          } else if (change.type === 'create') {
            await base44.entities[change.entity].create(change.data);
            successCount++;
          }
        } catch (err) {
          console.error(`Erreur sync ${change.entity}:`, err);
        }
      }

      if (conflicts.length > 0) {
        // Stocker les conflits pour affichage
        localStorage.setItem('syncConflicts', JSON.stringify(conflicts));
        setSyncMessage(`⚠️ ${conflicts.length} conflit(s) détecté(s)`);
      } else {
        localStorage.setItem('offlineChanges', '[]');
        setPendingChanges([]);
        if (successCount > 0) {
          setSyncMessage(`✅ ${successCount} modification${successCount > 1 ? 's' : ''} synchronisée${successCount > 1 ? 's' : ''}`);
          setTimeout(() => setSyncMessage(null), 3000);
        }
      }
    } catch (err) {
      console.error('Erreur synchronisation:', err);
      setSyncMessage('Erreur de synchronisation');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return {
    isOnline,
    isSyncing,
    syncMessage,
    pendingChanges: pendingChanges.length,
    saveOfflineChange,
    syncOfflineChanges
  };
}