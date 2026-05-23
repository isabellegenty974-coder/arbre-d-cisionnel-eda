import { Toaster } from "@/components/ui/toaster"
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

// Pages
import Accueil from './pages/Accueil';
import Resume from './pages/Resume';
import Dashboard from './pages/Dashboard';
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
import DetailEleve from './pages/DetailEleve';
import DetailFiche from './pages/DetailFiche';
import HistoriqueEleve from './pages/HistoriqueEleve';
import ExportAnnuel from './pages/ExportAnnuel';
import EditEleve from './pages/EditEleve';
import ItemsProfessionnels from './pages/ItemsProfessionnels';
import DiagnosticEleve from './pages/DiagnosticEleve';
import TableauSynthese from './pages/TableauSynthese';
import InviteUsers from './pages/InviteUsers';
import Register from './pages/Register';
import EquipeRased from './pages/EquipeRased';

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

const AuthenticatedApp = () => {

  return (
    <>
      <ResumeButton />
      <BottomBar />
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/register" element={<Register />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/fiche-eleve" element={<FicheEleve />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/historique" element={<Historique />} />
        <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
        <Route path="/stats-annuelles" element={<StatsAnnuelles />} />
        <Route path="/resultats" element={<Resultats />} />
        <Route path="/evaluation-domains" element={<EvaluationDomains />} />
        <Route path="/items-apprentissages" element={<ItemsApprentissages />} />
        <Route path="/items-comportement" element={<ItemsComportement />} />
        <Route path="/items-developpement" element={<ItemsDeveloppement />} />
        <Route path="/items-contexte" element={<ItemsContexte />} />
        <Route path="/analyse-eda" element={<AnalyseEDA />} />
        <Route path="/liste-eleves" element={<ListeEleves />} />
        <Route path="/detail-eleve" element={<DetailEleve />} />
        <Route path="/detail-fiche" element={<DetailFiche />} />
        <Route path="/historique-eleve" element={<HistoriqueEleve />} />
        <Route path="/export-annuel" element={<ExportAnnuel />} />
        <Route path="/edit-eleve" element={<EditEleve />} />
        <Route path="/items-professionnels" element={<ItemsProfessionnels />} />
        <Route path="/diagnostic-eleve" element={<DiagnosticEleve />} />
        <Route path="/tableau-synthese" element={<TableauSynthese />} />
        <Route path="/invite-users" element={<InviteUsers />} />
        <Route path="/equipe-rased" element={<EquipeRased />} />
      
      {/* Apprentissage */}
      <Route path="/apprentissage" element={<Apprentissage />} />
      <Route path="/apprentissage/lecture" element={<Lecture />} />
      <Route path="/apprentissage/lecture/recente" element={<LectureRecente />} />
      <Route path="/apprentissage/lecture/installee" element={<LectureInstallee />} />
      <Route path="/apprentissage/lecture/hypotheses" element={<HypoLecture />} />
      <Route path="/apprentissage/lecture/actions" element={<ActionsLecture />} />
      <Route path="/apprentissage/lecture/questions" element={<LectureQuestions />} />
      <Route path="/apprentissage/lecture/questions/q1" element={<LectureQ1 />} />
      <Route path="/apprentissage/lecture/questions/q1/a" element={<Q1A />} />
      <Route path="/apprentissage/lecture/questions/q1/b" element={<Q1B />} />
      <Route path="/apprentissage/lecture/questions/q1/c" element={<Q1C />} />
      <Route path="/apprentissage/lecture/questions/q1/d" element={<Q1D />} />
      <Route path="/apprentissage/lecture/questions/q2" element={<LectureQ2 />} />
      <Route path="/apprentissage/lecture/questions/q2/a" element={<Q2A />} />
      <Route path="/apprentissage/lecture/questions/q2/b" element={<Q2B />} />
      <Route path="/apprentissage/lecture/questions/q2/c" element={<Q2C />} />
      <Route path="/apprentissage/lecture/questions/q2/d" element={<Q2D />} />
      <Route path="/apprentissage/lecture/questions/q3" element={<LectureQ3 />} />
      <Route path="/apprentissage/lecture/questions/q3/a" element={<Q3A />} />
      <Route path="/apprentissage/lecture/questions/q3/b" element={<Q3B />} />
      <Route path="/apprentissage/lecture/questions/q3/c" element={<Q3C />} />
      <Route path="/apprentissage/lecture/questions/q3/d" element={<Q3D />} />
      <Route path="/apprentissage/lecture/questions/q4" element={<LectureQ4 />} />
      <Route path="/apprentissage/lecture/questions/q4/a" element={<Q4A />} />
      <Route path="/apprentissage/lecture/questions/q4/b" element={<Q4B />} />
      <Route path="/apprentissage/lecture/questions/q4/c" element={<Q4C />} />
      <Route path="/apprentissage/lecture/questions/q4/d" element={<Q4D />} />
      <Route path="/apprentissage/lecture/questions/q5" element={<LectureQ5 />} />
      <Route path="/apprentissage/lecture/questions/q5/a" element={<Q5A />} />
      <Route path="/apprentissage/lecture/questions/q5/b" element={<Q5B />} />
      <Route path="/apprentissage/lecture/questions/q5/c" element={<Q5C />} />
      <Route path="/apprentissage/lecture/questions/q5/d" element={<Q5D />} />
      <Route path="/apprentissage/ecriture" element={<Ecriture />} />
      <Route path="/apprentissage/ecriture/questions" element={<EcritureQuestions />} />
      <Route path="/apprentissage/ecriture/questions/q11" element={<EcritureQ11 />} />
      <Route path="/apprentissage/ecriture/questions/q11/a" element={<Q11A />} />
      <Route path="/apprentissage/ecriture/questions/q11/b" element={<Q11B />} />
      <Route path="/apprentissage/ecriture/questions/q11/c" element={<Q11C />} />
      <Route path="/apprentissage/ecriture/questions/q11/d" element={<Q11D />} />
      <Route path="/apprentissage/ecriture/questions/q12" element={<EcritureQ12 />} />
      <Route path="/apprentissage/ecriture/questions/q12/a" element={<Q12A />} />
      <Route path="/apprentissage/ecriture/questions/q12/b" element={<Q12B />} />
      <Route path="/apprentissage/ecriture/questions/q12/c" element={<Q12C />} />
      <Route path="/apprentissage/ecriture/questions/q12/d" element={<Q12D />} />
      <Route path="/apprentissage/ecriture/questions/q13" element={<EcritureQ13 />} />
      <Route path="/apprentissage/ecriture/questions/q13/a" element={<Q13A />} />
      <Route path="/apprentissage/ecriture/questions/q13/b" element={<Q13B />} />
      <Route path="/apprentissage/ecriture/questions/q13/c" element={<Q13C />} />
      <Route path="/apprentissage/ecriture/questions/q13/d" element={<Q13D />} />
      <Route path="/apprentissage/ecriture/questions/q14" element={<EcritureQ14 />} />
      <Route path="/apprentissage/ecriture/questions/q14/a" element={<Q14A />} />
      <Route path="/apprentissage/ecriture/questions/q14/b" element={<Q14B />} />
      <Route path="/apprentissage/ecriture/questions/q14/c" element={<Q14C />} />
      <Route path="/apprentissage/ecriture/questions/q14/d" element={<Q14D />} />
      <Route path="/apprentissage/ecriture/questions/q15" element={<EcritureQ15 />} />
      <Route path="/apprentissage/ecriture/questions/q15/a" element={<Q15A />} />
      <Route path="/apprentissage/ecriture/questions/q15/b" element={<Q15B />} />
      <Route path="/apprentissage/ecriture/questions/q15/c" element={<Q15C />} />
      <Route path="/apprentissage/ecriture/questions/q15/d" element={<Q15D />} />
      <Route path="/apprentissage/ecriture/questions/q16" element={<EcritureQ16 />} />
      <Route path="/apprentissage/ecriture/questions/q16/a" element={<Q16A />} />
      <Route path="/apprentissage/ecriture/questions/q16/b" element={<Q16B />} />
      <Route path="/apprentissage/ecriture/questions/q16/c" element={<Q16C />} />
      <Route path="/apprentissage/ecriture/questions/q16/d" element={<Q16D />} />
      <Route path="/apprentissage/ecriture/questions/q17" element={<EcritureQ17 />} />
      <Route path="/apprentissage/ecriture/questions/q17/a" element={<Q17A />} />
      <Route path="/apprentissage/ecriture/questions/q17/b" element={<Q17B />} />
      <Route path="/apprentissage/ecriture/questions/q17/c" element={<Q17C />} />
      <Route path="/apprentissage/ecriture/questions/q17/d" element={<Q17D />} />
      <Route path="/apprentissage/ecriture/questions/q18" element={<EcritureQ18 />} />
      <Route path="/apprentissage/ecriture/questions/q18/a" element={<Q18A />} />
      <Route path="/apprentissage/ecriture/questions/q18/b" element={<Q18B />} />
      <Route path="/apprentissage/ecriture/questions/q18/c" element={<Q18C />} />
      <Route path="/apprentissage/ecriture/questions/q18/d" element={<Q18D />} />
      <Route path="/apprentissage/ecriture/graphisme" element={<Graphisme />} />
      <Route path="/apprentissage/ecriture/orthographe" element={<Orthographe />} />
      <Route path="/apprentissage/ecriture/production" element={<ProductionEcrite />} />
      <Route path="/apprentissage/maths" element={<Maths />} />
      <Route path="/apprentissage/maths/questions" element={<MathsQuestions />} />
      <Route path="/apprentissage/maths/questions/q19" element={<MathsQ19 />} />
      <Route path="/apprentissage/maths/questions/q19/a" element={<Q19A />} />
      <Route path="/apprentissage/maths/questions/q19/b" element={<Q19B />} />
      <Route path="/apprentissage/maths/questions/q19/c" element={<Q19C />} />
      <Route path="/apprentissage/maths/questions/q19/d" element={<Q19D />} />
      <Route path="/apprentissage/maths/questions/q20" element={<MathsQ20 />} />
      <Route path="/apprentissage/maths/questions/q20/a" element={<Q20A />} />
      <Route path="/apprentissage/maths/questions/q20/b" element={<Q20B />} />
      <Route path="/apprentissage/maths/questions/q20/c" element={<Q20C />} />
      <Route path="/apprentissage/maths/questions/q20/d" element={<Q20D />} />
      <Route path="/apprentissage/maths/questions/q21" element={<MathsQ21 />} />
      <Route path="/apprentissage/maths/questions/q21/a" element={<Q21A />} />
      <Route path="/apprentissage/maths/questions/q21/b" element={<Q21B />} />
      <Route path="/apprentissage/maths/questions/q21/c" element={<Q21C />} />
      <Route path="/apprentissage/maths/questions/q21/d" element={<Q21D />} />
      <Route path="/apprentissage/maths/questions/q22" element={<MathsQ22 />} />
      <Route path="/apprentissage/maths/questions/q22/a" element={<Q22A />} />
      <Route path="/apprentissage/maths/questions/q22/b" element={<Q22B />} />
      <Route path="/apprentissage/maths/questions/q22/c" element={<Q22C />} />
      <Route path="/apprentissage/maths/questions/q22/d" element={<Q22D />} />
      <Route path="/apprentissage/maths/questions/q23" element={<MathsQ23 />} />
      <Route path="/apprentissage/maths/questions/q23/a" element={<Q23A />} />
      <Route path="/apprentissage/maths/questions/q23/b" element={<Q23B />} />
      <Route path="/apprentissage/maths/questions/q23/c" element={<Q23C />} />
      <Route path="/apprentissage/maths/questions/q23/d" element={<Q23D />} />
      <Route path="/apprentissage/maths/questions/q24" element={<MathsQ24 />} />
      <Route path="/apprentissage/maths/questions/q24/a" element={<Q24A />} />
      <Route path="/apprentissage/maths/questions/q24/b" element={<Q24B />} />
      <Route path="/apprentissage/maths/questions/q24/c" element={<Q24C />} />
      <Route path="/apprentissage/maths/questions/q24/d" element={<Q24D />} />
      <Route path="/apprentissage/maths/questions/q25" element={<MathsQ25 />} />
      <Route path="/apprentissage/maths/questions/q25/a" element={<Q25A />} />
      <Route path="/apprentissage/maths/questions/q25/b" element={<Q25B />} />
      <Route path="/apprentissage/maths/questions/q25/c" element={<Q25C />} />
      <Route path="/apprentissage/maths/questions/q25/d" element={<Q25D />} />
      <Route path="/apprentissage/maths/numeration" element={<Numeration />} />
      <Route path="/apprentissage/maths/problemes" element={<Problemes />} />
      <Route path="/apprentissage/maths/calcul" element={<Calcul />} />
      <Route path="/apprentissage/global" element={<GlobalApprentissage />} />
      
      {/* Comportement */}
      <Route path="/comportement" element={<Comportement />} />
      <Route path="/comportement/questions" element={<ComportementQuestions />} />
      <Route path="/comportement/questions/q26" element={<ComportementQ26 />} />
      <Route path="/comportement/questions/q26/a" element={<Q26A />} />
      <Route path="/comportement/questions/q26/b" element={<Q26B />} />
      <Route path="/comportement/questions/q26/c" element={<Q26C />} />
      <Route path="/comportement/questions/q26/d" element={<Q26D />} />
      <Route path="/comportement/questions/q27" element={<ComportementQ27 />} />
      <Route path="/comportement/questions/q27/a" element={<Q27A />} />
      <Route path="/comportement/questions/q27/b" element={<Q27B />} />
      <Route path="/comportement/questions/q27/c" element={<Q27C />} />
      <Route path="/comportement/questions/q27/d" element={<Q27D />} />
      <Route path="/comportement/questions/q28" element={<ComportementQ28 />} />
      <Route path="/comportement/questions/q28/a" element={<Q28A />} />
      <Route path="/comportement/questions/q28/b" element={<Q28B />} />
      <Route path="/comportement/questions/q28/c" element={<Q28C />} />
      <Route path="/comportement/questions/q28/d" element={<Q28D />} />
      <Route path="/comportement/questions/q29" element={<ComportementQ29 />} />
      <Route path="/comportement/questions/q29/a" element={<Q29A />} />
      <Route path="/comportement/questions/q29/b" element={<Q29B />} />
      <Route path="/comportement/questions/q29/c" element={<Q29C />} />
      <Route path="/comportement/questions/q29/d" element={<Q29D />} />
      <Route path="/comportement/questions/q30" element={<ComportementQ30 />} />
      <Route path="/comportement/questions/q30/a" element={<Q30A />} />
      <Route path="/comportement/questions/q30/b" element={<Q30B />} />
      <Route path="/comportement/questions/q30/c" element={<Q30C />} />
      <Route path="/comportement/questions/q30/d" element={<Q30D />} />
      <Route path="/comportement/questions/q31" element={<ComportementQ31 />} />
      <Route path="/comportement/questions/q31/a" element={<Q31A />} />
      <Route path="/comportement/questions/q31/b" element={<Q31B />} />
      <Route path="/comportement/questions/q31/c" element={<Q31C />} />
      <Route path="/comportement/questions/q31/d" element={<Q31D />} />
      <Route path="/comportement/questions/q32" element={<ComportementQ32 />} />
      <Route path="/comportement/questions/q32/a" element={<Q32A />} />
      <Route path="/comportement/questions/q32/b" element={<Q32B />} />
      <Route path="/comportement/questions/q32/c" element={<Q32C />} />
      <Route path="/comportement/questions/q32/d" element={<Q32D />} />
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
      <Route path="/developpement/questions" element={<DeveloppementQuestions />} />
      <Route path="/developpement/questions/q33" element={<DeveloppementQ33 />} />
      <Route path="/developpement/questions/q33/a" element={<Q33A />} />
      <Route path="/developpement/questions/q33/b" element={<Q33B />} />
      <Route path="/developpement/questions/q33/c" element={<Q33C />} />
      <Route path="/developpement/questions/q33/d" element={<Q33D />} />
      <Route path="/developpement/questions/q34" element={<DeveloppementQ34 />} />
      <Route path="/developpement/questions/q34/a" element={<Q34A />} />
      <Route path="/developpement/questions/q34/b" element={<Q34B />} />
      <Route path="/developpement/questions/q34/c" element={<Q34C />} />
      <Route path="/developpement/questions/q34/d" element={<Q34D />} />
      <Route path="/developpement/questions/q35" element={<DeveloppementQ35 />} />
      <Route path="/developpement/questions/q35/a" element={<Q35A />} />
      <Route path="/developpement/questions/q35/b" element={<Q35B />} />
      <Route path="/developpement/questions/q35/c" element={<Q35C />} />
      <Route path="/developpement/questions/q35/d" element={<Q35D />} />
      <Route path="/developpement/questions/q36" element={<DeveloppementQ36 />} />
      <Route path="/developpement/questions/q36/a" element={<Q36A />} />
      <Route path="/developpement/questions/q36/b" element={<Q36B />} />
      <Route path="/developpement/questions/q36/c" element={<Q36C />} />
      <Route path="/developpement/questions/q36/d" element={<Q36D />} />
      <Route path="/developpement/questions/q37" element={<DeveloppementQ37 />} />
      <Route path="/developpement/questions/q37/a" element={<Q37A />} />
      <Route path="/developpement/questions/q37/b" element={<Q37B />} />
      <Route path="/developpement/questions/q37/c" element={<Q37C />} />
      <Route path="/developpement/questions/q37/d" element={<Q37D />} />
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
      <Route path="/contexte/questions" element={<ContexteQuestions />} />
      <Route path="/contexte/questions/q38" element={<ContexteQ38 />} />
      <Route path="/contexte/questions/q38/a" element={<Q38A />} />
      <Route path="/contexte/questions/q38/b" element={<Q38B />} />
      <Route path="/contexte/questions/q38/c" element={<Q38C />} />
      <Route path="/contexte/questions/q38/d" element={<Q38D />} />
      <Route path="/contexte/questions/q39" element={<ContexteQ39 />} />
      <Route path="/contexte/questions/q39/a" element={<Q39A />} />
      <Route path="/contexte/questions/q39/b" element={<Q39B />} />
      <Route path="/contexte/questions/q39/c" element={<Q39C />} />
      <Route path="/contexte/questions/q39/d" element={<Q39D />} />
      <Route path="/contexte/questions/q40" element={<ContexteQ40 />} />
      <Route path="/contexte/questions/q40/a" element={<Q40A />} />
      <Route path="/contexte/questions/q40/b" element={<Q40B />} />
      <Route path="/contexte/questions/q40/c" element={<Q40C />} />
      <Route path="/contexte/questions/q40/d" element={<Q40D />} />
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
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <DiagnosticProvider>
          <Router>
            <AuthenticatedApp />
          </Router>
        </DiagnosticProvider>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App