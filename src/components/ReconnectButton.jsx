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
    // Bandeau pleine largeur, empilé juste au-dessus de la BottomBar (h-16 =
    // 4rem) plutôt qu'en superposition d'un contenu existant (ex: l'année
    // scolaire affichée en haut de l'écran). Le safe-area-inset-bottom est
    // ajouté à l'offset — même si BottomBar ne le respecte pas elle-même
    // aujourd'hui — pour que ce bandeau ne se retrouve jamais collé sous la
    // zone de geste (encoche/barre d'accueil) sur mobile.
    <button
      onClick={() => base44.auth.redirectToLogin(window.location.href)}
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        width: '100%',
        padding: '10px 16px',
        background: '#1A3353',
        color: '#fff',
        border: 'none',
        borderTop: '1px solid rgba(255,255,255,.1)',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      <LogIn size={15} /> Se connecter
    </button>
  );
}