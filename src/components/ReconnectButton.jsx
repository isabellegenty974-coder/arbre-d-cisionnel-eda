import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const PUBLIC_PAGES = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function ReconnectButton() {
  const { user, authChecked, isLoadingAuth } = useAuth();
  const location = useLocation();

  // Visible uniquement quand aucun utilisateur n'est authentifié et que la
  // vérification initiale est terminée. Masqué sur les pages d'auth elles-mêmes
  // (l'utilisateur y est déjà dans le flux de connexion).
  if (user || !authChecked || isLoadingAuth) return null;
  if (PUBLIC_PAGES.some((p) => location.pathname.startsWith(p))) return null;

  return (
    <button
      onClick={() => base44.auth.redirectToLogin(window.location.href)}
      style={{
        position: 'fixed',
        top: 14,
        right: 16,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '9px 16px',
        background: '#1A3353',
        color: '#fff',
        border: 'none',
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 2px 12px rgba(26,51,83,.25)',
      }}
    >
      <LogIn size={15} /> Se connecter
    </button>
  );
}