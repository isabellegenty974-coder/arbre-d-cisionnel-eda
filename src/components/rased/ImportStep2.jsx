import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, AlertCircle, Users, Calendar, Search, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ANALYSIS_STEPS = [
  'Lecture du fichier…',
  'Détection de l\'école et de la classe…',
  'Extraction des noms et prénoms…',
  'Reconnaissance des dates de naissance…',
  'Vérification des doublons…',
  'Analyse terminée ✓',
];

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' o';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
}

export default function ImportStep2({ file, ecoleId, onDone, onBack }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [detectedInfo, setDetectedInfo] = useState({ ecole: '', classe: '', enseignant: '' });
  const [existingEleves, setExistingEleves] = useState([]);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    try {
      // Load existing for duplicate check
      const existing = await base44.entities.EleveRased.list('-created_date', 500).catch(() => []);
      setExistingEleves(existing);

      // Animate steps while uploading + AI analysis runs in parallel
      const stepTimer = setInterval(() => {
        setStepIdx(prev => {
          const next = prev + 1;
          setProgress(Math.min(Math.round((next / (ANALYSIS_STEPS.length - 1)) * 90), 90));
          if (next >= ANALYSIS_STEPS.length - 2) clearInterval(stepTimer);
          return next;
        });
      }, 900);

      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // AI extraction
      const aiResult = await base44.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
        prompt: `Tu es un expert en traitement de documents scolaires français. Analyse ce document PDF de liste de classe et extrais les informations suivantes au format JSON strict.

Extrais :
1. Le nom de l'école (si présent)
2. Le nom de la classe (CP, CE1, CE2, CM1, CM2, PS, MS, GS, etc.)
3. Le nom de l'enseignant·e (si présent)
4. La liste complète des élèves avec pour chaque élève :
   - nom (en majuscules)
   - prenom (avec majuscule initiale)
   - date_naissance (format YYYY-MM-DD si trouvée, sinon null)

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`,
        file_urls: [file_url],
        response_json_schema: {
          type: 'object',
          properties: {
            ecole: { type: 'string' },
            classe: { type: 'string' },
            enseignant: { type: 'string' },
            eleves: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  nom: { type: 'string' },
                  prenom: { type: 'string' },
                  date_naissance: { type: 'string' }
                }
              }
            }
          }
        }
      });

      clearInterval(stepTimer);
      setStepIdx(ANALYSIS_STEPS.length - 1);
      setProgress(100);

      const extracted = aiResult || {};
      const elevesList = extracted.eleves || [];

      setDetectedInfo({
        ecole: extracted.ecole || '',
        classe: extracted.classe || '',
        enseignant: extracted.enseignant || '',
      });

      // Mark duplicates
      const existingKeys = new Set(existing.map(e => `${e.prenom?.toLowerCase()}|${e.nom?.toLowerCase()}`));
      const rows = elevesList.map((e, i) => {
        const key = `${e.prenom?.toLowerCase()}|${e.nom?.toLowerCase()}`;
        const isDuplicate = existingKeys.has(key);
        return {
          id: `row-${i}`,
          nom: e.nom || '',
          prenom: e.prenom || '',
          date_naissance: e.date_naissance || '',
          classe: extracted.classe || '',
          selected: !isDuplicate,
          isDuplicate,
          hasError: !e.nom || !e.prenom,
        };
      });

      const nbDates = rows.filter(r => r.date_naissance).length;
      const nbDuplicates = rows.filter(r => r.isDuplicate).length;
      const nbErrors = rows.filter(r => r.hasError).length;

      setResult({
        total: rows.length,
        nbDates,
        nbErrors,
        nbDuplicates,
        ecole: extracted.ecole,
        classe: extracted.classe,
        enseignant: extracted.enseignant,
      });

      setDone(true);
      setTimeout(() => onDone(
        { ecole: extracted.ecole, classe: extracted.classe, enseignant: extracted.enseignant },
        rows
      ), 1200);

    } catch (err) {
      setError('Erreur lors de l\'analyse : ' + (err.message || 'Réessayez'));
    }
  };

  const fileSizeStr = file ? formatFileSize(file.size) : '';

  return (
    <div className="space-y-5">
      {/* File info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          <FileText className="w-6 h-6 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#0F172A] truncate">{file?.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{fileSizeStr} · PDF</p>
        </div>
        {done && <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />}
      </div>

      {/* Progress */}
      {!error && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-[#0F172A]">{ANALYSIS_STEPS[Math.min(stepIdx, ANALYSIS_STEPS.length - 1)]}</p>
            <span className="text-sm font-bold text-blue-500">{progress}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full"
              style={{ background: done ? '#22c55e' : 'linear-gradient(90deg, #3B82F6, #8B5CF6)' }}
            />
          </div>
          <div className="space-y-1.5">
            {ANALYSIS_STEPS.map((s, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs transition-all ${i <= stepIdx ? 'text-gray-700' : 'text-gray-300'}`}>
                {i < stepIdx ? (
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                ) : i === stepIdx ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 shrink-0" />
                )}
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {done && result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Detected school info */}
          {(result.ecole || result.classe || result.enseignant) && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">📍 École détectée automatiquement</p>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label: 'École', value: result.ecole, key: 'ecole' },
                  { label: 'Classe', value: result.classe, key: 'classe' },
                  { label: 'Enseignant·e', value: result.enseignant, key: 'enseignant' },
                ].map(({ label, value, key }) => (
                  <div key={key}>
                    <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">{label}</p>
                    <input
                      defaultValue={value || ''}
                      onChange={e => setDetectedInfo(d => ({ ...d, [key]: e.target.value }))}
                      placeholder={`${label} non détecté·e`}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-blue-200 bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4 stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Élèves détectés', value: result.total, color: '#2563eb', bg: '#dbeafe', icon: Users },
              { label: 'Dates reconnues', value: result.nbDates, color: '#16a34a', bg: '#dcfce7', icon: Calendar },
              { label: 'À vérifier', value: result.nbErrors, color: '#d97706', bg: '#fef3c7', icon: AlertCircle },
              { label: 'Doublons', value: result.nbDuplicates, color: '#6b7280', bg: '#f3f4f6', icon: Copy },
            ].map(({ label, value, color, bg, icon: Icon }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
                <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ background: bg }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <p className="text-xl font-bold" style={{ color }}>{value}</p>
                <p className="text-[10px] text-gray-500 mt-0.5 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700">Erreur d'analyse</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={onBack}>← Choisir un autre fichier</Button>
          </div>
        </div>
      )}
    </div>
  );
}