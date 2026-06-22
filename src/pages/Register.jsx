import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { CheckCircle, Loader, AlertCircle } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [inviteToken, setInviteToken] = useState(null);
  const [email, setEmail] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [profession, setProfession] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [invalidToken, setInvalidToken] = useState(false);

  useEffect(() => {
    const initializeForm = async () => {
      // Extraire le token d'invitation de l'URL
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token') || params.get('invitation_token');
      
      if (token) {
        setInviteToken(token);
        // Valider le token en essayant de récupérer le profil utilisateur
        try {
          // Le token est déjà défini dans les headers par le SDK
          const currentUser = await base44.auth.me();
          if (currentUser) {
            setEmail(currentUser.email || '');
            setNom(currentUser.full_name?.split(' ').slice(1).join(' ') || '');
            setPrenom(currentUser.full_name?.split(' ')[0] || '');
            setProfession(currentUser.profession || '');
          }
        } catch (err) {
          // Token invalide ou expiré
          console.error('Token invalide:', err);
          setInvalidToken(true);
        }
      } else {
        // Pas de token, vérifier si utilisateur connecté
        try {
          const currentUser = await base44.auth.me();
          if (currentUser) {
            setEmail(currentUser.email || '');
            setNom(currentUser.full_name?.split(' ').slice(1).join(' ') || '');
            setPrenom(currentUser.full_name?.split(' ')[0] || '');
            setProfession(currentUser.profession || '');
          }
        } catch (err) {
          console.log('Utilisateur non authentifié');
        }
      }
      
      setLoading(false);
    };
    
    initializeForm();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!nom.trim() || !prenom.trim() || !profession || !password.trim()) {
      setError('Tous les champs sont requis');
      return;
    }
    
    if (password !== passwordConfirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      // Mettre à jour le profil utilisateur
      const updateData = {
        profession,
        full_name: `${prenom.trim()} ${nom.trim()}`,
        first_login_seen: false, // Force réaffichage du message de bienvenue
      };
      
      await base44.auth.updateMe(updateData);
      
      // Créer le profil MembreEquipe
      await base44.entities.MembreEquipe.create({
        prenom: prenom.trim(),
        nom: nom.trim(),
        profession,
        email: email || 'unknown@rased.re',
        actif: true,
      });
      
      // Redirection automatique vers dashboard
      // Le WelcomeModal s'affichera automatiquement car first_login_seen = false
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (invalidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl border border-border shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Lien expiré</h1>
            <p className="text-muted-foreground mb-6">
              Ce lien d'invitation n'est plus valide. Contactez votre administrateur pour recevoir une nouvelle invitation.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Retour à l'accueil
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👤</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Créer mon compte</h1>
            <p className="text-sm text-muted-foreground">
              Équipe RASED · Circonscription de La Possession
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Prénom
              </label>
              <Input
                type="text"
                placeholder="Ex: Jean"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
              />
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nom
              </label>
              <Input
                type="text"
                placeholder="Ex: Dupont"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
              />
            </div>

            {/* Profession */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Rôle dans l'équipe
              </label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Sélectionner un rôle</option>
                <option value="Psy EN EDA">Psychologue de l'Éducation Nationale · Spécialité EDA</option>
                <option value="MaDR">Maître à Dominante Relationnelle (MaDR)</option>
                <option value="MaDP">Maître à Dominante Pédagogique (MaDP)</option>
              </select>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mot de passe
              </label>
              <Input
                type="password"
                placeholder="Au moins 8 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Confirmer mot de passe */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirmer le mot de passe
              </label>
              <Input
                type="password"
                placeholder="Confirmez votre mot de passe"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={saving}
              className="w-full gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Inscription...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Créer mon compte
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Vos données sont sécurisées et conformes au RGPD
        </p>
      </motion.div>
    </div>
  );
}