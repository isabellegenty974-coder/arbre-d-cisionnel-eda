import { Toaster } from "@/components/ui/toaster";
import ConnectionIndicator from '@/components/ConnectionIndicator';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { DiagnosticProvider } from '@/lib/DiagnosticContext';
import ResumeButton from '@/components/tree/ResumeButton';
import BottomBar from '@/components/Navigation/BottomBar';
import WelcomeModal from '@/components/WelcomeModal';

// Pages
import Accueil from './pages/Accueil';
import Resume from './pages/Resume';
import Dashboard from './pages/Dashboard.jsx';
import Historique from './pages/Historique';
import FicheEleve from './pages/FicheEleve';
import PolitiqueConfidentialite from './pages/PolitiqueConfidentialite';
import StatsAnnuelles from './pages/StatsAnnuelles.jsx';
import Resultats from './pages/Resultats';
import EvaluationDomains from './pages/EvaluationDomains';
import ItemsApprentissages from './pages/ItemsApprentissages';
import ItemsComportement from './pages/ItemsComportement';
import ItemsDeveloppement from './pages/ItemsDeveloppement';
import ItemsContexte from './pages/ItemsContexte';
import AnalyseEDA from './pages/AnalyseEDA';
import ListeEleves from './pages/ListeEleves';
import DetailFiche from './pages/DetailFiche';
import HistoriqueEleve from './pages/HistoriqueEleve';
import ExportAnnuel from './pages/ExportAnnuel';
import RapportAnnuel from './pages/RapportAnnuel';
import EditEleve from './pages/EditEleve';
import ItemsProfessionnels from './pages/ItemsProfessionnels';
import DiagnosticEleve from './pages/DiagnosticEleve';
import TableauSynthese from './pages/TableauSynthese';
import InviteUsers from './pages/InviteUsers';
import Register from './pages/Register';
import EquipeRased from './pages/EquipeRased';
import SyntheseEleve from './pages/SyntheseEleve';
import MesEcoles from './pages/MesEcoles';
import DetailEcole from './pages/DetailEcole';
import ImportPDF from './pages/ImportPDF';
import Parametres from './pages/Parametres';
import Login from './pages/Login';
import Notifications from './pages/Notifications.jsx';

// Pages orphelines déplacées aux bons chemins
import ActionsAnxieteSit from './pages/ActionsAnxieteSit';
import ActionsGlobalApprentissage from './pages/ActionsGlobalApprentissage';
import HypoEcriture from './pages/HypoEcriture';
import HypoMaths from './pages/HypoMaths';
import MotriciteFine from './pages/MotriciteFine';
import MotriciteGlobale from './pages/MotriciteGlobale';

