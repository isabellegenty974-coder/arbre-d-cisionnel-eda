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
import EcritureGeste from './pages/apprentissage/EcritureGeste';
import EcritureProduction from './pages/apprentissage/EcritureProduction';
import Maths from './pages/apprentissage/Maths';
import GlobalApprentissage from './pages/apprentissage/GlobalApprentissage';
// Comportement
import Comportement from './pages/comportement/Comportement';
import Inhibition from './pages/comportement/Inhibition';
import Impulsivite from './pages/comportement/Impulsivite';
import Anxiete from './pages/comportement/Anxiete';
import AnxieteSit from './pages/comportement/AnxieteSit';
import AnxieteGen from './pages/comportement/AnxieteGen';
import ActionsAnxiete from './pages/comportement/ActionsAnxiete';
import Opposition from './pages/comportement/Opposition';
// Développement
import Developpement from './pages/developpement/Developpement';
import LangageOral from './pages/developpement/LangageOral';
import LangageCompr from './pages/developpement/LangageCompr';
import LangageExpr from './pages/developpement/LangageExpr';
import Motricite from './pages/developpement/Motricite';
import Attention from './pages/developpement/Attention';
import Interactions from './pages/developpement/Interactions';
// Contexte
import Contexte from './pages/contexte/Contexte';
import Famille from './pages/contexte/Famille';
import ActionsFamille from './pages/contexte/ActionsFamille';
import ClimatClasse from './pages/contexte/ClimatClasse';
import Changements from './pages/contexte/Changements';
import Absenteisme from './pages/contexte/Absenteisme';

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
      <Route path="/apprentissage/ecriture/geste" element={<EcritureGeste />} />
      <Route path="/apprentissage/ecriture/production" element={<EcritureProduction />} />
      <Route path="/apprentissage/maths" element={<Maths />} />
      <Route path="/apprentissage/global" element={<GlobalApprentissage />} />
      {/* Comportement */}
      <Route path="/comportement" element={<Comportement />} />
      <Route path="/comportement/inhibition" element={<Inhibition />} />
      <Route path="/comportement/impulsivite" element={<Impulsivite />} />
      <Route path="/comportement/anxiete" element={<Anxiete />} />
      <Route path="/comportement/anxiete/situationnelle" element={<AnxieteSit />} />
      <Route path="/comportement/anxiete/generalisee" element={<AnxieteGen />} />
      <Route path="/comportement/anxiete/actions" element={<ActionsAnxiete />} />
      <Route path="/comportement/opposition" element={<Opposition />} />
      {/* Développement */}
      <Route path="/developpement" element={<Developpement />} />
      <Route path="/developpement/langage-oral" element={<LangageOral />} />
      <Route path="/developpement/langage-oral/comprehension" element={<LangageCompr />} />
      <Route path="/developpement/langage-oral/expression" element={<LangageExpr />} />
      <Route path="/developpement/motricite" element={<Motricite />} />
      <Route path="/developpement/attention" element={<Attention />} />
      <Route path="/developpement/interactions" element={<Interactions />} />
      {/* Contexte */}
      <Route path="/contexte" element={<Contexte />} />
      <Route path="/contexte/famille" element={<Famille />} />
      <Route path="/contexte/famille/actions" element={<ActionsFamille />} />
      <Route path="/contexte/climat-classe" element={<ClimatClasse />} />
      <Route path="/contexte/changements" element={<Changements />} />
      <Route path="/contexte/absenteisme" element={<Absenteisme />} />
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