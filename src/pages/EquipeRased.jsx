import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import ScreenLayout from '@/components/tree/ScreenLayout';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import { Button } from '@/components/ui/button';
import { UserCircle, Pencil, UserPlus, CheckCircle, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

const PROFESSION_LABELS = {
  'MaDP': 'Maître à dominante pédagogique (MaDP)',
  'MaDR': 'Maître à dominante relationnelle (MaDR)',
  'Psy EN EDA': 'Psychologue EN EDA',
};

export default function EquipeRased() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [profession, setProfession] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadMembers = async () => {
    try {
      const list = await base44.entities.MembreEquipe.list();
      setMembers(list);
    } catch (err) {
      console.error('Erreur chargement membres:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const openCreateForm = () => {
    setEditingMember(null);
    setPrenom('');
    setNom('');
    setProfession('');
    setShowForm(true);
  };

  const openEditForm = (member) => {
    setEditingMember(member);
    setPrenom(member.prenom || '');
    setNom(member.nom || '');
    setProfession(member.profession || '');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!prenom.trim() || !nom.trim() || !profession) return;
    setSaving(true);
    try {
      if (editingMember) {
        await base44.entities.MembreEquipe.update(editingMember.id, { prenom: prenom.trim(), nom: nom.trim(), profession });
      } else {
        await base44.entities.MembreEquipe.create({ prenom: prenom.trim(), nom: nom.trim(), profession });
      }
      await loadMembers();
      setShowForm(false);
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await base44.entities.MembreEquipe.delete(id);
      setMembers(members.filter(m => m.id !== id));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Erreur suppression:', err);
    } finally {
      setDeletingId(null);
    }
  };

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
              {members.map((member, i) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-2xl border-2 bg-white shadow-sm border-[#E8DCC8]"
                >
                  <div className="w-12 h-12 rounded-full bg-[#E8DCC8] flex items-center justify-center shrink-0">
                    <UserCircle className="w-7 h-7 text-[#0F172A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0F172A]">{member.prenom} {member.nom}</p>
                    <p className="text-sm text-[#0F172A]/70 mt-0.5">
                      {PROFESSION_LABELS[member.profession] || member.profession}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditForm(member)}
                      className="gap-1 border-[#D4A574] text-[#0F172A] hover:bg-[#F5F0E8]"
                    >
                      <Pencil className="w-3 h-3" />
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(member.id)}
                      className="gap-1 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}

              {members.length === 0 && (
                <div className="text-center py-8 text-[#0F172A]/60">
                  <p>Aucun membre dans l'équipe</p>
                </div>
              )}

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="pt-2">
                <Button
                  onClick={openCreateForm}
                  variant="outline"
                  className="w-full gap-2 border-[#D4A574] text-[#0F172A] hover:bg-[#F5F0E8]"
                >
                  <Pencil className="w-4 h-4" />
                  Créer mon profil
                </Button>
              </motion.div>

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
                          <p className="text-red-500 text-sm">Erreur lors de l'invitation. Vérifiez l'adresse email.</p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            onClick={handleInvite}
                            disabled={inviteStatus === 'loading' || !inviteEmail.trim()}
                            className="flex-1 bg-[#D4A574] hover:bg-[#C49464] text-[#0F172A] border-0 font-semibold"
                          >
                            {inviteStatus === 'loading' ? 'Envoi...' : "Envoyer l'invitation"}
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

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg"
          >
            <h2 className="text-xl font-semibold text-[#0F172A] mb-4">
              {editingMember ? 'Modifier le profil' : 'Créer un profil'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Prénom</label>
                <Input
                  type="text"
                  placeholder="Ex: Jean"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="border-[#D4A574]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Nom</label>
                <Input
                  type="text"
                  placeholder="Ex: Dupont"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="border-[#D4A574]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Profession</label>
                <select
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D4A574]/50 bg-white text-[#0F172A] text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A574]"
                >
                  <option value="">Sélectionner une profession</option>
                  <option value="MaDP">Maître à dominante pédagogique (MaDP)</option>
                  <option value="MaDR">Maître à dominante relationnelle (MaDR)</option>
                  <option value="Psy EN EDA">Psychologue EN EDA</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                onClick={handleSave}
                disabled={saving || !prenom.trim() || !nom.trim() || !profession}
                className="flex-1 bg-[#D4A574] hover:bg-[#C49464] text-[#0F172A] border-0 font-semibold"
              >
                {saving ? 'Sauvegarde...' : 'Valider'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Annuler
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg"
          >
            <h2 className="text-xl font-semibold text-[#0F172A] mb-2">Supprimer ce profil ?</h2>
            <p className="text-[#0F172A]/70 mb-6">Cette action ne peut pas être annulée. Êtes-vous sûr ?</p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={deletingId === showDeleteConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0 font-semibold"
              >
                {deletingId === showDeleteConfirm ? 'Suppression...' : 'Supprimer'}
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)} className="flex-1">
                Annuler
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}