// Apprentissage
import Apprentissage from './pages/apprentissage/Apprentissage';
import Lecture from './pages/apprentissage/Lecture';
import LectureRecente from './pages/apprentissage/LectureRecente';
import LectureInstallee from './pages/apprentissage/LectureInstallee';
import HypoLecture from './pages/apprentissage/HypoLecture';
import ActionsLecture from './pages/apprentissage/ActionsLecture';
import Ecriture from './pages/apprentissage/Ecriture';
import Graphisme from './pages/apprentissage/Graphisme';
import Orthographe from './pages/apprentissage/Orthographe';
import ProductionEcrite from './pages/apprentissage/ProductionEcrite';
import Maths from './pages/apprentissage/Maths';
import MathsQuestions from './pages/apprentissage/maths/MathsQuestions';
import MathsQ19 from './pages/apprentissage/maths/Q19';
import MathsQ20 from './pages/apprentissage/maths/Q20';
import MathsQ21 from './pages/apprentissage/maths/Q21';
import MathsQ22 from './pages/apprentissage/maths/Q22';
import MathsQ23 from './pages/apprentissage/maths/Q23';
import MathsQ24 from './pages/apprentissage/maths/Q24';
import MathsQ25 from './pages/apprentissage/maths/Q25';
import { Q19A, Q19B, Q19C, Q19D } from './pages/apprentissage/maths/analyses/Q19Analyses';
import { Q20A, Q20B, Q20C, Q20D } from './pages/apprentissage/maths/analyses/Q20Analyses';
import { Q21A, Q21B, Q21C, Q21D } from './pages/apprentissage/maths/analyses/Q21Analyses';
import { Q22A, Q22B, Q22C, Q22D } from './pages/apprentissage/maths/analyses/Q22Analyses';
import { Q23A, Q23B, Q23C, Q23D } from './pages/apprentissage/maths/analyses/Q23Analyses';
import { Q24A, Q24B, Q24C, Q24D } from './pages/apprentissage/maths/analyses/Q24Analyses';
import { Q25A, Q25B, Q25C, Q25D } from './pages/apprentissage/maths/analyses/Q25Analyses';
import Numeration from './pages/apprentissage/Numeration';
import Problemes from './pages/apprentissage/Problemes';
import Calcul from './pages/apprentissage/Calcul';
import GlobalApprentissage from './pages/apprentissage/GlobalApprentissage';
import EcritureQuestions from './pages/apprentissage/ecriture/EcritureQuestions';
import EcritureQ11 from './pages/apprentissage/ecriture/Q11';
import EcritureQ12 from './pages/apprentissage/ecriture/Q12';
import EcritureQ13 from './pages/apprentissage/ecriture/Q13';
import EcritureQ14 from './pages/apprentissage/ecriture/Q14';
import EcritureQ15 from './pages/apprentissage/ecriture/Q15';
import EcritureQ16 from './pages/apprentissage/ecriture/Q16';
import EcritureQ17 from './pages/apprentissage/ecriture/Q17';
import EcritureQ18 from './pages/apprentissage/ecriture/Q18';
import { Q11A, Q11B, Q11C, Q11D } from './pages/apprentissage/ecriture/analyses/Q11Analyses';
import { Q12A, Q12B, Q12C, Q12D } from './pages/apprentissage/ecriture/analyses/Q12Analyses';
import { Q13A, Q13B, Q13C, Q13D } from './pages/apprentissage/ecriture/analyses/Q13Analyses';
import { Q14A, Q14B, Q14C, Q14D } from './pages/apprentissage/ecriture/analyses/Q14Analyses';
import { Q15A, Q15B, Q15C, Q15D } from './pages/apprentissage/ecriture/analyses/Q15Analyses';
import { Q16A, Q16B, Q16C, Q16D } from './pages/apprentissage/ecriture/analyses/Q16Analyses';
import { Q17A, Q17B, Q17C, Q17D } from './pages/apprentissage/ecriture/analyses/Q17Analyses';
import { Q18A, Q18B, Q18C, Q18D } from './pages/apprentissage/ecriture/analyses/Q18Analyses';
import LectureQuestions from './pages/apprentissage/LectureQuestions';
import LectureQ1 from './pages/apprentissage/lecture/Q1';
import LectureQ2 from './pages/apprentissage/lecture/Q2';
import LectureQ3 from './pages/apprentissage/lecture/Q3';
import LectureQ4 from './pages/apprentissage/lecture/Q4';
import LectureQ5 from './pages/apprentissage/lecture/Q5';
import { Q1A, Q1B, Q1C, Q1D } from './pages/apprentissage/lecture/analyses/Q1Analyses';
import { Q2A, Q2B, Q2C, Q2D } from './pages/apprentissage/lecture/analyses/Q2Analyses';
import { Q3A, Q3B, Q3C, Q3D } from './pages/apprentissage/lecture/analyses/Q3Analyses';
import { Q4A, Q4B, Q4C, Q4D } from './pages/apprentissage/lecture/analyses/Q4Analyses';
import { Q5A, Q5B, Q5C, Q5D } from './pages/apprentissage/lecture/analyses/Q5Analyses';

// Comportement
import Comportement from './pages/comportement/Comportement';
import ComportementQuestions from './pages/comportement/questions/ComportementQuestions';
import ComportementQ26 from './pages/comportement/questions/Q26';
import ComportementQ27 from './pages/comportement/questions/Q27';
import ComportementQ28 from './pages/comportement/questions/Q28';
import ComportementQ29 from './pages/comportement/questions/Q29';
import ComportementQ30 from './pages/comportement/questions/Q30';
import ComportementQ31 from './pages/comportement/questions/Q31';
import ComportementQ32 from './pages/comportement/questions/Q32';
import { Q26A, Q26B, Q26C, Q26D } from './pages/comportement/questions/analyses/Q26Analyses';
import { Q27A, Q27B, Q27C, Q27D } from './pages/comportement/questions/analyses/Q27Analyses';
import { Q28A, Q28B, Q28C, Q28D } from './pages/comportement/questions/analyses/Q28Analyses';
import { Q29A, Q29B, Q29C, Q29D } from './pages/comportement/questions/analyses/Q29Analyses';
import { Q30A, Q30B, Q30C, Q30D } from './pages/comportement/questions/analyses/Q30Analyses';
import { Q31A, Q31B, Q31C, Q31D } from './pages/comportement/questions/analyses/Q31Analyses';
import { Q32A, Q32B, Q32C, Q32D } from './pages/comportement/questions/analyses/Q32Analyses';
import Inhibition from './pages/comportement/Inhibition';
import ActionsInhibition from './pages/comportement/ActionsInhibition';
import Impulsivite from './pages/comportement/Impulsivite';
import ActionsImpulsivite from './pages/comportement/ActionsImpulsivite';
import Anxiete from './pages/comportement/Anxiete';
import AnxieteSit from './pages/comportement/AnxieteSit';
import AnxieteGen from './pages/comportement/AnxieteGen';
import ActionsAnxiete from './pages/comportement/ActionsAnxiete';
import Opposition from './pages/comportement/Opposition';
import ActionsOpposition from './pages/comportement/ActionsOpposition';

