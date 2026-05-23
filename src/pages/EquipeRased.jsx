import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ScreenLayout from '@/components/tree/ScreenLayout';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import { Button } from '@/components/ui/button';
import { UserCircle, Pencil, UserPlus, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

const PROFESSION_LABELS = {
  'MaDP': 'Maître à dominante pédagogique (MaDP)',
  'MaDR': 'Maître à dominante relationnelle (MaDR)',
  'Psy EN EDA': 'Psychologue EN EDA',
};

export default function EquipeRased() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [showInviteForm, setShowInviteForm] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [me, users] = await Promise.all([
          base44.auth.me(),
          base44.entities.User.list(),
        ]);
        setCurrentUser(me);
        setMembers(users);
      } catch (err) {
        const me = await base44.auth.me().catch(() => null);
        setCurrentUser(me);
        if (me) setMembers([me]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviteStatus('loading');
    try {
      await base44.users.inviteUser(inviteEmail.trim(), 'user');
      setInviteStatus('success');
      setInviteEmail('');
      setTimeout(() => { setInviteStatus(null); setShowInviteForm(false); }, 3000);
    } catch (err) {
      setInviteStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-16">
      <HamburgerMenu />
      <ScreenLayout title="👥 Équipe RASED" subtitle="Membres de l'équipe et leurs professions">
        <div className="space-y-4 max-w-lg mx-auto">
          {loading ? (
            <div className="text-center py-10 text-[#0F172A]/50">Chargement...</div>
          ) : (
            <>
              {members.map((member, i) => {
                const isMe = member.email === currentUser?.email;
                return (
                  <motion.div
                    key={member.id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 bg-white shadow-sm ${isMe ? 'border-[#D4A574]' : 'border-[#E8DCC8]'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#E8DCC8] flex items-center justify-center shrink-0">
                      <UserCircle className="w-7 h-7 text-[#0F172A]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0F172A]">{member.full_name || 'Nom non renseigné'}</p>
                      <p className="text-sm text-[#0F172A]/70 mt-0.5">
                        {PROFESSION_LABELS[member.profession] || member.profession || 'Profession non renseignée'}
                      </p>
                      {isMe && <span className="text-[10px] font-bold text-[#D4A574] uppercase tracking-wide">Moi</span>}
                    </div>
                    {isMe && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate('/register')}
                        className="gap-1 border-[#D4A574] text-[#0F172A] hover:bg-[#F5F0E8] shrink-0"
                      >
                        <Pencil className="w-3 h-3" />
                        Modifier
                      </Button>
                    )}
                  </motion.div>
                );
              })}

              {members.length === 0 && (
                <div className="text-center py-8 text-[#0F172A]/60">
                  <p>Aucun membre trouvé</p>
                </div>
              )}

              {/* Invite section */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pt-2">
                {!showInviteForm ? (
                  <Button
                    onClick={() => setShowInviteForm(true)}
                    className="w-full gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white border-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    Inviter un membre
                  </Button>
                ) : (
                  <div className="bg-white rounded-2xl border-2 border-[#D4A574] p-5 space-y-4 shadow-sm">
                    <p className="font-semibold text-[#0F172A]">Inviter un nouveau membre</p>
                    {inviteStatus === 'success' ? (
                      <div className="flex items-center gap-2 text-emerald-600 font-medium">
                        <CheckCircle className="w-5 h-5" />
                        Invitation envoyée avec succès !
                      </div>
                    ) : (
                      <>
                        <Input
                          type="email"
                          placeholder="adresse@email.fr"
                          value={inviteEmail}
                          onChange={e => setInviteEmail(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleInvite()}
                          className="border-[#D4A574]/50 focus:ring-[#D4A574]/40"
                        />
                        {inviteStatus === 'error' && (
                          <p className="text-red-500 text-sm">Erreur lors de l&apos;invitation. Vérifiez l&apos;adresse email.</p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            onClick={handleInvite}
                            disabled={inviteStatus === 'loading' || !inviteEmail.trim()}
                            className="flex-1 bg-[#D4A574] hover:bg-[#C49464] text-[#0F172A] border-0 font-semibold"
                          >
                            {inviteStatus === 'loading' ? 'Envoi...' : 'Envoyer l\'invitation'}
                          </Button>
                          <Button variant="outline" onClick={() => { setShowInviteForm(false); setInviteStatus(null); setInviteEmail(''); }}>
                            Annuler
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>
      </ScreenLayout>
    </div>
  );
}