import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImportStep1 from '@/components/rased/ImportStep1';
import ImportStep2 from '@/components/rased/ImportStep2';
import ImportStep3 from '@/components/rased/ImportStep3';
import ImportStep4 from '@/components/rased/ImportStep4';
import ImportEcoles from '@/components/rased/ImportEcoles';
import ImportElevesPDF from '@/components/rased/ImportElevesPDF';

export default function ImportPDF() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ecoleId = searchParams.get('ecoleId') || searchParams.get('ecole_id');

  // mode: null | 'ecoles' | 'eleves'
  const [mode, setMode] = useState(ecoleId ? 'eleves' : null);

  // États pour le flux élèves (existant)
  const [step, setStep]               = useState(1);
  const [file, setFile]               = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [rows, setRows]               = useState([]);
  const [importStats, setImportStats] = useState(null);

  const reset = () => { setStep(1); setFile(null); setAnalysisResult(null); setRows([]); setImportStats(null); };

  const backLabel = ecoleId ? "Retour à l'école" : mode ? 'Choisir un type d\'import' : 'Mes écoles';
  const handleBack = () => {
    if (mode && !ecoleId) { setMode(null); reset(); }
    else if (ecoleId) navigate(`/detail-ecole?id=${ecoleId}`);
    else navigate('/mes-ecoles');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F0F3F8', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1A3353', padding: '20px 24px 18px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <button onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,.6)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginBottom: 12 }}>
            <ArrowLeft size={16} /> {backLabel}
          </button>
          <h1 style={{ color: '#fff', fontSize: 21, fontWeight: 700, margin: 0 }}>Import PDF</h1>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, marginTop: 4 }}>
            {mode === 'ecoles' ? 'Importer une liste d\'écoles depuis un PDF'
              : mode === 'eleves' ? 'Importer une liste d\'élèves depuis un PDF'
              : 'Choisissez le type d\'import'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 20px 60px' }}>
        <AnimatePresence mode="wait">

          {/* CHOIX DU MODE */}
          {!mode && (
            <motion.div key="choix" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p style={{ fontSize: 14, color: '#566880', marginBottom: 20 }}>Que souhaitez-vous importer ?</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <button onClick={() => setMode('ecoles')} style={{ padding: '28px 24px', background: '#fff', border: '2px solid #D8E1EE', borderRadius: 16, cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#3B82C4'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(59,130,196,.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#D8E1EE'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#182840', marginBottom: 6 }}>Importer une liste d'écoles</div>
                  <div style={{ fontSize: 13, color: '#566880', lineHeight: 1.5 }}>Déposez le PDF de l'annuaire des écoles de la circonscription. L'IA extrait automatiquement les informations.</div>
                </button>
                <button onClick={() => setMode('eleves')} style={{ padding: '28px 24px', background: '#fff', border: '2px solid #D8E1EE', borderRadius: 16, cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#3B82C4'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(59,130,196,.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#D8E1EE'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>👤</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#182840', marginBottom: 6 }}>Importer une liste d'élèves par classe</div>
                  <div style={{ fontSize: 13, color: '#566880', lineHeight: 1.5 }}>Depuis Onde, Base Élèves ou une liste imprimée. Sélectionnez manuellement les élèves à importer.</div>
                </button>
              </div>
            </motion.div>
          )}

          {/* IMPORT ÉCOLES */}
          {mode === 'ecoles' && (
            <motion.div key="ecoles" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <ImportEcoles onDone={() => navigate('/mes-ecoles')} />
            </motion.div>
          )}

          {/* IMPORT ÉLÈVES */}
          {mode === 'eleves' && (
            <motion.div key="eleves" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              {/* Si on a un ecoleId, on utilise le flux existant en 4 étapes */}
              {ecoleId ? (
                <div>
                  {step === 1 && <ImportStep1 onFileSelected={f => { setFile(f); setStep(2); }} />}
                  {step === 2 && <ImportStep2 file={file} ecoleId={ecoleId} onDone={(r, ro) => { setAnalysisResult(r); setRows(ro); setStep(3); }} onBack={() => setStep(1)} />}
                  {step === 3 && <ImportStep3 rows={rows} setRows={setRows} analysisResult={analysisResult} ecoleId={ecoleId} onImportDone={s => { setImportStats(s); setStep(4); }} onBack={() => setStep(2)} />}
                  {step === 4 && <ImportStep4 stats={importStats} ecoleId={ecoleId} onRestart={() => { reset(); }} />}
                </div>
              ) : (
                <ImportElevesPDF onDone={() => navigate('/liste-eleves')} />
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}