import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useLocation } from 'react-router-dom';

const HEARTBEAT_INTERVAL = 15000; // 15s
const OFFLINE_THRESHOLD  = 45000; // 45s sans heartbeat = hors ligne

/**
 * Hook de présence : enregistre la position de l'utilisateur et
 * retourne la liste de tous les membres en ligne + présents sur une fiche donnée.
 * 
 * @param {string|null} ficheId  - ID de la fiche courante (si applicable)
 */
export function usePresence(ficheId = null) {
  const location   = useLocation();
  const [online, setOnline]   = useState([]); // tous les membres en ligne
  const [onFiche, setOnFiche] = useState([]); // membres sur cette fiche
  const presenceIdRef = useRef(null);
  const userRef       = useRef(null);

  // Init + heartbeat
  useEffect(() => {
    let intervalId;

    const init = async () => {
      const user = await base44.auth.me().catch(() => null);
      if (!user) return;
      userRef.current = user;

      const profession = user.profession || 'Psy EN EDA'; // field set via updateMe

      // Cherche une présence existante pour cet user
      const existing = await base44.entities.Presence.filter({ user_id: user.id }).catch(() => []);
      let presenceId;

      if (existing.length > 0) {
        presenceId = existing[0].id;
        await base44.entities.Presence.update(presenceId, {
          user_name: user.full_name,
          user_profession: profession,
          fiche_id: ficheId || '',
          page: location.pathname,
          last_seen: new Date().toISOString(),
          is_online: true,
        });
      } else {
        const created = await base44.entities.Presence.create({
          user_id: user.id,
          user_name: user.full_name,
          user_profession: profession,
          fiche_id: ficheId || '',
          page: location.pathname,
          last_seen: new Date().toISOString(),
          is_online: true,
        });
        presenceId = created.id;
      }
      presenceIdRef.current = presenceId;

      // Heartbeat
      intervalId = setInterval(async () => {
        if (!presenceIdRef.current) return;
        await base44.entities.Presence.update(presenceIdRef.current, {
          last_seen: new Date().toISOString(),
          fiche_id: ficheId || '',
          page: location.pathname,
          is_online: true,
        }).catch(() => {});
      }, HEARTBEAT_INTERVAL);
    };

    init();

    // Marquer hors ligne au démontage
    return () => {
      clearInterval(intervalId);
      if (presenceIdRef.current) {
        base44.entities.Presence.update(presenceIdRef.current, {
          is_online: false,
          fiche_id: '',
        }).catch(() => {});
      }
    };
  }, [ficheId, location.pathname]);

  // Polling des présences (toutes les 15s)
  useEffect(() => {
    const fetchPresences = async () => {
      const all = await base44.entities.Presence.list('-last_seen', 50).catch(() => []);
      const now = Date.now();
      const actifs = all.filter(p => {
        const age = now - new Date(p.last_seen).getTime();
        return p.is_online && age < OFFLINE_THRESHOLD && p.user_id !== userRef.current?.id;
      });
      setOnline(actifs);
      if (ficheId) {
        setOnFiche(actifs.filter(p => p.fiche_id === ficheId));
      }
    };

    fetchPresences();
    const id = setInterval(fetchPresences, HEARTBEAT_INTERVAL);
    return () => clearInterval(id);
  }, [ficheId]);

  return { online, onFiche };
}