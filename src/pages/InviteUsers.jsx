import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ScreenLayout from '@/components/tree/ScreenLayout';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Send, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InviteUsers() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [invitedList, setInvitedList] = useState([]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const response = await base44.functions.invoke('inviteUsers', { email: email.trim(), role: 'user' });
      setInvitedList([...invitedList, email.trim()]);
      setResult({ success: true, message: `${email} a été invité(e)` });
      setEmail('');
    } catch (err) {
      setResult({ success: false, message: err.message || 'Erreur lors de l\'invitation' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <HamburgerMenu />
      <ScreenLayout title="👥 Inviter des utilisateurs" subtitle="Invitez des collègues comme utilisateurs normaux">
        <form onSubmit={handleInvite} className="space-y-5">
          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
            <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Adresse email
            </label>
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="nom@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" disabled={loading} className="gap-2">
                <Send className="w-4 h-4" />
                {loading ? 'Envoi...' : 'Inviter'}
              </Button>
            </div>
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-4 flex items-center gap-3 ${
                result.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {result.success ? (
                <>
                  <Check className="w-5 h-5 text-green-600 shrink-0" />
                  <p className="text-sm text-green-800">{result.message}</p>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <p className="text-sm text-red-800">{result.message}</p>
                </>
              )}
            </motion.div>
          )}

          {invitedList.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-blue-50 rounded-2xl border border-blue-200 p-4"
            >
              <p className="text-sm font-semibold text-blue-900 mb-3">
                ✓ {invitedList.length} utilisateur{invitedList.length > 1 ? 's' : ''} invité{invitedList.length > 1 ? 's' : ''}
              </p>
              <div className="space-y-2">
                {invitedList.map((e, i) => (
                  <div key={i} className="text-xs text-blue-800 flex items-center gap-2">
                    <Check className="w-3 h-3" />
                    {e}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="w-full"
          >
            Retour au tableau de bord
          </Button>
        </form>
      </ScreenLayout>
    </div>
  );
}