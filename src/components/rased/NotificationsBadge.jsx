import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Bell, X, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_CONFIG = {
  dossier_partage: { emoji: '📁', color: '#2563eb', bg: '#dbeafe' },
  fiche_mise_a_jour: { emoji: '✏️', color: '#16a34a', bg: '#dcfce7' },
  eleve_sans_maj: { emoji: '⏰', color: '#d97706', bg: '#fef3c7' },
  diagnostic_termine: { emoji: '✅', color: '#7c3aed', bg: '#ede9fe' },
};

export default function NotificationsBadge() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      const user = await base44.auth.me().catch(() => null);
      setCurrentUser(user);
      if (!user) return;
      const all = await base44.entities.Notification.list('-created_date', 50).catch(() => []);
      // Filter for current user or broadcast
      const mine = all.filter(n => !n.destinataire_email || n.destinataire_email === user.email);
      setNotifs(mine);
    };
    load();
    const unsub = base44.entities.Notification.subscribe(() => load());
    return unsub;
  }, []);

  const unread = notifs.filter(n => !n.lu);

  const markAllRead = async () => {
    for (const n of unread) {
      await base44.entities.Notification.update(n.id, { lu: true }).catch(() => {});
    }
    setNotifs(prev => prev.map(n => ({ ...n, lu: true })));
  };

  const markRead = async (id) => {
    await base44.entities.Notification.update(id, { lu: true }).catch(() => {});
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
  };

  const handleNotificationClick = async (notification) => {
    await markRead(notification.id);
    setOpen(false);

    // Navigation basée sur le type de notification
    if (notification.fiche_id) {
      navigate(`/detail-fiche?id=${notification.fiche_id}`);
    } else if (notification.type === 'diagnostic_termine') {
      navigate('/hypotheses-eleve');
    } else if (notification.type === 'dossier_partage') {
      navigate('/liste-eleves');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
      >
        <Bell className="w-5 h-5" />
        {unread.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gray-700" />
                  <span className="font-bold text-sm text-[#0F172A]">Notifications</span>
                  {unread.length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">{unread.length}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unread.length > 0 && (
                    <button onClick={markAllRead} className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                      <CheckCheck className="w-3 h-3" /> Tout lire
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="ml-2 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifs.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Aucune notification</p>
                  </div>
                ) : (
                  notifs.map(n => {
                    const conf = TYPE_CONFIG[n.type] || TYPE_CONFIG.fiche_mise_a_jour;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!n.lu ? 'bg-blue-50/40' : ''}`}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 mt-0.5" style={{ background: conf.bg }}>
                          {conf.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold text-[#0F172A] leading-snug ${!n.lu ? 'font-bold' : ''}`}>{n.titre}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(n.created_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!n.lu && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}