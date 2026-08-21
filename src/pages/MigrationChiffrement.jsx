import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Zap, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCrypto } from '@/lib/CryptoContext';
import { runEncryptionMigration } from '@/lib/migrateEncrypt';
import { Button } from '@/components/ui/button';

export default function MigrationChiffrement() {
  const navigate = useNavigate();
  const { status } = useCrypto();
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState(null);
  const logEndRef = useRef(null);

  const isUnlocked = status === 'unlocked';

  const scrollToBottom = () => {
    setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleRun = async (dryRun) => {
    setRunning(true);
    setLogs([]);
    setReport(null);
    try {
      const result = await runEncryptionMigration({
        dryRun,
        onProgress: (r) => {
          setLogs([...r.details]);
          scrollToBottom();
        },
      });
      setReport(result);
      setLogs([...result.details]);
      scrollToBottom();
    } catch (err) {
      setLogs((prev) => [...prev, `ERREUR FATALE : ${err.message}`]);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold">Migration du chiffrement</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Statut crypto */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            {isUnlocked ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            )}
            <h2 className="font-semibold">Clé maîtresse</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {isUnlocked
              ? 'Déverrouillée. Vous pouvez lancer la migration.'
              : 'Verrouillée. Déverrouillez avec votre phrase de passe avant de continuer.'}
          </p>
        </motion.div>

        {/* Explication */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-border bg-card p-4 space-y-3"
        >
          <h2 className="font-semibold">Que fait cette migration ?</h2>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
            <li>Parcourt toutes les fiches <strong>FicheEleve</strong> et <strong>EleveRased</strong>.</li>
            <li>Chiffre les champs <strong>nom</strong>, <strong>prénom</strong> et <strong>date de naissance</strong>.</li>
            <li>Ajoute une empreinte <strong>_fp</strong> pour la détection de doublons.</li>
            <li>Ignore les fiches déjà chiffrées ou sans nom.</li>
          </ul>
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-900">
              Lancez d'abord le <strong>mode à blanc</strong> pour vérifier ce qui sera modifié.
              Le mode réel est irréversible.
            </p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-4 space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleRun(true)}
              disabled={running || !isUnlocked}
              className="w-full"
            >
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Mode à blanc (simulation)
            </Button>
            <Button
              variant="default"
              onClick={() => handleRun(false)}
              disabled={running || !isUnlocked}
              className="w-full"
            >
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Mode réel (chiffrer)
            </Button>
          </div>
          {!isUnlocked && (
            <p className="text-xs text-amber-600 text-center">
              Déverrouillez le crypto pour activer ces boutons.
            </p>
          )}
        </motion.div>

        {/* Récapitulatif */}
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <h2 className="font-semibold mb-3">Récapitulatif</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="text-muted-foreground text-xs">Enregistrements lus</p>
                <p className="text-xl font-semibold">{report.summary.totalRecords}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="text-muted-foreground text-xs">À chiffrer</p>
                <p className="text-xl font-semibold">{report.summary.toEncrypt}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="text-muted-foreground text-xs">Déjà chiffrés</p>
                <p className="text-xl font-semibold">{report.summary.alreadyEncrypted}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="text-muted-foreground text-xs">Sans nom (ignorés)</p>
                <p className="text-xl font-semibold">{report.summary.skipped}</p>
              </div>
              {!report.dryRun && (
                <>
                  <div className="rounded-lg bg-green-50 p-3">
                    <p className="text-green-700 text-xs">Chiffrés avec succès</p>
                    <p className="text-xl font-semibold text-green-700">{report.summary.encrypted}</p>
                  </div>
                  <div className="rounded-lg bg-red-50 p-3">
                    <p className="text-red-700 text-xs">Erreurs</p>
                    <p className="text-xl font-semibold text-red-700">{report.summary.errors}</p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Journal */}
        {logs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-gray-900 text-gray-100 p-4 font-mono text-xs space-y-0.5 max-h-96 overflow-y-auto"
          >
            {logs.map((line, i) => (
              <div
                key={i}
                className={
                  line.startsWith('ERREUR')
                    ? 'text-red-400'
                    : line.startsWith('===') || line.startsWith('---')
                    ? 'text-yellow-400 font-semibold'
                    : line.startsWith('  →')
                    ? 'text-blue-300'
                    : 'text-gray-300'
                }
              >
                {line}
              </div>
            ))}
            <div ref={logEndRef} />
          </motion.div>
        )}
      </div>
    </div>
  );
}