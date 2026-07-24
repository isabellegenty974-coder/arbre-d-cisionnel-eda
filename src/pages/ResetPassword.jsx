import { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import AuthCard from '@/components/auth/AuthCard';

export default function ResetPassword() {
  const params = new URLSearchParams(window.location.search);
  const resetToken = params.get('token') || params.get('reset_token') || params.get('resetToken') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (newPassword !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken, newPassword });
      setDone(true);
    } catch (err) {
      const m = (err?.response?.data?.detail || err?.message || '').toLowerCase();
      setError(m.includes('not enabled')
        ? "L'authentification par mot de passe n'est pas encore activée."
        : (err?.response?.data?.detail || err?.message || 'Lien invalide ou expiré.'));
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <AuthCard emoji="⚠️" title="Lien invalide" subtitle="Ce lien de réinitialisation est incomplet ou expiré.">
        <Link to="/forgot-password" className="block text-center text-sm text-primary hover:underline">
          Demander un nouveau lien
        </Link>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard emoji="✅" title="Mot de passe réinitialisé" subtitle="Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.">
        <Link to="/login" className="block text-center">
          <Button className="w-full gap-2"><CheckCircle className="w-4 h-4" /> Se connecter</Button>
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard emoji="🔐" title="Nouveau mot de passe" subtitle="Choisissez un nouveau mot de passe pour votre compte.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Nouveau mot de passe</label>
          <Input type="password" placeholder="Au moins 8 caractères" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required autoFocus />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Confirmer le mot de passe</label>
          <Input type="password" placeholder="Confirmez le mot de passe" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</> : 'Réinitialiser le mot de passe'}
        </Button>
      </form>
    </AuthCard>
  );
}