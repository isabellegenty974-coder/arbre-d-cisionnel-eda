import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Accueil
import Accueil from '@/pages/Accueil';

// Apprentissage
import Apprentissage from '@/pages/Apprentissage';
import Lecture from '@/pages/Lecture';
import LectureRecente from '@/pages/LectureRecente';
import LectureInstallee from '@/pages/LectureInstallee';
import HypoLecture from '@/pages/HypoLecture';
import ActionsLecture from '@/pages/ActionsLecture';
import Ecriture from '@/pages/Ecriture';
import AnalyseEcriture from '@/pages/AnalyseEcriture';
import HypoEcriture from '@/pages/HypoEcriture';
import Maths from '@/pages/Maths';
import AnalyseMaths from '@/pages/AnalyseMaths';
import HypoMaths from '@/pages/HypoMaths';
import GlobalApprentissage from '@/pages/GlobalApprentissage';
import ActionsGlobalApprentissage from '@/pages/ActionsGlobalApprentissage';

// Comportement
import Comportement from '@/pages/Comportement';
import Inhibition from '@/pages/Inhibition';
import Impulsivite from '@/pages/Impulsivite';
import Anxiete from '@/pages/Anxiete';
import AnxieteSit from '@/pages/AnxieteSit';
import ActionsAnxieteSit from '@/pages/ActionsAnxieteSit';
import AnxieteGen from '@/pages/AnxieteGen';
import ActionsAnxiete from '@/pages/ActionsAnxiete';
import Opposition from '@/pages/Opposition';

// Développement
import Developpement from '@/pages/Developpement';
import LangageOral from '@/pages/LangageOral';
import LangageCompr from '@/pages/LangageCompr';
import ActionsLangageCompr from '@/pages/ActionsLangageCompr';
import LangageExpr from '@/pages/LangageExpr';
import ActionsLangageExpr from '@/pages/ActionsLangageExpr';
import Motricite from '@/pages/Motricite';
import MotriciteFine from '@/pages/MotriciteFine';
import MotriciteGlobale from '@/pages/MotriciteGlobale';
import Attention from '@/pages/Attention';
import ActionsAttention from '@/pages/ActionsAttention';
import Interactions from '@/pages/Interactions';
import ActionsInteractions from '@/pages/ActionsInteractions';

// Contexte
import Contexte from '@/pages/Contexte';
import Famille from '@/pages/Famille';
import ActionsFamille from '@/pages/ActionsFamille';
import ClimatClasse from '@/pages/ClimatClasse';
import ActionsClimatClasse from '@/pages/ActionsClimatClasse';
import Changements from '@/pages/Changements';
import ActionsChangements from '@/pages/ActionsChangements';
import Absenteisme from '@/pages/Absenteisme';
import ActionsAbsenteisme from '@/pages/ActionsAbsenteisme';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Accueil />} />
      
      <Route path="/Apprentissage" element={<Apprentissage />} />
      <Route path="/Lecture" element={<Lecture />} />
      <Route path="/LectureRecente" element={<LectureRecente />} />
      <Route path="/LectureInstallee" element={<LectureInstallee />} />
      <Route path="/HypoLecture" element={<HypoLecture />} />
      <Route path="/ActionsLecture" element={<ActionsLecture />} />
      <Route path="/Ecriture" element={<Ecriture />} />
      <Route path="/AnalyseEcriture" element={<AnalyseEcriture />} />
      <Route path="/HypoEcriture" element={<HypoEcriture />} />
      <Route path="/Maths" element={<Maths />} />
      <Route path="/AnalyseMaths" element={<AnalyseMaths />} />
      <Route path="/HypoMaths" element={<HypoMaths />} />
      <Route path="/GlobalApprentissage" element={<GlobalApprentissage />} />
      <Route path="/ActionsGlobalApprentissage" element={<ActionsGlobalApprentissage />} />
      
      <Route path="/Comportement" element={<Comportement />} />
      <Route path="/Inhibition" element={<Inhibition />} />
      <Route path="/Impulsivite" element={<Impulsivite />} />
      <Route path="/Anxiete" element={<Anxiete />} />
      <Route path="/AnxieteSit" element={<AnxieteSit />} />
      <Route path="/ActionsAnxieteSit" element={<ActionsAnxieteSit />} />
      <Route path="/AnxieteGen" element={<AnxieteGen />} />
      <Route path="/ActionsAnxiete" element={<ActionsAnxiete />} />
      <Route path="/Opposition" element={<Opposition />} />
      
      <Route path="/Developpement" element={<Developpement />} />
      <Route path="/LangageOral" element={<LangageOral />} />
      <Route path="/LangageCompr" element={<LangageCompr />} />
      <Route path="/ActionsLangageCompr" element={<ActionsLangageCompr />} />
      <Route path="/LangageExpr" element={<LangageExpr />} />
      <Route path="/ActionsLangageExpr" element={<ActionsLangageExpr />} />
      <Route path="/Motricite" element={<Motricite />} />
      <Route path="/MotriciteFine" element={<MotriciteFine />} />
      <Route path="/MotriciteGlobale" element={<MotriciteGlobale />} />
      <Route path="/Attention" element={<Attention />} />
      <Route path="/ActionsAttention" element={<ActionsAttention />} />
      <Route path="/Interactions" element={<Interactions />} />
      <Route path="/ActionsInteractions" element={<ActionsInteractions />} />
      
      <Route path="/Contexte" element={<Contexte />} />
      <Route path="/Famille" element={<Famille />} />
      <Route path="/ActionsFamille" element={<ActionsFamille />} />
      <Route path="/ClimatClasse" element={<ClimatClasse />} />
      <Route path="/ActionsClimatClasse" element={<ActionsClimatClasse />} />
      <Route path="/Changements" element={<Changements />} />
      <Route path="/ActionsChangements" element={<ActionsChangements />} />
      <Route path="/Absenteisme" element={<Absenteisme />} />
      <Route path="/ActionsAbsenteisme" element={<ActionsAbsenteisme />} />
      
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App