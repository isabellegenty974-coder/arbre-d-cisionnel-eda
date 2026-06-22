import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { CheckCircle, Loader } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [profession, setProfession] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser) {
          setUser(currentUser);
          setNom(currentUser.full_name?.split(' ').slice(1).join(' ') || '');
          setPrenom(currentUser.full_name?.split(' ')[0] || '');
          setProfession(currentUser.profession || '');
        }
      } catch (err) {
        // L'AuthProvider dans App.jsx gère la redirection si besoin
        console.error('Erreur lors de la récupération du profil:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim() || !profession) {
      setError('Tous les champs sont requis');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await base44.auth.updateMe({
        profession,
        full_name: `${prenom.trim()} ${nom.trim()}`,
      });
      // Créer automatiquement le profil MembreEquipe
      await base44.entities.MembreEquipe.create({
        prenom: prenom.trim(),
        nom: nom.trim(),
        profession,
        email: user?.email,
      });
      window.location.href = '/';
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde');
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
            <h1 className="text-2xl font-bold text-foreground mb-2">Bienvenue sur Suivis RASED</h1>
            <p className="text-sm text-muted-foreground">
              Équipe RASED · Circonscription de La Possession
            </p>
          </div>

          {/* Email display */}
          {user ? (
            <div className="mb-6 p-3 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="text-sm font-medium text-foreground">{user.email}</p>
            </div>
          ) : (
            <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">Authentification en cours...</p>
            </div>
          )}

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
                Profession
              </label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Sélectionner une profession</option>
                <option value="MaDP">Maître à dominante pédagogique (MaDP)</option>
                <option value="MaDR">Maître à dominante relationnelle (MaDR)</option>
                <option value="Psy EN EDA">Psychologue EN EDA (Psy EN EDA)</option>
              </select>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-800">{error}</p>
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
                  Terminer l'inscription
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