import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ScreenLayout from '@/components/tree/ScreenLayout';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import { Button } from '@/components/ui/button';
import { UserCircle, Pencil, UserPlus, CheckCircle, Loader, Trash2 } from 'lucide-react';
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
  const [inviteStatus, setInviteStatus] = useState(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registerData, setRegisterData] = useState({ nom: '', prenom: '', profession: '' });
  const [registerSaving, setRegisterSaving] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleRegisterSubmit = async () => {
    if (!registerData.nom.trim() || !registerData.prenom.trim() || !registerData.profession) {
      setRegisterError('Tous les champs sont requis');
      return;
    }
    setRegisterSaving(true);
    setRegisterError(null);
    try {
      await base44.auth.updateMe({
        profession: registerData.profession,
        full_name: `${registerData.prenom.trim()} ${registerData.nom.trim()}`,
      });
      setRegisterSuccess(true);
      setShowRegisterForm(false);
      setTimeout(() => {
        setRegisterSuccess(false);
        setRegisterData({ nom: '', prenom: '', profession: '' });
        window.location.reload();
      }, 2000);
    } catch (err) {
      setRegisterError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setRegisterSaving(false);
    }
  };

  const handleDeleteMember = async (memberId) => {
    setDeleting(true);
    try {
      await base44.entities.User.delete(memberId);
      setMembers(members.filter(m => m.id !== memberId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    } finally {
      setDeleting(false);
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
                    <div className="flex gap-2">
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
                       <Button
                         size="sm"
                         variant="outline"
                         onClick={() => setDeleteConfirm(member.id)}
                         className="gap-1 border-red-300 text-red-600 hover:bg-red-50 shrink-0"
                       >
                         <Trash2 className="w-3 h-3" />
                         Supprimer
                       </Button>
                     </div>
                     {deleteConfirm === member.id && (
                       <motion.div
                         initial={{ opacity: 0, y: -10 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="mt-3 pt-3 border-t-2 border-red-200 space-y-2"
                       >
                         <p className="text-sm text-red-600 font-semibold">Êtes-vous sûr de vouloir supprimer ce profil ?</p>
                         <div className="flex gap-2">
                           <Button
                             size="sm"
                             onClick={() => handleDeleteMember(member.id)}
                             disabled={deleting}
                             className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0 text-xs"
                           >
                             {deleting ? 'Suppression...' : 'Confirmer la suppression'}
                           </Button>
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => setDeleteConfirm(null)}
                             className="flex-1 text-xs"
                           >
                             Annuler
                           </Button>
                         </div>
                       </motion.div>
                     )}
                  </motion.div>
                );
              })}

              {members.length === 0 && (
                <div className="text-center py-8 text-[#0F172A]/60">
                  <p>Aucun membre trouvé</p>
                </div>
              )}

              {/* Register section */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pt-2">
                {!showRegisterForm ? (
                  <Button
                    onClick={() => setShowRegisterForm(true)}
                    className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    M'enregistrer
                  </Button>
                ) : (
                  <div className="bg-white rounded-2xl border-2 border-emerald-500 p-5 space-y-4 shadow-sm">
                    <p className="font-semibold text-[#0F172A]">Complétez votre profil</p>
                    {registerSuccess ? (
                      <div className="flex items-center gap-2 text-emerald-600 font-medium">
                        <CheckCircle className="w-5 h-5" />
                        Enregistrement réussi !
                      </div>
                    ) : (
                      <>
                        <Input
                          type="text"
                          placeholder="Prénom"
                          value={registerData.prenom}
                          onChange={e => setRegisterData({ ...registerData, prenom: e.target.value })}
                          className="border-emerald-500/50 focus:ring-emerald-500/40"
                        />
                        <Input
                          type="text"
                          placeholder="Nom"
                          value={registerData.nom}
                          onChange={e => setRegisterData({ ...registerData, nom: e.target.value })}
                          className="border-emerald-500/50 focus:ring-emerald-500/40"
                        />
                        <select
                          value={registerData.profession}
                          onChange={e => setRegisterData({ ...registerData, profession: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-emerald-500/50 bg-white text-[#0F172A] text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                        >
                          <option value="">Sélectionner une profession</option>
                          <option value="MaDP">Maître à dominante pédagogique (MaDP)</option>
                          <option value="MaDR">Maître à dominante relationnelle (MaDR)</option>
                          <option value="Psy EN EDA">Psychologue EN EDA (Psy EN EDA)</option>
                        </select>
                        {registerError && <p className="text-red-500 text-sm">{registerError}</p>}
                        <div className="flex gap-2">
                          <Button
                            onClick={handleRegisterSubmit}
                            disabled={registerSaving}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-0 font-semibold"
                          >
                            {registerSaving ? (
                              <>
                                <Loader className="w-4 h-4 animate-spin" />
                                Enregistrement...
                              </>
                            ) : (
                              'S\'enregistrer'
                            )}
                          </Button>
                          <Button variant="outline" onClick={() => { setShowRegisterForm(false); setRegisterError(null); }}>
                            Annuler
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Invite section */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="pt-2">
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