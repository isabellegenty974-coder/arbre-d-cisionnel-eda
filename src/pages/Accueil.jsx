import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Users, TreePine, BarChart2, UserPlus, Pencil, TrendingUp, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import FirstVisitModal from '@/components/FirstVisitModal';

export default function Accueil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showFirstVisitModal, setShowFirstVisitModal] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
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
      } catch {
        // Not authenticated
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <FirstVisitModal
        isOpen={showFirstVisitModal}
        onClose={() => setShowFirstVisitModal(false)}
        onGoToTeam={() => {
          setShowFirstVisitModal(false);
          navigate('/equipe-rased');
        }}
      />

      <HamburgerMenu />

      {/* Header */}
      <div className="px-6 py-6 bg-white border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Arbre décisionnel RASED</h1>
            <p className="text-sm text-gray-600 mt-1">Connectez-vous pour accéder à l'application</p>
          </div>
          <button
            onClick={() => base44.auth.redirectToLogin()}
            className="px-6 py-2 rounded-full border-2 border-blue-400 text-blue-600 font-medium whitespace-nowrap hover:bg-blue-50 transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Three Column Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Élèves Card */}
          <div className="bg-blue-100 rounded-2xl p-6 flex flex-col">
            <div className="flex justify-center mb-4">
              <Users className="w-12 h-12 text-blue-500" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Élèves</h2>

            {/* Recherche d'élèves */}
            <div className="bg-white rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Recherche d'élèves</h3>
              <p className="text-xs text-gray-600 mb-3">Recherche-le d'élèves, pourquoi cait ces application.</p>
              <Link to="/dashboard">
                <button className="w-full px-3 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors">
                  Recherche d'élèves
                </button>
              </Link>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Actions rapides</h3>
              <div className="space-y-2">
                <Link to="/register" className="flex items-center gap-2 px-3 py-2 text-blue-600 text-sm hover:bg-blue-50 rounded-lg transition-colors">
                  <UserPlus className="w-4 h-4" />
                  <span>Créer un profil</span>
                </Link>
                <Link to="/edit-eleve" className="flex items-center gap-2 px-3 py-2 text-blue-600 text-sm hover:bg-blue-50 rounded-lg transition-colors">
                  <Pencil className="w-4 h-4" />
                  <span>Modifier des infos</span>
                </Link>
                <Link to="/evaluation-domains" className="flex items-center gap-2 px-3 py-2 text-blue-600 text-sm hover:bg-blue-50 rounded-lg transition-colors">
                  <TrendingUp className="w-4 h-4" />
                  <span>Suivi pédagogique</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Arbre Card */}
          <div className="bg-green-100 rounded-2xl p-6 flex flex-col">
            <div className="flex justify-center mb-4">
              <TreePine className="w-12 h-12 text-green-600" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Arbre</h2>

            {/* Parcours d'aide */}
            <div className="bg-white rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Parcours d'aide</h3>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
              <p className="text-xs text-gray-600">Parcourer-nous lients dépravaillement de les parcours d'aide.</p>
            </div>

            {/* Critères de décision */}
            <div className="bg-white rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Critères de décision</h3>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <p>✓ Critères des catégories</p>
                <p>✓ au reversations des rôtelan.</p>
              </div>
            </div>

            {/* Outils d'intervention */}
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Outils d'intervention</h3>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
              <p className="text-xs text-gray-600">Ennoiez les outils de compétition toules et d'interventions.</p>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-gray-200 rounded-2xl p-6 flex flex-col">
            <div className="flex justify-center mb-4">
              <BarChart2 className="w-12 h-12 text-gray-600" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Stats</h2>

            {/* Taux de réussite */}
            <div className="bg-white rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Taux de réussite</h3>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                  70%
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-gray-900">Taux de réussite</p>
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                <div className="flex-1">
                  <p className="text-gray-600">Nombre</p>
                  <p className="font-semibold text-gray-900">de fiches</p>
                </div>
              </div>
            </div>

            {/* Nombre de fiches */}
            <div className="bg-white rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Nombre de fiches</h3>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-gray-900">69</span>
                <span className="text-xs text-gray-600">fiches</span>
              </div>
            </div>

            {/* Interventions par type */}
            <div className="bg-white rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Interventions par type</h3>
              <div className="flex gap-2 items-end h-20">
                <div className="flex-1 bg-blue-500 rounded-t" style={{ height: '60%' }}></div>
                <div className="flex-1 bg-gray-400 rounded-t" style={{ height: '40%' }}></div>
                <div className="flex-1 bg-green-600 rounded-t" style={{ height: '50%' }}></div>
                <div className="flex-1 bg-gray-500 rounded-t" style={{ height: '30%' }}></div>
              </div>
              <div className="flex gap-2 text-[10px] text-gray-600 mt-2">
                <span>Intervention</span>
                <span>Type type</span>
                <span>Intervention</span>
                <span>Soutien RASED</span>
              </div>
            </div>

            {/* Soutien RASED */}
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Soutien RASED</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-gray-500 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">50%</span>
                  </div>
                </div>
                <span className="text-sm text-gray-700 font-medium">RASED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around py-3">
        <Link to="/" className="flex flex-col items-center gap-1 text-blue-600">
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Accueil</span>
        </Link>
        <Link to="/dashboard" className="flex flex-col items-center gap-1 text-gray-400">
          <Users className="w-6 h-6" />
          <span className="text-[10px] font-medium">Élèves</span>
        </Link>
        <Link to="/evaluation-domains" className="flex flex-col items-center gap-1 text-gray-400">
          <TreePine className="w-6 h-6" />
          <span className="text-[10px] font-medium">Arbre</span>
        </Link>
        <Link to="/stats-annuelles" className="flex flex-col items-center gap-1 text-gray-400">
          <BarChart2 className="w-6 h-6" />
          <span className="text-[10px] font-medium">Stats</span>
        </Link>
      </div>
    </div>
  );
}