import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Pages
import Accueil from './pages/Accueil';

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
import Numeration from './pages/apprentissage/Numeration';
import Problemes from './pages/apprentissage/Problemes';
import Calcul from './pages/apprentissage/Calcul';
import GlobalApprentissage from './pages/apprentissage/GlobalApprentissage';

// Comportement
import Comportement from './pages/comportement/Comportement';
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
import Famille from './pages/contexte/Famille';
import ActionsFamille from './pages/contexte/ActionsFamille';
import ClimatClasse from './pages/contexte/ClimatClasse';
import ActionsClimatClasse from './pages/contexte/ActionsClimatClasse';
import Changements from './pages/contexte/Changements';
import ActionsChangements from './pages/contexte/ActionsChangements';
import Absenteisme from './pages/contexte/Absenteisme';
import ActionsAbsenteisme from './pages/contexte/ActionsAbsenteisme';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Accueil />} />
      
      {/* Apprentissage */}
      <Route path="/apprentissage" element={<Apprentissage />} />
      <Route path="/apprentissage/lecture" element={<Lecture />} />
      <Route path="/apprentissage/lecture/recente" element={<LectureRecente />} />
      <Route path="/apprentissage/lecture/installee" element={<LectureInstallee />} />
      <Route path="/apprentissage/lecture/hypotheses" element={<HypoLecture />} />
      <Route path="/apprentissage/lecture/actions" element={<ActionsLecture />} />
      <Route path="/apprentissage/ecriture" element={<Ecriture />} />
      <Route path="/apprentissage/ecriture/graphisme" element={<Graphisme />} />
      <Route path="/apprentissage/ecriture/orthographe" element={<Orthographe />} />
      <Route path="/apprentissage/ecriture/production" element={<ProductionEcrite />} />
      <Route path="/apprentissage/maths" element={<Maths />} />
      <Route path="/apprentissage/maths/numeration" element={<Numeration />} />
      <Route path="/apprentissage/maths/problemes" element={<Problemes />} />
      <Route path="/apprentissage/maths/calcul" element={<Calcul />} />
      <Route path="/apprentissage/global" element={<GlobalApprentissage />} />
      
      {/* Comportement */}
      <Route path="/comportement" element={<Comportement />} />
      <Route path="/comportement/inhibition" element={<Inhibition />} />
      <Route path="/comportement/inhibition/actions" element={<ActionsInhibition />} />
      <Route path="/comportement/impulsivite" element={<Impulsivite />} />
      <Route path="/comportement/impulsivite/actions" element={<ActionsImpulsivite />} />
      <Route path="/comportement/anxiete" element={<Anxiete />} />
      <Route path="/comportement/anxiete/situationnelle" element={<AnxieteSit />} />
      <Route path="/comportement/anxiete/generalisee" element={<AnxieteGen />} />
      <Route path="/comportement/anxiete/actions" element={<ActionsAnxiete />} />
      <Route path="/comportement/opposition" element={<Opposition />} />
      <Route path="/comportement/opposition/actions" element={<ActionsOpposition />} />
      
      {/* Développement */}
      <Route path="/developpement" element={<Developpement />} />
      <Route path="/developpement/langage-oral" element={<LangageOral />} />
      <Route path="/developpement/langage-oral/comprehension" element={<LangageCompr />} />
      <Route path="/developpement/langage-oral/comprehension/actions" element={<ActionsLangageCompr />} />
      <Route path="/developpement/langage-oral/expression" element={<LangageExpr />} />
      <Route path="/developpement/langage-oral/expression/actions" element={<ActionsLangageExpr />} />
      <Route path="/developpement/motricite" element={<Motricite />} />
      <Route path="/developpement/motricite/actions" element={<ActionsMotricite />} />
      <Route path="/developpement/attention" element={<Attention />} />
      <Route path="/developpement/attention/actions" element={<ActionsAttention />} />
      <Route path="/developpement/interactions" element={<Interactions />} />
      <Route path="/developpement/interactions/actions" element={<ActionsInteractions />} />
      
      {/* Contexte */}
      <Route path="/contexte" element={<Contexte />} />
      <Route path="/contexte/famille" element={<Famille />} />
      <Route path="/contexte/famille/actions" element={<ActionsFamille />} />
      <Route path="/contexte/climat-classe" element={<ClimatClasse />} />
      <Route path="/contexte/climat-classe/actions" element={<ActionsClimatClasse />} />
      <Route path="/contexte/changements" element={<Changements />} />
      <Route path="/contexte/changements/actions" element={<ActionsChangements />} />
      <Route path="/contexte/absenteisme" element={<Absenteisme />} />
      <Route path="/contexte/absenteisme/actions" element={<ActionsAbsenteisme />} />
      
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