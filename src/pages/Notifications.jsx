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
  const [selected, setSelected] = useState(new Set());
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

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

  const handleDeleteNotif = async (id) => {
    await base44.entities.Notification.delete(id).catch(() => null);
    setNotifications(prev => prev.filter(n => n.id !== id));
    setSelected(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  const handleDeleteSelected = async () => {
    await Promise.all(
      Array.from(selected).map(id =>
        base44.entities.Notification.delete(id).catch(() => null)
      )
    );
    setNotifications(prev => prev.filter(n => !selected.has(n.id)));
    setSelected(new Set());
  };

  const handleDeleteAll = async () => {
    await Promise.all(
      notifications.map(n =>
        base44.entities.Notification.delete(n.id).catch(() => null)
      )
    );
    setNotifications([]);
    setSelected(new Set());
    setShowDeleteAllModal(false);
  };

  const handleToggleSelect = (id) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const handleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(n => n.id)));
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

        {/* Boutons d'actions */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {nonLuesCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              style={{
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
          {notifications.length > 0 && (
            <button
              onClick={() => setShowDeleteAllModal(true)}
              style={{
                padding: '8px 14px',
                borderRadius: 6,
                border: '1px solid #FEE4E2',
                background: 'transparent',
                color: '#B85C1A',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all .15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#FEF0E4'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              🗑️ Tout supprimer
            </button>
          )}
          {selected.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              style={{
                padding: '8px 14px',
                borderRadius: 6,
                border: '1px solid #FEE4E2',
                background: '#FEF0E4',
                color: '#B85C1A',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all .15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#FED7CE'}
              onMouseLeave={e => e.currentTarget.style.background = '#FEF0E4'}
            >
              🗑️ Supprimer la sélection ({selected.size})
            </button>
          )}
        </div>

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
            {selected.size > 0 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={handleSelectAll}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <span style={{ fontSize: 12, color: '#566880', fontWeight: 500 }}>
                  {selected.size === filtered.length ? 'Désélectionner tout' : `Tout sélectionner (${filtered.length})`}
                </span>
              </div>
            )}
            {filtered.map((notif, idx) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  background: notif.lu ? '#fff' : '#F0F3F8',
                  border: `1px solid ${selected.has(notif.id) ? '#3B82C4' : notif.lu ? '#D8E1EE' : '#3B82C4'}`,
                  borderRadius: 10,
                  padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'all .15s',
                  borderLeft: `4px solid ${selected.has(notif.id) ? '#3B82C4' : notif.lu ? '#D8E1EE' : '#3B82C4'}`,
                  backgroundColor: selected.has(notif.id) ? '#F0F3F8' : (notif.lu ? '#fff' : '#F0F3F8')
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,196,.12)'; e.currentTarget.style.transform = 'translateX(2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selected.has(notif.id)}
                    onChange={() => handleToggleSelect(notif.id)}
                    onClick={e => e.stopPropagation()}
                    style={{ width: 18, height: 18, cursor: 'pointer', marginTop: 2, flexShrink: 0 }}
                  />

                  {/* Icône et indicateur lu */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ fontSize: 20 }}>{ICONS[notif.type] || '📢'}</div>
                    {!notif.lu && (
                      <span style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, borderRadius: '50%', background: '#3B82C4' }} />
                    )}
                  </div>

                  {/* Contenu */}
                  <div style={{ flex: 1, minWidth: 0 }} onClick={() => handleNotifClick(notif)}>
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

                  {/* Bouton suppression individuelle */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteNotif(notif.id); }}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      border: 'none',
                      background: 'transparent',
                      color: '#B85C1A',
                      fontSize: 16,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                      transition: 'all .15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FEF0E4'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal suppression de toutes les notifications */}
        {showDeleteAllModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: '24px',
                maxWidth: 400,
                textAlign: 'center',
                boxShadow: '0 10px 40px rgba(0,0,0,.2)'
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 16 }}>🗑️</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#182840', marginBottom: 8 }}>Supprimer toutes les notifications ?</h3>
              <p style={{ fontSize: 13, color: '#566880', marginBottom: 20, lineHeight: 1.5 }}>
                Cette action est irréversible. Vous ne pourrez pas récupérer ces notifications.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button
                  onClick={() => setShowDeleteAllModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: 6,
                    border: '1px solid #D8E1EE',
                    background: 'transparent',
                    color: '#182840',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all .15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F0F3F8'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteAll}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: 6,
                    border: 'none',
                    background: '#B85C1A',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all .15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#A64D0F'}
                  onMouseLeave={e => e.currentTarget.style.background = '#B85C1A'}
                >
                  Tout supprimer
                </button>
              </div>
            </motion.div>
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