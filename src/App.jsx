import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Accueil from './pages/Accueil';
import Apprentissage from './pages/Apprentissage';
import Lecture from './pages/Lecture';
import LectureInstallee from './pages/LectureInstallee';
import HypoLecture from './pages/HypoLecture';
import ActionsLecture from './pages/ActionsLecture';
import Comportement from './pages/Comportement';
import Anxiete from './pages/Anxiete';
import AnxieteGen from './pages/AnxieteGen';
import ActionsAnxiete from './pages/ActionsAnxiete';
import Developpement from './pages/Developpement';
import LangageOral from './pages/LangageOral';
import Contexte from './pages/Contexte';
import Famille from './pages/Famille';
import ActionsFamille from './pages/ActionsFamille';

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
      <Route path="/LectureInstallee" element={<LectureInstallee />} />
      <Route path="/HypoLecture" element={<HypoLecture />} />
      <Route path="/ActionsLecture" element={<ActionsLecture />} />
      <Route path="/Comportement" element={<Comportement />} />
      <Route path="/Anxiete" element={<Anxiete />} />
      <Route path="/AnxieteGen" element={<AnxieteGen />} />
      <Route path="/ActionsAnxiete" element={<ActionsAnxiete />} />
      <Route path="/Developpement" element={<Developpement />} />
      <Route path="/LangageOral" element={<LangageOral />} />
      <Route path="/Contexte" element={<Contexte />} />
      <Route path="/Famille" element={<Famille />} />
      <Route path="/ActionsFamille" element={<ActionsFamille />} />
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