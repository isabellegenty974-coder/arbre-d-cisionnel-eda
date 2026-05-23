import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, TreePine, BarChart2, Home, UserPlus, Pencil } from "lucide-react";
import { base44 } from "@/api/base44Client";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import FirstVisitModal from "@/components/FirstVisitModal";

const BG_URL = 'https://media.base44.com/images/public/69e918c1956306f5db6eaf3d/fb9410bf1_generated_image.png';

export default function Accueil() {
  const navigate = useNavigate();
  const [notAuthenticated, setNotAuthenticated] = useState(false);
  const [showFirstVisitModal, setShowFirstVisitModal] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await base44.auth.me();
        setNotAuthenticated(false);
      } catch {
        setNotAuthenticated(true);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem('firstVisitModalSeen');
    if (!hasSeenModal) {
      setShowFirstVisitModal(true);
      localStorage.setItem('firstVisitModalSeen', 'true');
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await base44.auth.me();
        setNotAuthenticated(false);
      } catch {
        setNotAuthenticated(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (notAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="px-6 py-8 flex items-start justify-between border-b" style={{ borderColor: '#D4C4B0' }}>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#8B7355', fontFamily: 'Georgia, serif' }}>Arbre décisionnel RASED</h1>
            <p className="text-sm mt-1" style={{ color: '#9CAF88' }}>Connectez-vous pour accéder à l'application</p>
          </div>
          <button
            onClick={() => base44.auth.redirectToLogin()}
            className="px-6 py-2 rounded-full border-2 font-semibold transition-all hover:opacity-80"
            style={{ borderColor: '#6B8BA5', color: '#6B8BA5' }}
          >
            Se connecter
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center pb-20" style={{ color: '#B0A090' }}>
          <p>Application inaccessible. Veuillez vous connecter.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ backgroundImage: `url(${BG_URL})`, backgroundSize: 'cover', backgroundColor: '#F5F0E8' }}>
      <FirstVisitModal
        isOpen={showFirstVisitModal}
        onClose={() => setShowFirstVisitModal(false)}
        onGoToTeam={() => {
          setShowFirstVisitModal(false);
          navigate('/equipe-rased');
        }}
      />

      <HamburgerMenu />

      {/* Main Content */}
      <div className="px-4 py-8 max-w-2xl mx-auto space-y-6">
        
        {/* Welcome Card */}
        <div className="rounded-3xl p-8 shadow-lg" style={{ backgroundColor: '#FFFBF8', borderLeft: '6px solid #6B8BA5' }}>
          <div className="flex items-start gap-6">
            <div className="shrink-0">
              <TreePine className="w-16 h-16" style={{ color: '#6B8BA5' }} />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#8B7355', fontFamily: 'Georgia, serif' }}>
                Welcome to Arbre Décisionnel EDA
              </h1>
              <p className="text-sm mb-6" style={{ color: '#9CAF88', lineHeight: '1.6' }}>
                Sign in to continue
              </p>
              <button
                onClick={() => base44.auth.redirectToLogin()}
                className="px-8 py-3 rounded-full font-semibold text-white shadow-md transition-all hover:opacity-90"
                style={{ backgroundColor: '#6B8BA5' }}
              >
                Sign In to Continue
              </button>
            </div>
          </div>
        </div>

        {/* Aide à la Décision Card */}
        <div className="rounded-3xl p-8 shadow-lg" style={{ backgroundColor: '#9CAF88' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#FFFBF8', fontFamily: 'Georgia, serif' }}>
            Aide à la Décision
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#FFFBF8' }}>
            Une wise désestrantqu rune aide à la décisionnel EDA peu papper soras marches ari'n except norun-uisent le processing et outpuet umle sec arbre to décisionnel EDA.
          </p>
          <div className="mt-6 flex gap-4">
            <Link to="/evaluation-domains">
              <button className="px-6 py-2 rounded-lg font-semibold transition-all" style={{ backgroundColor: '#FFFBF8', color: '#9CAF88' }}>
                Parcours d'aide
              </button>
            </Link>
            <Link to="/dashboard">
              <button className="px-6 py-2 rounded-lg font-semibold transition-all" style={{ backgroundColor: '#FFFBF8', color: '#9CAF88' }}>
                Recherche d'élèves
              </button>
            </Link>
          </div>
        </div>

        {/* Comment ça marche Card */}
        <div className="rounded-3xl p-8 shadow-lg" style={{ backgroundColor: '#E8D4B8' }}>
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#8B7355', fontFamily: 'Georgia, serif' }}>
            Comment ça marche
          </h2>
          <div className="flex justify-between items-center text-center">
            <div>
              <div className="text-3xl mb-2">📥</div>
              <p className="text-sm font-semibold" style={{ color: '#8B7355' }}>Input</p>
            </div>
            <div className="text-2xl" style={{ color: '#A89A8A' }}>→</div>
            <div>
              <div className="text-3xl mb-2">⚙️</div>
              <p className="text-sm font-semibold" style={{ color: '#8B7355' }}>Processing</p>
            </div>
            <div className="text-2xl" style={{ color: '#A89A8A' }}>→</div>
            <div>
              <div className="text-3xl mb-2">📤</div>
              <p className="text-sm font-semibold" style={{ color: '#8B7355' }}>Output</p>
            </div>
          </div>
        </div>

        {/* Pour qui Card */}
        <div className="rounded-3xl p-8 shadow-lg" style={{ backgroundColor: '#FFFBF8' }}>
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#8B7355', fontFamily: 'Georgia, serif' }}>
            Pour qui?
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl text-center" style={{ backgroundColor: '#F5F0E8' }}>
              <p className="text-3xl mb-2">👨‍⚕️</p>
              <p className="text-sm font-semibold" style={{ color: '#8B7355' }}>Professionnels</p>
            </div>
            <div className="p-4 rounded-2xl text-center" style={{ backgroundColor: '#F5F0E8' }}>
              <p className="text-3xl mb-2">👩‍🏫</p>
              <p className="text-sm font-semibold" style={{ color: '#8B7355' }}>Éducateurs</p>
            </div>
            <div className="p-4 rounded-2xl text-center" style={{ backgroundColor: '#F5F0E8' }}>
              <p className="text-3xl mb-2">👨‍⚖️</p>
              <p className="text-sm font-semibold" style={{ color: '#8B7355' }}>Éducateurs</p>
            </div>
            <div className="p-4 rounded-2xl text-center" style={{ backgroundColor: '#F5F0E8' }}>
              <p className="text-3xl mb-2">🔬</p>
              <p className="text-sm font-semibold" style={{ color: '#8B7355' }}>Danteta analysts</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/register" className="rounded-2xl p-6 shadow-lg text-center" style={{ backgroundColor: '#FFFBF8', borderLeft: '4px solid #6B8BA5' }}>
            <UserPlus className="w-8 h-8 mx-auto mb-3" style={{ color: '#6B8BA5' }} />
            <p className="font-semibold text-sm" style={{ color: '#8B7355' }}>Créer un profil</p>
          </Link>
          <Link to="/edit-eleve" className="rounded-2xl p-6 shadow-lg text-center" style={{ backgroundColor: '#FFFBF8', borderLeft: '4px solid #6B8BA5' }}>
            <Pencil className="w-8 h-8 mx-auto mb-3" style={{ color: '#6B8BA5' }} />
            <p className="font-semibold text-sm" style={{ color: '#8B7355' }}>Modifier des infos</p>
          </Link>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-4 shadow-lg" style={{ backgroundColor: '#E8D4B8', borderTop: '1px solid #D4C4B0' }}>
        <Link to="/" className="flex flex-col items-center gap-1">
          <Home className="w-6 h-6" style={{ color: '#8B7355' }} />
          <span className="text-[10px] font-semibold" style={{ color: '#8B7355' }}>Accueil</span>
        </Link>
        <Link to="/dashboard" className="flex flex-col items-center gap-1">
          <Users className="w-6 h-6" style={{ color: '#A89A8A' }} />
          <span className="text-[10px] font-semibold" style={{ color: '#A89A8A' }}>Élèves</span>
        </Link>
        <Link to="/evaluation-domains" className="flex flex-col items-center gap-1">
          <TreePine className="w-6 h-6" style={{ color: '#A89A8A' }} />
          <span className="text-[10px] font-semibold" style={{ color: '#A89A8A' }}>Arbre</span>
        </Link>
        <Link to="/stats-annuelles" className="flex flex-col items-center gap-1">
          <BarChart2 className="w-6 h-6" style={{ color: '#A89A8A' }} />
          <span className="text-[10px] font-semibold" style={{ color: '#A89A8A' }}>Stats</span>
        </Link>
      </div>
    </div>
  );
}