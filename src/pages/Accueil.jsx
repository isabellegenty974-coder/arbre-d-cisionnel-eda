import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Users, TreePine, BarChart2, Menu, Search, Plus, Bell, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import FirstVisitModal from '@/components/FirstVisitModal';
import { useDiagnostic } from '@/lib/DiagnosticContext';

export default function Accueil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showFirstVisitModal, setShowFirstVisitModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { eleve, setEleve } = useDiagnostic();

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
        base44.auth.redirectToLogin('/');
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-blue-900 pb-24">
      <FirstVisitModal
        isOpen={showFirstVisitModal}
        onClose={() => setShowFirstVisitModal(false)}
        onGoToTeam={() => {
          setShowFirstVisitModal(false);
          navigate('/equipe-rased');
        }}
      />

      <HamburgerMenu />

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-900 to-blue-800 text-white px-6 py-12">
        <h1 className="text-4xl font-bold text-center mb-1 text-blue-200">Arbre décisionnel</h1>
        <h2 className="text-4xl font-bold text-center mb-4 text-blue-200">RASED</h2>
        <p className="text-center text-blue-100 text-sm mb-8">Outil d'aide à la formulation d'hypothèses diagnostiques</p>

        {/* Action Buttons */}
        <div className="space-y-3 max-w-sm mx-auto">
          <Link to="/fiche-eleve" className="w-full">
            <button className="w-full bg-white text-gray-900 font-semibold py-3 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
              <span>📋</span>
              <span>Nouvelle observation</span>
              <Plus className="w-5 h-5" />
            </button>
          </Link>
          <Link to="/evaluation-domains" className="w-full">
            <button className="w-full bg-transparent border-2 border-white text-white font-semibold py-3 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5" />
              <span>Arbre décisionnel</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8 max-w-4xl mx-auto bg-blue-900 min-h-screen">
        <p className="text-gray-300 text-xs mb-4 ml-1 font-medium">sections</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">
          {/* Élèves Section - Left */}
          <div className="bg-blue-950 text-white rounded-2xl p-6 md:row-span-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Élèves</h3>
              <span className="bg-blue-500 text-xs px-3 py-1 rounded-full font-semibold">Gestion</span>
            </div>
            <p className="text-sm text-blue-200 mb-4">Fiches et historique des diagnostics</p>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-blue-400" />
                <input
                  type="text"
                  placeholder="Chercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-blue-900 text-white placeholder-blue-400 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Élèves Count */}
            <div className="bg-blue-900/50 rounded-lg p-3 mb-4">
              <p className="text-sm font-semibold text-blue-200">Ψ Élèves / <span className="text-blue-400">0 élève s</span></p>
            </div>

            {/* Empty State */}
            <div className="text-center text-blue-300 text-sm py-4">
              Aucun élève trouvé
            </div>
          </div>

          {/* Resources Section */}
          <Link to="/items-professionnels" className="block">
            <div className="bg-blue-950 text-white rounded-2xl p-6 hover:bg-blue-900 transition-colors cursor-pointer">
              <div className="text-3xl mb-3">📖</div>
              <h3 className="text-lg font-bold mb-2">Ressources</h3>
              <p className="text-sm text-blue-200">Guides professionnels</p>
            </div>
          </Link>

          {/* Confidentiality Section */}
          <Link to="/politique-confidentialite" className="block">
            <div className="bg-blue-950 text-white rounded-2xl p-6 hover:bg-blue-900 transition-colors cursor-pointer">
              <Shield className="w-8 h-8 mb-3 text-blue-300" />
              <h3 className="text-lg font-bold mb-2">Confidentialité</h3>
              <p className="text-sm text-blue-200">Conforme au RGPD</p>
            </div>
          </Link>

          {/* Team Section */}
          <Link to="/equipe-rased" className="block">
            <div className="bg-blue-950 text-white rounded-2xl p-6 hover:bg-blue-900 transition-colors cursor-pointer">
              <Users className="w-8 h-8 mb-3 text-blue-300" />
              <h3 className="text-lg font-bold mb-2">Équipe RAED</h3>
              <p className="text-sm text-blue-200">Voir l'équipe</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around py-4">
        <Link to="/" className="flex flex-col items-center gap-1 text-blue-500">
          <Home className="w-6 h-6" />
          <span className="text-[11px] font-semibold">Accueil</span>
        </Link>
        <Link to="/dashboard" className="flex flex-col items-center gap-1 text-gray-400">
          <Users className="w-6 h-6" />
          <span className="text-[11px] font-semibold">Élèves</span>
        </Link>
        <Link to="/evaluation-domains" className="flex flex-col items-center gap-1 text-gray-400">
          <TreePine className="w-6 h-6" />
          <span className="text-[11px] font-semibold">Arbre</span>
        </Link>
        <Link to="/stats-annuelles" className="flex flex-col items-center gap-1 text-gray-400">
          <BarChart2 className="w-6 h-6" />
          <span className="text-[11px] font-semibold">Statistiques</span>
        </Link>
      </div>
    </div>
  );
}