import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5 minutes — garde la session active
const IDLE_TIMEOUT = 50 * 60 * 1000; // 50 minutes d'inactivité avant avertissement
const WARNING_DURATION = 30 * 1000; // 30 secondes d'avertissement avant déconnexion

export default function SessionManager() {
  const location = useLocation();
  const [showWarning, setShowWarning] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Enregistrer la dernière page visitée pour restauration après reconnexion
  useEffect(() => {
    const currentUrl = location.pathname + location.search;
    if (!currentUrl.startsWith('/login') && !currentUrl.startsWith('/register')) {
      localStorage.setItem('base44_last_page', currentUrl);
    }
  }, [location]);

  // Suivre l'activité utilisateur
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, updateActivity, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, updateActivity));
  }, []);

  // Heartbeat — garde la session active pendant l'utilisation
  useEffect(() => {
    const heartbeat = async () => {
      try {
        await base44.auth.me();
      } catch {
        // Session potentiellement expirée — le check d'inactivité gérera l'avertissement
      }
    };

    const interval = setInterval(heartbeat, HEARTBEAT_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Détection d'inactivité — avertit 30 secondes avant déconnexion
  useEffect(() => {
    const checkIdle = setInterval(() => {
      const idleTime = Date.now() - lastActivity;
      if (idleTime >= IDLE_TIMEOUT && !showWarning) {
        setShowWarning(true);
      }
    }, 1000);

    return () => clearInterval(checkIdle);
  }, [lastActivity, showWarning]);

  const handleStayConnected = useCallback(async () => {
    try {
      await base44.auth.me();
      setLastActivity(Date.now());
      setShowWarning(false);
    } catch {
      // Token expiré — rediriger vers la connexion en sauvegardant la page courante
      const lastPage = localStorage.getItem('base44_last_page') || '/dashboard';
      base44.auth.redirectToLogin(lastPage);
    }
  }, []);

  // Auto-déconnexion après l'avertissement
  useEffect(() => {
    if (!showWarning) return;
    const timer = setTimeout(() => {
      const lastPage = localStorage.getItem('base44_last_page') || '/dashboard';
      base44.auth.redirectToLogin(lastPage);
    }, WARNING_DURATION);
    return () => clearTimeout(timer);
  }, [showWarning]);

  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-[100] flex justify-center p-4"
        >
          <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl shadow-lg p-4 max-w-md w-full flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-900">Votre session va expirer</p>
              <p className="text-xs text-amber-700 mt-0.5">Cliquez pour rester connecté·e.</p>
            </div>
            <button
              onClick={handleStayConnected}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Rester connecté·e
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}