// Développement
import Developpement from './pages/developpement/Developpement';
import DeveloppementQuestions from './pages/developpement/questions/DeveloppementQuestions';
import DeveloppementQ33 from './pages/developpement/questions/Q33';
import DeveloppementQ34 from './pages/developpement/questions/Q34';
import DeveloppementQ35 from './pages/developpement/questions/Q35';
import DeveloppementQ36 from './pages/developpement/questions/Q36';
import DeveloppementQ37 from './pages/developpement/questions/Q37';
import { Q33A, Q33B, Q33C, Q33D } from './pages/developpement/questions/analyses/Q33Analyses';
import { Q34A, Q34B, Q34C, Q34D } from './pages/developpement/questions/analyses/Q34Analyses';
import { Q35A, Q35B, Q35C, Q35D } from './pages/developpement/questions/analyses/Q35Analyses';
import { Q36A, Q36B, Q36C, Q36D } from './pages/developpement/questions/analyses/Q36Analyses';
import { Q37A, Q37B, Q37C, Q37D } from './pages/developpement/questions/analyses/Q37Analyses';
import LangageOral from './pages/developpement/LangageOral';
import LangageCompr from './pages/developpement/LangageCompr';
import ActionsLangageCompr from './pages/developpement/ActionsLangageCompr';
import LangageExpr from './pages/developpement/LangageExpr';
import ActionsLangageExpr from './pages/developpement/ActionsLangageExpr';
import Motricite from './pages/developpement/Motricite';
import ActionsMotricite from './pages/developpement/ActionsMotricite';
import Attention from './pages/developpement/Attention';
import ActionsAttention from './pages/developpement/ActionsAttention';
import Interactions from './pages/developpement/Interactions';
import ActionsInteractions from './pages/developpement/ActionsInteractions';

// Contexte
import Contexte from './pages/contexte/Contexte';
import ContexteQuestions from './pages/contexte/questions/ContexteQuestions';
import ContexteQ38 from './pages/contexte/questions/Q38';
import ContexteQ39 from './pages/contexte/questions/Q39';
import ContexteQ40 from './pages/contexte/questions/Q40';
import { Q38A, Q38B, Q38C, Q38D } from './pages/contexte/questions/analyses/Q38Analyses';
import { Q39A, Q39B, Q39C, Q39D } from './pages/contexte/questions/analyses/Q39Analyses';
import { Q40A, Q40B, Q40C, Q40D } from './pages/contexte/questions/analyses/Q40Analyses';
import Famille from './pages/contexte/Famille';
import ActionsFamille from './pages/contexte/ActionsFamille';
import ClimatClasse from './pages/contexte/ClimatClasse';
import ActionsClimatClasse from './pages/contexte/ActionsClimatClasse';
import Changements from './pages/contexte/Changements';
import ActionsChangements from './pages/contexte/ActionsChangements';
import Absenteisme from './pages/contexte/Absenteisme';
import ActionsAbsenteisme from './pages/contexte/ActionsAbsenteisme';

// Redirection préservant la query string (ex: ?id=...)
function RedirectWithQuery({ to }) {
  const { search } = useLocation();
  return <Navigate to={`${to}${search}`} replace />;
}

