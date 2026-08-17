import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useOfflineSync } from '@/lib/useOfflineSync';
import { runSauvegarde } from '@/lib/sauvegarde';
import { ArrowLeft, DatabaseBackup, ShieldAlert, Loader2, CheckCircle2, AlertTriangle, WifiOff } from 'lucide-react';

const PHASE_LABELS = {
  entities: 'Récupération des données',
  files: 'Téléchargement des fichiers joints',
  dossiers: 'Reconstitution des dossiers élèves',
  zip: "Compression de l'archive",
};

const ANOMALY_LABELS = {
  eleveRasedSansFiche: 'EleveRased pointant vers une fiche inexistante',
  fichesAvecPlusieursEleveRased: 'Fiches visées par plusieurs EleveRased (doublons potentiels)',
  fichesOrphelines: 'Fiches sans aucun EleveRased lié',
  eleveRasedSansLienResolu: 'EleveRased avec école ou classe non résolue',
};

export default function Sauvegarde() {
  const navigate = useNavigate();
  const { isOnline } = useOfflineSync();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(null);
  const [summary, setSummary] = useState(null);
  const [runError, setRunError] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoadingUser(false));
  }, []);

  const handleBackup = async () => {
    if (!isOnline) {
      setRunError("Vous êtes hors connexion. Reconnectez-vous avant de lancer une sauvegarde.");
      return;
    }
    setRunning(true);
    setSummary(null);
    setRunError(null);
    setProgress({ phase: 'entities', message: 'Démarrage…', percent: 0 });
    try {
      const { blob, filename, summary: result } = await runSauvegarde({
        base44,
        onProgress: setProgress,
      });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setSummary({ ...result, filename });
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      setRunError(err?.message || 'Une erreur inattendue est survenue.');
    } finally {
      setRunning(false);
      setProgress(null);
    }
  };

  // ── États de garde ─────────────────────────────────────────────────────
  if (loadingUser) {
    return (
      <div style={{ minHeight: '100vh', background: '#F0F3F8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #D8E1EE', borderTopColor: '#3B82C4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', background: '#F0F3F8', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: '#fff', borderRadius: 18, padding: '32px 28px', maxWidth: 380, textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,.06)' }}>
          <ShieldAlert size={32} style={{ color: '#B85C1A', marginBottom: 14 }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: '#182840', marginBottom: 8 }}>Accès réservé</div>
          <p style={{ fontSize: 13, color: '#566880', lineHeight: 1.6, marginBottom: 20 }}>
            Cette page est réservée à l'administratrice de l'application.
          </p>
          <button onClick={() => navigate('/dashboard')}
            style={{ padding: '10px 20px', background: '#3B82C4', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  const phaseLabel = progress ? (PHASE_LABELS[progress.phase] || progress.message) : '';

  return (
    <div style={{ minHeight: '100vh', background: '#F0F3F8', fontFamily: 'Inter, sans-serif', paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ background: '#1A3353', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 14px' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-.01em' }}>Suivis RASED</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>La Possession · La Réunion</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.12)', padding: '7px 14px', borderRadius: 20 }}>
            <DatabaseBackup size={14} style={{ color: '#fff' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Sauvegarde</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '28px 16px' }}>

        {/* Retour */}
        <button onClick={() => navigate('/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#566880', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, marginBottom: 20 }}>
          <ArrowLeft size={14} /> Tableau de bord
        </button>

        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#182840', margin: '0 0 6px' }}>Sauvegarde complète</h1>
        <p style={{ fontSize: 13, color: '#566880', margin: '0 0 20px', lineHeight: 1.6 }}>
          Génère une archive ZIP horodatée contenant l'ensemble des données de l'application : tous les
          enregistrements de toutes les entités, tous les documents et photos joints, et un journal détaillé
          de l'opération. Le déclenchement est manuel — aucune sauvegarde automatique ou planifiée n'est active.
        </p>

        {/* Alerte hors ligne */}
        {!isOnline && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: '#FEF0E4', border: '1px solid #B85C1A', borderRadius: 14, padding: '14px 18px', marginBottom: 16 }}>
            <WifiOff size={18} style={{ color: '#B85C1A', flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 13, color: '#B85C1A', lineHeight: 1.6 }}>
              <strong>Vous êtes hors connexion.</strong> La sauvegarde nécessite un accès réseau pour interroger
              Base44 et télécharger les fichiers joints — une archive lancée hors ligne serait vide ou incomplète.
              Le bouton est désactivé tant que la connexion n'est pas rétablie.
            </div>
          </div>
        )}

        {/* Avertissement secret professionnel */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: '#FEF0E4', border: '1px solid #B85C1A', borderRadius: 14, padding: '14px 18px', marginBottom: 20 }}>
          <ShieldAlert size={18} style={{ color: '#B85C1A', flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 13, color: '#B85C1A', lineHeight: 1.6 }}>
            <strong>Données nominatives couvertes par le secret professionnel.</strong> Cette archive contient
            l'identité et les dossiers de suivi d'élèves mineurs. Conservez-la exclusivement sur un support
            chiffré (disque ou clé USB chiffrés) et supprimez-la dès qu'elle n'est plus nécessaire. Ne la
            transmettez jamais par email non chiffré.
          </div>
        </div>

        {/* Contenu de l'archive */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '20px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#182840', marginBottom: 12 }}>Contenu de l'archive</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5, color: '#566880', lineHeight: 1.6 }}>
            <div><code style={{ color: '#254D7A', background: '#EAF2FB', padding: '1px 6px', borderRadius: 5 }}>donnees.json</code> — toutes les tables telles quelles, y compris celles inutilisées par l'app (ex. Eleve)</div>
            <div><code style={{ color: '#254D7A', background: '#EAF2FB', padding: '1px 6px', borderRadius: 5 }}>eleves/&lt;Nom_Prenom&gt;/dossier.json</code> + <code style={{ color: '#254D7A', background: '#EAF2FB', padding: '1px 6px', borderRadius: 5 }}>dossier.html</code> — un dossier reconstitué par fiche élève (fiche, historique EDA, notes, présences, école/classe résolues, documents), consultable hors ligne</div>
            <div><code style={{ color: '#254D7A', background: '#EAF2FB', padding: '1px 6px', borderRadius: 5 }}>fichiers/&lt;Entité&gt;/&lt;Nom_Prenom&gt;/</code> — documents et photos joints, sans doublon</div>
            <div><code style={{ color: '#254D7A', background: '#EAF2FB', padding: '1px 6px', borderRadius: 5 }}>anomalies.json</code> — incohérences détectées entre fiches élèves et registre du secteur</div>
            <div><code style={{ color: '#254D7A', background: '#EAF2FB', padding: '1px 6px', borderRadius: 5 }}>journal.txt</code> — décompte par table, fichiers récupérés, dossiers reconstitués, anomalies, détail des échecs</div>
            <div><code style={{ color: '#254D7A', background: '#EAF2FB', padding: '1px 6px', borderRadius: 5 }}>brouillon-local.json</code> — présent uniquement si un brouillon de diagnostic non synchronisé existe sur cet appareil</div>
          </div>
        </div>

        {/* Action */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '20px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
          <button
            onClick={handleBackup}
            disabled={running || !isOnline}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '13px', background: running || !isOnline ? '#A9C4E0' : '#3B82C4', color: '#fff',
              border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
              cursor: running || !isOnline ? 'not-allowed' : 'pointer',
            }}
          >
            {running ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <DatabaseBackup size={16} />}
            {running ? 'Sauvegarde en cours…' : summary ? 'Générer une nouvelle sauvegarde' : 'Générer une sauvegarde'}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          {/* Progression */}
          {running && progress && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#566880', marginBottom: 6 }}>
                <span>{phaseLabel}</span>
                <span>{progress.percent}%</span>
              </div>
              <div style={{ height: 8, background: '#F0F3F8', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress.percent}%`, background: '#3B82C4', borderRadius: 6, transition: 'width .2s' }} />
              </div>
              <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 6 }}>{progress.message}</div>
            </div>
          )}

          {/* Erreur */}
          {runError && (
            <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'flex-start', background: '#FEE2E2', border: '1px solid #EF4444', borderRadius: 10, padding: '12px 14px' }}>
              <AlertTriangle size={16} style={{ color: '#EF4444', flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 12.5, color: '#B91C1C', lineHeight: 1.5 }}>{runError}</div>
            </div>
          )}
        </div>

        {/* Récapitulatif */}
        {summary && (
          <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.05)', marginBottom: 20 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F3F8', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={16} style={{ color: '#1E7A52' }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#182840' }}>Sauvegarde terminée</span>
            </div>

            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 12.5, color: '#566880', marginBottom: 14 }}>
                Fichier téléchargé : <strong style={{ color: '#182840' }}>{summary.filename}</strong>
              </div>

              {/* Chiffres clés */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))', gap: 10, marginBottom: 16 }}>
                <div style={{ background: '#F8FAFD', borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#182840' }}>{summary.totalRecords}</div>
                  <div style={{ fontSize: 10.5, color: '#566880', marginTop: 2 }}>Enregistrements<br />({summary.entityStats.length} tables)</div>
                </div>
                <div style={{ background: '#F8FAFD', borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: summary.fileStats.success < summary.fileStats.total ? '#B85C1A' : '#182840' }}>
                    {summary.fileStats.success}/{summary.fileStats.total}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#566880', marginTop: 2 }}>Fichiers récupérés</div>
                </div>
                <div style={{ background: '#F8FAFD', borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#182840' }}>{summary.dossierCount}</div>
                  <div style={{ fontSize: 10.5, color: '#566880', marginTop: 2 }}>Dossiers élèves</div>
                </div>
                <div style={{ background: '#F8FAFD', borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: summary.anomalyCount > 0 ? '#B85C1A' : '#1E7A52' }}>
                    {summary.anomalyCount}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#566880', marginTop: 2 }}>Anomalies de données</div>
                </div>
                <div style={{ background: '#F8FAFD', borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: summary.failures.length > 0 ? '#B85C1A' : '#1E7A52' }}>
                    {summary.failures.length}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#566880', marginTop: 2 }}>Échec(s) technique(s)</div>
                </div>
              </div>

              {summary.anomalyCount > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#B85C1A', marginBottom: 8 }}>
                    Anomalies de données (détail dans anomalies.json) :
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {Object.entries(ANOMALY_LABELS).map(([key, label]) => {
                      const count = summary.anomalies?.[key]?.length || 0;
                      if (count === 0) return null;
                      return (
                        <div key={key} style={{ fontSize: 11.5, color: '#B85C1A', background: '#FEF0E4', borderRadius: 8, padding: '8px 10px' }}>
                          <strong>{count}</strong> — {label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {summary.localDraftIncluded && (
                <div style={{ fontSize: 12, color: '#254D7A', background: '#EAF2FB', borderRadius: 8, padding: '8px 12px', marginBottom: 14 }}>
                  📝 Un brouillon de diagnostic propre à cet appareil a été inclus dans <code>brouillon-local.json</code>.
                </div>
              )}

              {summary.failures.length === 0 ? (
                <div style={{ fontSize: 13, color: '#1E7A52', background: '#E4F4ED', borderRadius: 10, padding: '12px 14px' }}>
                  ✅ Aucun échec — toutes les tables et tous les fichiers ont été récupérés.
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#B85C1A', marginBottom: 8 }}>
                    Détail des échecs (voir aussi journal.txt dans l'archive) :
                  </div>
                  <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {summary.failures.map((f, i) => (
                      <div key={i} style={{ fontSize: 11.5, color: '#B85C1A', background: '#FEF0E4', borderRadius: 8, padding: '8px 10px', lineHeight: 1.5 }}>
                        {f.context === 'table'
                          ? <><strong>[Table] {f.entity}</strong> — {f.message}</>
                          : <><strong>[Fichier] {f.entity} / {f.label}</strong> — {f.message}</>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
