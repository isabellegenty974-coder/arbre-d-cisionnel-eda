import { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Loader2, AlertCircle, Lock } from 'lucide-react';
import AuthCard from '@/components/auth/AuthCard';

const PROFESSIONS = [
  { value: 'Psy EN EDA', label: "Psychologue de l'Éducation Nationale · Spécialité EDA" },
  { value: 'MaDR', label: 'Maître à Dominante Relationnelle (MaDR)' },
  { value: 'MaDP', label: 'Maître à Dominante Pédagogique (MaDP)' },
];

export default function Register() {
  const params = new URLSearchParams(window.location.search);
  const [email, setEmail] = useState(params.get('email') || '');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [profession, setProfession] = useState(params.get('role') || '');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !prenom.trim() || !nom.trim() || !profession || !password) {
      setError('Tous les champs sont requis');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setSaving(true);
    try {
      const mail = email.trim().toLowerCase();
      const fullName = `${prenom.trim()} ${nom.trim()}`;

      // 1. Création du compte avec mot de passe
      await base44.auth.register({ email: mail, password, full_name: fullName });

      // 2. Authentification puis enregistrement du rôle RASED sur le profil
      await base44.auth.loginViaEmailPassword(mail, password);
      await base44.auth.updateMe({
        full_name: fullName,
        profession,
        role: 'user',
        first_login_seen: false,
      });

      // 3. Profil MembreEquipe (équipe RASED) : met à jour l'invitation en attente
      // s'il y en a une, sinon crée le profil.
      try {
        const existing = await base44.entities.MembreEquipe.filter({ email: mail }).catch(() => []);
        if (existing.length > 0) {
          await base44.entities.MembreEquipe.update(existing[0].id, {
            prenom: prenom.trim(),
            nom: nom.trim(),
            profession,
            actif: true,
          });
        } else {
          await base44.entities.MembreEquipe.create({
            prenom: prenom.trim(),
            nom: nom.trim(),
            profession,
            email: mail,
            actif: true,
          });
        }
      } catch (e) {
        // Profil existant ou erreur non bloquante
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/dashboard?first_login=true';
      }, 1500);
    } catch (err) {
      const m = (err?.response?.data?.detail || err?.message || '').toLowerCase();
      if (m.includes('not enabled')) {
        setError("L'authentification par mot de passe n'est pas encore activée. L'administrateur doit l'activer dans le tableau de bord Base44 (Overview → App visibility → Public → Enable custom auth), puis publier.");
      } else if (m.includes('already') || m.includes('exist')) {
        setError('Un compte existe déjà avec cet email. Connectez-vous ou utilisez « Mot de passe oublié ».');
      } else {
        setError(err?.response?.data?.detail || err?.message || "Erreur lors de la création du compte.");
      }
      setSaving(false);
    }
  };

  // Pas d'email dans l'URL = pas de lien d'invitation → accès refusé
  if (!email) {
    return (
      <AuthCard
        emoji="🔒"
        title="Accès par invitation"
        subtitle="La création de compte se fait uniquement via un lien d'invitation envoyé par votre administrateur RASED."
      >
        <Link to="/login" className="block text-center text-sm text-primary hover:underline">
          ← Retour à la connexion
        </Link>
      </AuthCard>
    );
  }

  if (success) {
    return (
      <AuthCard emoji="✅" title="Compte créé !">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-sm text-green-800">
            Bienvenue {prenom} ! Redirection vers votre tableau de bord…
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      emoji="👤"
      title="Créer votre compte"
      subtitle="Outil de suivi collaboratif de l'équipe RASED · Circonscription de La Possession · La Réunion"
      footer="Vos données sont sécurisées et conformes au RGPD"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email pré-rempli non modifiable */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Email</label>
          <div className="flex items-center gap-2">
            <Input type="email" value={email} disabled className="bg-muted/40 cursor-not-allowed" />
            <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Prénom</label>
            <Input type="text" placeholder="Ex: Isabelle" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Nom</label>
            <Input type="text" placeholder="Ex: Genty" value={nom} onChange={(e) => setNom(e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Rôle dans l'équipe</label>
          <select
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            required
            className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Sélectionner un rôle</option>
            {PROFESSIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Mot de passe</label>
          <Input type="password" placeholder="Au moins 8 caractères" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Confirmer le mot de passe</label>
          <Input type="password" placeholder="Confirmez votre mot de passe" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <Button type="submit" disabled={saving} className="w-full gap-2">
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Création…</>
          ) : (
            <><CheckCircle className="w-4 h-4" /> Créer mon compte</>
          )}
        </Button>
      </form>
    </AuthCard>
  );
}