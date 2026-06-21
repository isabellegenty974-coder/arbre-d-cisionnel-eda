import { useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Upload, FileText, Check, AlertTriangle, X, Plus, ChevronRight, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImportStepper from '@/components/rased/ImportStepper';
import ImportStep1 from '@/components/rased/ImportStep1';
import ImportStep2 from '@/components/rased/ImportStep2';
import ImportStep3 from '@/components/rased/ImportStep3';
import ImportStep4 from '@/components/rased/ImportStep4';

export default function ImportPDF() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ecoleId = searchParams.get('ecole_id');

  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [rows, setRows] = useState([]);
  const [importStats, setImportStats] = useState(null);

  const handleFileSelected = (f) => {
    setFile(f);
    setStep(2);
  };

  const handleAnalysisDone = (result, extractedRows) => {
    setAnalysisResult(result);
    setRows(extractedRows);
    setStep(3);
  };

  const handleImportDone = (stats) => {
    setImportStats(stats);
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Header */}
      <div className="bg-[#0F172A] px-6 pt-10 pb-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => ecoleId ? navigate(`/detail-ecole?id=${ecoleId}`) : navigate('/mes-ecoles')}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {ecoleId ? 'Retour à l\'école' : 'Mes écoles'}
          </button>
          <h1 className="text-white font-bold text-2xl">Import liste de classe</h1>
          <p className="text-white/60 text-sm mt-1">Créez automatiquement les fiches élèves depuis un document PDF</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        <ImportStepper currentStep={step} />

        <div className="mt-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <ImportStep1 onFileSelected={handleFileSelected} />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <ImportStep2
                  file={file}
                  ecoleId={ecoleId}
                  onDone={handleAnalysisDone}
                  onBack={() => setStep(1)}
                />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <ImportStep3
                  rows={rows}
                  setRows={setRows}
                  analysisResult={analysisResult}
                  ecoleId={ecoleId}
                  onImportDone={handleImportDone}
                  onBack={() => setStep(2)}
                />
              </motion.div>
            )}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <ImportStep4
                  stats={importStats}
                  ecoleId={ecoleId}
                  onRestart={() => { setStep(1); setFile(null); setAnalysisResult(null); setRows([]); setImportStats(null); }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}