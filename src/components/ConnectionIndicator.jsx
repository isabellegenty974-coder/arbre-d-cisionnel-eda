import { useOfflineSync } from '@/lib/useOfflineSync';
import { motion } from 'framer-motion';

export default function ConnectionIndicator() {
  const { isOnline, isSyncing, syncMessage } = useOfflineSync();

  // Afficher uniquement le bandeau hors ligne / synchronisation
  if (isOnline && !isSyncing) return null;

  const getStatusColor = () => {
    if (isSyncing) return '#3B82C4';
    return '#D97706';
  };

  const getStatusText = () => {
    if (isSyncing) return 'Synchronisation...';
    return 'Hors ligne · modifications enregistrées localement';
  };

  const getStatusIcon = () => {
    if (isSyncing) return '🔄';
    return '🟠';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: getStatusColor(),
        color: '#fff',
        padding: '10px 16px',
        fontSize: 13,
        fontWeight: 500,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
      }}
    >
      <span style={{ fontSize: 16 }}>{getStatusIcon()}</span>
      <span>{getStatusText()}</span>
      {syncMessage && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600 }}
        >
          {syncMessage}
        </motion.span>
      )}
    </motion.div>
  );
}