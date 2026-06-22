import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ScreenLayout from '@/components/tree/ScreenLayout';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Send, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const PROFESSIONS = [
  { value: 'Psy EN EDA', label: 'Psychologue de l\'Éducation Nationale · Spécialité EDA' },
  { value: 'MaDR', label: 'Maître à Dominante Relationnelle (MaDR)' },
  { value: 'MaDP', label: 'Maître à Dominante Pédagogique (MaDP)' },
];

export default function InviteUsers() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [profession, setProfession] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [invitedList, setInvitedList] = useState([]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim() || !profession) return;

    setLoading(true);
    setResult(null);
    try {
      const user = await base44.auth.me();
      const userName = user?.full_name || 'Un administrateur';
      
      // Créer l'utilisateur
      await base44.functions.invoke('inviteUsers', { 
        email: email.trim(), 
        role: 'user',
        profession: profession
      });
      
      // Envoyer l'email d'invitation
      const registrationUrl = `${window.location.origin}/register`;
      const emailBody = `Bonjour,

Vous avez été invité(e) à rejoindre l'application Suivis RASED de la Circonscription de La Possession par ${userName}.

Cliquez sur le lien ci-dessous pour créer votre compte :
${registrationUrl}

Ce lien est valable 7 jours.

RASED · Circonscription de La Possession
La Réunion`;

      await base44.integrations.Core.SendEmail({
        to: email.trim(),
        subject: 'Invitation à rejoindre Suivis RASED · La Possession',
        body: emailBody,
        from_name: 'Suivis RASED'
      });

      setInvitedList([...invitedList, { email: email.trim(), profession }]);
      setResult({ success: true, message: `${email} a été invité(e) — L'email a été envoyé` });
      setEmail('');
      setProfession('');
    } catch (err) {
      setResult({ success: false, message: err.message || 'Erreur lors de l\'invitation' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <HamburgerMenu />
      <ScreenLayout title="👥 Inviter des membres RASED" subtitle="Invitez des collègues de l'équipe RASED · La Possession">
        <form onSubmit={handleInvite} className="space-y-5 max-w-lg">
          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Adresse email
              </label>
              <Input
                type="email"
                placeholder="nom@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Rôle dans l'équipe RASED
              </label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Sélectionner un rôle</option>
                {PROFESSIONS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <Button type="submit" disabled={loading || !email.trim() || !profession} className="w-full gap-2">
              <Send className="w-4 h-4" />
              {loading ? 'Envoi...' : 'Envoyer l\'invitation'}
            </Button>
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
             className="space-y-3"
           >
             <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
               <p className="text-sm font-semibold text-blue-900 mb-3">
                 ✓ {invitedList.length} collègue{invitedList.length > 1 ? 's' : ''} invité{invitedList.length > 1 ? 's' : ''}
               </p>
               <div className="space-y-2">
                 {invitedList.map((item, i) => {
                   const prof = PROFESSIONS.find(p => p.value === item.profession);
                   return (
                     <div key={i} className="text-xs text-blue-800 flex items-center gap-2">
                       <Check className="w-3 h-3" />
                       <span>{item.email}</span>
                       <span className="ml-auto text-blue-600 font-semibold">{prof?.label}</span>
                     </div>
                   );
                 })}
               </div>
             </div>

             <div className="bg-amber-50 rounded-2xl border border-amber-200 p-3">
               <p className="text-xs text-amber-800">
                 <span className="font-semibold">💡 Conseil :</span> Si le destinataire ne reçoit pas l'email, vérifiez vos spams ou dossier de courrier indésirable. L'email vient de l'adresse d'envoi automatique de Suivis RASED.
               </p>
             </div>
           </motion.div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/equipe-rased')}
            className="w-full max-w-lg"
          >
            Retour à l'équipe RASED
          </Button>
        </form>
      </ScreenLayout>
    </div>
  );
}