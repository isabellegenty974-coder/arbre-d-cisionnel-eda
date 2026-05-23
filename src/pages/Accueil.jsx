import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart2, Users, BookOpen, Settings } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import FirstVisitModal from '@/components/FirstVisitModal';
import { useDiagnostic } from '@/lib/DiagnosticContext';

export default function Accueil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showFirstVisitModal, setShowFirstVisitModal] = useState(false);
  const { eleve } = useDiagnostic();

  useEffect(() => {
    base44.auth.me().catch(() => {
      base44.auth.redirectToLogin('/');
    });
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        if (!currentUser.profession) {
          const hasSeenModal = localStorage.getItem('firstVisitModalSeen');
          if (!hasSeenModal) {
            setShowFirstVisitModal(true);
            localStorage.setItem('firstVisitModalSeen', 'true');
          }
        }
      } catch (err) {
        // User not authenticated
      }
    };
    load();
  }, []);

  const handleGoToTeam = () => {
    setShowFirstVisitModal(false);
    navigate('/equipe-rased');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <FirstVisitModal isOpen={showFirstVisitModal} onClose={() => setShowFirstVisitModal(false)} onGoToTeam={handleGoToTeam} />

      <HamburgerMenu />

      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Arbre Décisionnel RASED</h1>
            {user && <p className="text-sm text-gray-600">Bienvenue {user.full_name || user.email}</p>}
          </div>
          {user && <span className="text-xs px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">{user.profession || 'Non défini'}</span>}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 pb-24">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Élèves Card */}
          <Link to="/dashboard" className="group">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">Gestion des Élèves</h2>
                  <p className="text-sm text-gray-600 mt-1">Accédez à la liste de vos élèves</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Consulter les fiches élèves</p>
                <p>• Ajouter de nouveaux élèves</p>
                <p>• Gérer les observations</p>
              </div>
            </div>
          </Link>

          {/* Arbre Décisionnel Card */}
          <Link to="/evaluation-domains" className="group">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">Arbre Décisionnel</h2>
                  <p className="text-sm text-gray-600 mt-1">Parcours diagnostique structuré</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Apprentissages</p>
                <p>• Comportement</p>
                <p>• Développement et Contexte</p>
              </div>
            </div>
          </Link>

          {/* Statistiques Card */}
          <Link to="/stats-annuelles" className="group">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <BarChart2 className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">Statistiques Annuelles</h2>
                  <p className="text-sm text-gray-600 mt-1">Analyse des données</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Rapports diagnostiques</p>
                <p>• Graphiques d'activité</p>
                <p>• Exportation de données</p>
              </div>
            </div>
          </Link>

          {/* Équipe RASED Card */}
          <Link to="/equipe-rased" className="group">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                  <Settings className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">Équipe RASED</h2>
                  <p className="text-sm text-gray-600 mt-1">Gestion de l'équipe</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Profils utilisateurs</p>
                <p>• Inviter des membres</p>
                <p>• Rôles et permissions</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        {eleve && (
          <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-6 mb-8">
            <h3 className="font-semibold text-indigo-900 mb-4">Élève en cours : {eleve.prenom} {eleve.nom}</h3>
            <div className="flex gap-3 flex-wrap">
              <Link to="/resume" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                Voir le diagnostic
              </Link>
              <Link to="/fiche-eleve" className="px-4 py-2 bg-white text-indigo-600 border border-indigo-300 rounded-lg text-sm font-medium hover:bg-indigo-50">
                Ajouter observation
              </Link>
            </div>
          </div>
        )}

        {/* Info Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-3">À propos</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              Arbre Décisionnel RASED est un outil de diagnostic pour les professionnels de l'éducation, permettant d'identifier les besoins des élèves et de proposer des interventions adaptées.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-3">Ressources</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>
                <Link to="/items-professionnels" className="text-indigo-600 hover:underline">
                  → Fiches ressources
                </Link>
              </li>
              <li>
                <Link to="/politique-confidentialite" className="text-indigo-600 hover:underline">
                  → Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-gray-400 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm">
          <p>© 2024 Arbre Décisionnel RASED. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
}