import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Users, ClipboardList, TreePine, BarChart2, BookOpen, Shield, Search, Home, UserPlus, Pencil, FileText, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import FirstVisitModal from "@/components/FirstVisitModal";

export default function Accueil() {
  const navigate = useNavigate();
  const [notAuthenticated, setNotAuthenticated] = useState(false);
  const [eleves, setEleves] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [page, setPage] = useState(1);
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

  useEffect(() => {
    base44.auth.me().catch(() => navigate('/register'));
  }, [navigate]);

  const loadEleves = async () => {
    const [fiches, diagnostics] = await Promise.all([
      base44.entities.FicheEleve.list('-created_date', 100).catch(() => []),
      base44.entities.Diagnostic.list('-created_date', 200).catch(() => []),
    ]);
    
    const ficheKeys = new Set(fiches.map(f => `${f.prenom}|${f.nom}`.toLowerCase()));
    const orphanedDiags = diagnostics.filter(
      d => !ficheKeys.has(`${d.eleve_prenom}|${d.eleve_nom}`.toLowerCase())
    );
    for (const d of orphanedDiags) {
      await base44.entities.Diagnostic.delete(d.id).catch(() => {});
    }
    
    const map = new Map();
    fiches.forEach(f => {
      const key = `${f.prenom}|${f.nom}`.toLowerCase();
      map.set(key, { prenom: f.prenom, nom: f.nom, classe: f.classe, lastDate: f.date || f.created_date, profession: f.createdByProfession });
    });
    diagnostics.filter(d => ficheKeys.has(`${d.eleve_prenom}|${d.eleve_nom}`.toLowerCase())).forEach(d => {
      const key = `${d.eleve_prenom}|${d.eleve_nom}`.toLowerCase();
      if (!map.has(key)) map.set(key, { prenom: d.eleve_prenom, nom: d.eleve_nom, lastDate: d.created_date });
      else if (!map.get(key).lastDate) map.get(key).lastDate = d.created_date;
    });
    setEleves([...map.values()]);
    setPage(1);
  };

  useEffect(() => {
    loadEleves();
    const unsubFiche = base44.entities.FicheEleve.subscribe(() => loadEleves());
    const unsubDiag = base44.entities.Diagnostic.subscribe(() => loadEleves());
    return () => {
      unsubFiche();
      unsubDiag();
    };
  }, []);

  if (notAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="px-6 py-8 flex items-start justify-between border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A]">Arbre décisionnel RASED</h1>
            <p className="text-gray-600 text-sm mt-1">Connectez-vous pour accéder à l&apos;application</p>
          </div>
          <button
            onClick={() => base44.auth.redirectToLogin()}
            className="px-6 py-2 rounded-full border-2 border-[#3B82F6] text-[#3B82F6] font-semibold hover:bg-blue-50 transition-all"
          >
            Se connecter
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400 pb-20">
          <p>Application inaccessible. Veuillez vous connecter.</p>
        </div>
      </div>
    );
  }

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
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="flex items-start justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A]">Arbre décisionnel RASED</h1>
            <p className="text-gray-600 text-sm mt-1">Connectez-vous pour accéder à l&apos;application</p>
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Grid */}
      <div className="px-6 py-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-3 gap-6">
          {/* Card 1: Élèves */}
          <div className="bg-blue-100 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-200">
              <Users className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Élèves</h2>
            
            {/* Search Section */}
            <div className="bg-white rounded-lg p-4 space-y-3">
              <h3 className="font-bold text-[#0F172A]">Recherche d'élèves</h3>
              <p className="text-sm text-gray-600">Recherche-le d'élèves, pourquoi avoir ces applications.</p>
              <Link to="/dashboard">
                <button className="w-full bg-blue-100 hover:bg-blue-200 text-blue-600 font-semibold py-2 rounded-lg transition-colors">
                  Recherche d'élèves
                </button>
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <h3 className="font-bold text-[#0F172A]">Actions rapides</h3>
              <Link to="/register" className="flex items-center gap-2 p-3 rounded-lg hover:bg-white/50 transition-colors">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-[#0F172A]">Créer un profil</span>
              </Link>
              <Link to="/edit-eleve" className="flex items-center gap-2 p-3 rounded-lg hover:bg-white/50 transition-colors">
                <Pencil className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-[#0F172A]">Modifier des infos</span>
              </Link>
              <Link to="/historique" className="flex items-center gap-2 p-3 rounded-lg hover:bg-white/50 transition-colors">
                <BarChart2 className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-[#0F172A]">Suivi pédagogique</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Arbre */}
          <div className="bg-green-100 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-200">
              <TreePine className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Arbre</h2>
            
            {/* Parcours Section */}
            <div className="bg-white rounded-lg p-4 space-y-3">
              <h3 className="font-bold text-[#0F172A]">Parcours d'aide</h3>
              <p className="text-sm text-gray-600">Parcourez-nous lients dépravaillement de les parcours d'aide.</p>
              <Link to="/evaluation-domains">
                <button className="w-full bg-green-100 hover:bg-green-200 text-green-600 font-semibold py-2 rounded-lg transition-colors">
                  Parcours d'aide
                </button>
              </Link>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/50 transition-colors bg-white/30">
                <span className="font-bold text-[#0F172A]">Critères de décision</span>
                <ChevronDown className="w-4 h-4 text-green-600" />
              </button>
              <p className="text-sm text-gray-700 px-3">Critères des catégories au reversions des décision.</p>
              
              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/50 transition-colors bg-white/30">
                <span className="font-bold text-[#0F172A]">Outils d'intervention</span>
                <ChevronDown className="w-4 h-4 text-green-600" />
              </button>
              <p className="text-sm text-gray-700 px-3">Envoyer les outils de compétision toules et d'interventions.</p>
            </div>
          </div>

          {/* Card 3: Stats */}
          <div className="bg-gray-100 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-300">
              <BarChart2 className="w-10 h-10 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Stats</h2>
            
            {/* KPI Grid */}
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-2">Taux de réussite</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-600">70%</span>
                  <BarChart2 className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">Taux de réussite</p>
              </div>
              
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-2">Nombre de fiches</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">69</span>
                  <FileText className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-2">Interventions par type</p>
                <BarChart2 className="w-12 h-8 text-gray-400" />
              </div>
            </div>

            <Link to="/stats-annuelles">
              <button className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 rounded-lg transition-colors">
                Voir toutes les stats
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around py-3 px-4">
        <Link to="/" className="flex flex-col items-center gap-1">
          <Home className="w-6 h-6 text-blue-600" />
          <span className="text-[10px] font-medium text-blue-600">Accueil</span>
        </Link>
        <Link to="/dashboard" className="flex flex-col items-center gap-1">
          <Users className="w-6 h-6 text-gray-400" />
          <span className="text-[10px] font-medium text-gray-400">Élèves</span>
        </Link>
        <Link to="/evaluation-domains" className="flex flex-col items-center gap-1">
          <TreePine className="w-6 h-6 text-gray-400" />
          <span className="text-[10px] font-medium text-gray-400">Arbre</span>
        </Link>
        <Link to="/stats-annuelles" className="flex flex-col items-center gap-1">
          <BarChart2 className="w-6 h-6 text-gray-400" />
          <span className="text-[10px] font-medium text-gray-400">Stats</span>
        </Link>
      </div>
    </div>
  );
}