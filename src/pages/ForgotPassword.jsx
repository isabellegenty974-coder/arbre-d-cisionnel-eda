import { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import AuthCard from '@/components/auth/AuthCard';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await base44.auth.resetPasswordRequest(email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      const m = (err?.response?.data?.detail || err?.message || '').toLowerCase();
      if (m.includes('not enabled')) {
        setError("L'authentification par mot de passe n'est pas encore activée sur cette application.");
      } else {
        setError(err?.response?.data?.detail || err?.message || 'Erreur lors de la demande.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthCard emoji="📬" title="Email envoyé" subtitle={`Si un compte existe pour ${email}, un email de réinitialisation a été envoyé.`}>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">
            Vérifiez votre boîte de réception (et vos spams). Le lien de réinitialisation est valable une seule fois.
          </p>
        </div>
        <Link to="/login" className="block text-center text-sm text-primary hover:underline mt-4">
          ← Retour à la connexion
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard emoji="🔑" title="Mot de passe oublié" subtitle="Saisissez votre email pour recevoir un lien de réinitialisation.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Adresse email</label>
          <Input type="email" placeholder="nom@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full gap-2">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Envoi…</>
          ) : (
            <><Mail className="w-4 h-4" /> Envoyer le lien</>
          )}
        </Button>
      </form>

      <Link to="/login" className="block text-center text-sm text-primary hover:underline mt-4">
        ← Retour à la connexion
      </Link>
    </AuthCard>
  );
}