// Inscription silencieuse : crée le profil plateforme puis redirige vers l'accueil (le popup guidera l'utilisateur)
function AutoRegister() {
  useEffect(() => {
    base44.auth.updateMe({ full_name: ' ' }).finally(() => {
      window.location.href = '/';
    });
  }, []);
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
    </div>
  );
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isFirstLogin = params.get('first_login') === 'true';
    
    if (user && (!user.first_login_seen || isFirstLogin)) {
      setShowWelcome(true);
      // Nettoyer le paramètre de l'URL
      if (isFirstLogin) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [user]);

  useEffect(() => {
    // Vérifier si l'utilisateur a accepté les conditions RGPD
    if (user && user.email) {
      const storedConsent = localStorage.getItem(`rgpd_consent_${user.email}`);
      if (!storedConsent) {
        // Afficher le modal de consentement si pas encore accepté
        setTimeout(() => {
          if (window.confirm(
            "En utilisant cette application, vous vous engagez à respecter la confidentialité des données des élèves conformément au RGPD et aux règles de l'Éducation Nationale.\n\nVous acceptez ces conditions ?"
          )) {
            localStorage.setItem(`rgpd_consent_${user.email}`, JSON.stringify({
              acceptedAt: new Date().toISOString(),
              memberName: user.full_name,
              email: user.email
            }));
          }
        }, 500);
      }
    }
  }, [user]);

  const handleWelcomeClose = async () => {
    setShowWelcome(false);
    try {
      await base44.auth.updateMe({ first_login_seen: true });
    } catch (err) {
      console.error('Error updating first_login_seen:', err);
    }
  };

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Allow /register and /login pages without authentication
  const publicPages = ['/register', '/login'];
  const isPublicPage = publicPages.some(page => location.pathname.startsWith(page));

  if (authError && !isPublicPage && authError.type === 'user_not_registered') {
    return <AutoRegister />;
  }

  return (
    <>
      {showWelcome && <WelcomeModal onClose={handleWelcomeClose} />}
      <ResumeButton />
      <BottomBar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/accueil" element={<Accueil />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/resume" element={<Navigate to="/dashboard" replace />} />
        <Route path="/fiche-eleve" element={<FicheEleve />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/historique" element={<Navigate to="/historique-eleve" replace />} />
        <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
        <Route path="/stats-annuelles" element={<StatsAnnuelles />} />
        <Route path="/resultats" element={<Navigate to="/dashboard" replace />} />
        <Route path="/evaluation-domains" element={<Navigate to="/dashboard" replace />} />
        <Route path="/items-apprentissages" element={<Navigate to="/items-professionnels" replace />} />
        <Route path="/items-comportement" element={<Navigate to="/items-professionnels" replace />} />
        <Route path="/items-developpement" element={<Navigate to="/items-professionnels" replace />} />
        <Route path="/items-contexte" element={<Navigate to="/items-professionnels" replace />} />
        <Route path="/analyse-eda" element={<Navigate to="/dashboard" replace />} />
        <Route path="/liste-eleves" element={<ListeEleves />} />
        <Route path="/detail-fiche" element={<DetailFiche />} />
        <Route path="/detail-eleve" element={<DetailFiche />} />
        <Route path="/detail-eleve" element={<DetailFiche />} />
        <Route path="/historique-eleve" element={<HistoriqueEleve />} />
        <Route path="/export-annuel" element={<ExportAnnuel />} />
        <Route path="/rapport-annuel" element={<RapportAnnuel />} />
        <Route path="/edit-eleve" element={<EditEleve />} />
        <Route path="/items-professionnels" element={<ItemsProfessionnels />} />
        <Route path="/hypotheses-eleve" element={<DiagnosticEleve />} />
        <Route path="/tableau-synthese" element={<Navigate to="/synthese-eleve" replace />} />
        <Route path="/invite-users" element={<InviteUsers />} />
        <Route path="/equipe-rased" element={<EquipeRased />} />
        <Route path="/synthese-eleve" element={<SyntheseEleve />} />
        <Route path="/mes-ecoles" element={<MesEcoles />} />
        <Route path="/detail-ecole" element={<DetailEcole />} />
        <Route path="/import-pdf" element={<ImportPDF />} />
        <Route path="/parametres" element={<Parametres />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* Redirections des anciennes routes en doublon */}
        <Route path="/DetailEleve" element={<RedirectWithQuery to="/detail-eleve" />} />
        <Route path="/AnalyseMaths" element={<Navigate to="/dashboard" replace />} />
        <Route path="/AnalyseEcriture" element={<Navigate to="/dashboard" replace />} />
      
      {/* Arbre décisionnel — redirigé vers le tableau de bord */}
      <Route path="/apprentissage/*" element={<Navigate to="/dashboard" replace />} />
      <Route path="/comportement/*" element={<Navigate to="/dashboard" replace />} />
      <Route path="/developpement/*" element={<Navigate to="/dashboard" replace />} />
      <Route path="/contexte/*" element={<Navigate to="/dashboard" replace />} />
      
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <DiagnosticProvider>
          <Router>
            <ConnectionIndicator />
            <AuthenticatedApp />
          </Router>
        </DiagnosticProvider>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App