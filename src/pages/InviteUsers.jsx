import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ScreenLayout from '@/components/tree/ScreenLayout';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Send, Check, AlertCircle, Copy, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PROFESSIONS = [
  { value: 'Psy EN EDA', label: "Psychologue de l'Éducation Nationale · Spécialité EDA" },
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
  const [copied, setCopied] = useState(null);

  const buildLink = (mail, prof) => {
    const base = window.location.origin;
    const p = new URLSearchParams({ email: mail });
    if (prof) p.set('role', prof);
    return `${base}/register?${p.toString()}`;
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim() || !profession) return;

    setLoading(true);
    setResult(null);
    try {
      const mail = email.trim().toLowerCase();
      const link = buildLink(mail, profession);

      // Enregistrer le profil MembreEquipe en attente (liste de l'équipe)
      try {
        await base44.entities.MembreEquipe.create({
          prenom: '(invité)',
          nom: mail,
          profession,
          email: mail,
          actif: false,
        });
      } catch (err) {
        // Peut déjà exister
      }

      setInvitedList([{ email: mail, profession, link }, ...invitedList]);
      setResult({ success: true, message: 'Lien d\'invitation généré. Transmettez-le à votre collègue.' });
      setEmail('');
      setProfession('');
    } catch (err) {
      setResult({ success: false, message: err.message || 'Erreur lors de la génération du lien' });
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async (link, idx) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(idx);
      setTimeout(() => setCopied(null), 2000);
    } catch (e) {
      window.prompt('Copiez ce lien :', link);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <HamburgerMenu />
      <ScreenLayout title="👥 Inviter des membres RASED" subtitle="Générez un lien d'inscription à transmettre à votre collègue">
        <div className="max-w-lg space-y-5">
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
            <p className="text-xs text-amber-800">
              <span className="font-semibold">⚠️ Pré requis :</span> l'authentification par mot de passe doit être activée dans le tableau de bord Base44 (Overview → App visibility → Public → Enable custom auth), puis l'app publiée. Sans cela, le lien ne fonctionnera pas.
            </p>
          </div>

          <form onSubmit={handleInvite} className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Adresse email du collègue
              </label>
              <Input type="email" placeholder="nom@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">Rôle dans l'équipe RASED</label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Sélectionner un rôle</option>
                {PROFESSIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <Button type="submit" disabled={loading || !email.trim() || !profession} className="w-full gap-2">
              <Send className="w-4 h-4" />
              {loading ? 'Génération...' : 'Générer le lien d\'invitation'}
            </Button>
          </form>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-4 flex items-center gap-3 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
            >
              {result.success ? <Check className="w-5 h-5 text-green-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
              <p className="text-sm text-green-800">{result.message}</p>
            </motion.div>
          )}

          {invitedList.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4 space-y-3">
                <p className="text-sm font-semibold text-blue-900">
                  ✓ {invitedList.length} lien{invitedList.length > 1 ? 's' : ''} d'invitation généré{invitedList.length > 1 ? 's' : ''}
                </p>
                {invitedList.map((item, i) => {
                  const prof = PROFESSIONS.find((p) => p.value === item.profession);
                  return (
                    <div key={i} className="bg-white rounded-xl border border-blue-100 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Check className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-900">{item.email}</span>
                        <span className="ml-auto text-xs text-blue-600 font-semibold">{prof?.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-[10px] text-blue-800 bg-blue-50 px-2 py-1.5 rounded truncate">{item.link}</code>
                        <Button type="button" variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={() => copyLink(item.link, i)}>
                          {copied === i ? <><Check className="w-3.5 h-3.5 text-green-600" /> Copié</> : <><Copy className="w-3.5 h-3.5" /> Copier</>}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-3">
                <p className="text-xs text-amber-800 flex items-start gap-2">
                  <Link2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span><span className="font-semibold">Transmettez ce lien</span> à votre collègue (par email ou messagerie). En l'ouvrant, il créera son compte avec son mot de passe.</span>
                </p>
              </div>
            </motion.div>
          )}

          <Button type="button" variant="outline" onClick={() => navigate('/equipe-rased')} className="w-full max-w-lg">
            Retour à l'équipe RASED
          </Button>
        </div>
      </ScreenLayout>
    </div>
  );
}