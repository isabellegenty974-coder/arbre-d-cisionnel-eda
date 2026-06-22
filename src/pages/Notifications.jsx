import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import ScreenLayout from '@/components/tree/ScreenLayout';
import { motion } from 'framer-motion';

const ICONS = {
  note_ajoutee: '💬',
  hypotheses_formulees: '🔍',
  eleve_assigne: '👤',
  sans_maj: '⏰',
  nouveau_membre: '👋'
};

const LABELS = {
  note_ajoutee: 'Note ajoutée',
  hypotheses_formulees: 'Hypothèses formulées',
  eleve_assigne: 'Élève assigné',
  sans_maj: 'Sans mise à jour',
  nouveau_membre: 'Nouveau membre'
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('toutes');
  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    async function load() {
      const notifs = await base44.entities.Notification.list('-created_date', 100).catch(() => []);
      setNotifications(notifs);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = notifications.filter(n => {
    if (filter === 'non-lues') return !n.lu;
    if (selectedType && selectedType !== 'toutes') return n.type === selectedType;
    return true;
  });

  const types = [...new Set(notifications.map(n => n.type))];
  const nonLuesCount = notifications.filter(n => !n.lu).length;

  const handleMarkAsRead = async (id) => {
    await base44.entities.Notification.update(id, { lu: true }).catch(() => null);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
  };

  const handleMarkAllAsRead = async () => {
    await Promise.all(
      notifications.filter(n => !n.lu).map(n =>
        base44.entities.Notification.update(n.id, { lu: true }).catch(() => null)
      )
    );
    setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
  };

  const handleNotifClick = (notif) => {
    handleMarkAsRead(notif.id);
    if (notif.fiche_id) {
      navigate(`/detail-fiche?id=${notif.fiche_id}`);
    }
  };

  return (
    <ScreenLayout title="Notifications" subtitle="Suivi des actions de l'équipe">
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Filtres */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            onClick={() => { setFilter('toutes'); setSelectedType(null); }}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: filter === 'toutes' ? '#3B82C4' : '#F0F3F8',
              color: filter === 'toutes' ? '#fff' : '#182840',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all .15s'
            }}
            onMouseEnter={e => { if (filter !== 'toutes') e.currentTarget.style.background = '#E1E9F2'; }}
            onMouseLeave={e => { if (filter !== 'toutes') e.currentTarget.style.background = '#F0F3F8'; }}
          >
            Toutes ({notifications.length})
          </button>
          <button
            onClick={() => { setFilter('non-lues'); setSelectedType(null); }}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: filter === 'non-lues' ? '#3B82C4' : '#F0F3F8',
              color: filter === 'non-lues' ? '#fff' : '#182840',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all .15s'
            }}
            onMouseEnter={e => { if (filter !== 'non-lues') e.currentTarget.style.background = '#E1E9F2'; }}
            onMouseLeave={e => { if (filter !== 'non-lues') e.currentTarget.style.background = '#F0F3F8'; }}
          >
            Non lues ({nonLuesCount})
          </button>
          {types.map(type => (
            <button
              key={type}
              onClick={() => { setFilter('toutes'); setSelectedType(type); }}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: 'none',
                background: selectedType === type ? '#3B82C4' : '#F0F3F8',
                color: selectedType === type ? '#fff' : '#182840',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all .15s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => { if (selectedType !== type) e.currentTarget.style.background = '#E1E9F2'; }}
              onMouseLeave={e => { if (selectedType !== type) e.currentTarget.style.background = '#F0F3F8'; }}
            >
              {ICONS[type]} {LABELS[type]}
            </button>
          ))}
        </div>

        {/* Bouton Tout marquer comme lu */}
        {nonLuesCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            style={{
              marginBottom: 16,
              padding: '8px 14px',
              borderRadius: 6,
              border: '1px solid #D8E1EE',
              background: 'transparent',
              color: '#3B82C4',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all .15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#EAF2FB'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            ✓ Tout marquer comme lu
          </button>
        )}

        {/* Liste des notifications */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ width: 32, height: 32, margin: '0 auto 12px', border: '3px solid #D8E1EE', borderTop: '3px solid #3B82C4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: '#566880', fontSize: 13 }}>Chargement...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
            <p style={{ color: '#566880', fontSize: 14 }}>
              {notifications.length === 0 ? 'Aucune notification pour le moment' : 'Aucune notification avec ces filtres'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((notif, idx) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleNotifClick(notif)}
                style={{
                  background: notif.lu ? '#fff' : '#F0F3F8',
                  border: `1px solid ${notif.lu ? '#D8E1EE' : '#3B82C4'}`,
                  borderRadius: 10,
                  padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'all .15s',
                  borderLeft: `4px solid ${notif.lu ? '#D8E1EE' : '#3B82C4'}`
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,196,.12)'; e.currentTarget.style.transform = 'translateX(2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  {/* Icône et indicateur lu */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ fontSize: 20 }}>{ICONS[notif.type] || '📢'}</div>
                    {!notif.lu && (
                      <span style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, borderRadius: '50%', background: '#3B82C4' }} />
                    )}
                  </div>

                  {/* Contenu */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 4,
                      flexWrap: 'wrap'
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#3B82C4', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                        {LABELS[notif.type] || notif.type}
                      </span>
                      {notif.expediteur_nom && (
                        <span style={{ fontSize: 11, color: '#566880' }}>• {notif.expediteur_nom}</span>
                      )}
                    </div>

                    <p style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#182840',
                      margin: '4px 0',
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {notif.titre}
                    </p>

                    {notif.message && (
                      <p style={{
                        fontSize: 12,
                        color: '#566880',
                        margin: '4px 0 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {notif.message}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 11, color: '#94A3B8' }}>
                      <span>
                        {new Date(notif.created_date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {notif.eleve_nom && (
                        <span>• {notif.eleve_nom}</span>
                      )}
                    </div>
                  </div>

                  {/* Indicateur non lu */}
                  {!notif.lu && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82C4', flexShrink: 0, marginTop: 6 }} />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </ScreenLayout>
  );
}