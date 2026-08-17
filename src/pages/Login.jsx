import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn, AlertCircle, Loader2 } from 'lucide-react';
import AuthCard from '@/components/auth/AuthCard';
import GoogleIcon from '@/components/GoogleIcon';

// L'authentification par mot de passe est désactivée côté Base44 — seule
// l'authentification Google ("OAuth Base44 par défaut") est active.
// Formulaire masqué plutôt que supprimé : repasser à true si l'auth par mot
// de passe est un jour réactivée dans le tableau de bord Base44.
const EMAIL_PASSWORD_AUTH_ENABLED = false;

function authDisabledMsg(err) {
  const m = (err?.response?.data?.detail || err?.message || '').toLowerCase();
  if (m.includes('not enabled')) {
    return "L'authentification par mot de passe n'est pas encore activée sur cette application. L'administrateur doit l'activer dans le tableau de bord Base44 (Overview → App visibility → Public → Enable custom auth), puis publier.";
  }
  return err?.response?.data?.detail || err?.message || 'Email ou mot de passe incorrect.';
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Email et mot de passe requis');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await base44.auth.loginViaEmailPassword(email.trim().toLowerCase(), password);
      // Le SDK a stocké le jeton en localStorage — redirection vers l'app.
      window.location.href = '/dashboard';
    } catch (err) {
      setError(authDisabledMsg(err));
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    base44.auth.loginWithProvider('google', '/dashboard');
  };

  return (
    <AuthCard
      emoji="🔐"
      title="Bienvenue sur Suivis RASED"
      subtitle="Connectez-vous pour continuer"
      footer="Accès réservé à l'équipe RASED · Circonscription de La Possession · La Réunion"
    >
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={handleGoogleLogin}
        className="w-full gap-3 font-semibold"
      >
        <GoogleIcon className="w-5 h-5" /> Se connecter avec Google
      </Button>

      {EMAIL_PASSWORD_AUTH_ENABLED && (
        <>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Adresse email</label>
              <Input
                type="email"
                placeholder="nom@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Mot de passe</label>
              <Input
                type="password"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Connexion…</>
              ) : (
                <><LogIn className="w-4 h-4" /> Se connecter</>
              )}
            </Button>
          </form>

          <div className="text-center mt-4">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
        </>
      )}
    </AuthCard>
  );
}