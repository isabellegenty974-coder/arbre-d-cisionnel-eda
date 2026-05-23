import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ScreenLayout from '@/components/tree/ScreenLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import PhotoEEUpload from '@/components/PhotoEEUpload';
import RapportContent from '@/components/RapportContent';

export default function DetailFiche() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [fiche, setFiche] = useState(null);
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRapport, setShowRapport] = useState(false);
  const [selectedRapport, setSelectedRapport] = useState(null);
  const [selectedDiagnosticId, setSelectedDiagnosticId] = useState(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const ficheId = searchParams.get('id');

  useEffect(() => {
    if (!ficheId) {
      setLoading(false);
      return;
    }

    Promise.all([
      base44.entities.FicheEleve.get(ficheId),
      base44.entities.Diagnostic.list('-created_date', 200)
    ])
      .then(([ficheData, allDiagnostics]) => {
        setFiche(ficheData);
        if (ficheData && allDiagnostics) {
          const related = allDiagnostics.filter(
            d => d.eleve_nom?.toLowerCase() === ficheData.nom?.toLowerCase() &&
                 d.eleve_prenom?.toLowerCase() === ficheData.prenom?.toLowerCase()
          );
          setDiagnostics(related);
        }
      })
      .catch(() => setFiche(null))
      .finally(() => setLoading(false));
  }, [ficheId]);

  // Refresh la fiche toutes les 2 secondes pour détecter les mises à jour du rapport
  useEffect(() => {
    if (!ficheId) return;
    const interval = setInterval(() => {
      base44.entities.FicheEleve.get(ficheId).then(setFiche);
    }, 2000);
    return () => clearInterval(interval);
  }, [ficheId]);

  const handleNotesChange = async () => {
    if (!fiche) return;
    await base44.entities.FicheEleve.update(fiche.id, { notes });
    setFiche({ ...fiche, notes });
    setEditingNotes(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!fiche) {
    return (
      <div className="min-h-screen bg-background">
        <ScreenLayout title="Fiche non trouvée">
          <p className="text-center text-muted-foreground">Cette fiche n'existe pas.</p>
        </ScreenLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <ScreenLayout title={`${fiche.prenom} ${fiche.nom}`} subtitle={fiche.classe ? `Classe: ${fiche.classe}` : ''}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          {/* Âge */}
          {fiche.age && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="p-3 rounded-lg bg-secondary/50 border border-border"
            >
              <p className="text-sm text-muted-foreground mb-1">Âge</p>
              <p className="font-semibold text-foreground">{fiche.age} ans</p>
            </motion.div>
          )}

          {/* Observations */}
          {fiche.observations && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <h2 className="font-semibold text-foreground">Observations</h2>
              <p className="text-sm text-foreground bg-card border border-border rounded-lg p-3">
                {fiche.observations}
              </p>
            </motion.div>
          )}

          {/* Rapport de la fiche */}
          {fiche.rapport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex items-center justify-between gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg"
          >
            <div>
              <h2 className="font-semibold text-foreground">Rapport généré</h2>
              <p className="text-xs text-muted-foreground mt-1">{new Date(fiche.updated_date).toLocaleDateString('fr-FR')}</p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setSelectedRapport(fiche);
                setSelectedDiagnosticId(null);
                setShowRapport(true);
              }}
            >
              Voir
            </Button>
          </motion.div>
          )}

          {/* Synthèse EE avec Photo Upload */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h2 className="font-semibold text-foreground">Synthèse EE</h2>
            <PhotoEEUpload ficheId={ficheId} />
            {fiche.photo_ee_url && (
              <div className="rounded-lg overflow-hidden border-2 border-primary/20 bg-secondary/30">
                <img
                  src={fiche.photo_ee_url}
                  alt="Photo EE"
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>
            )}
          </motion.div>

          {/* Rapports générés */}
          {diagnostics.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="space-y-3"
            >
              <h2 className="font-semibold text-foreground">Rapports générés</h2>
              <div className="space-y-2">
                {diagnostics.map((diag, idx) => (
                  <motion.div
                    key={diag.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + idx * 0.05 }}
                    className="flex items-center justify-between gap-3 p-3 bg-card border border-border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {new Date(diag.created_date).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-xs text-muted-foreground">{diag.statut || 'Non spécifié'}</p>
                    </div>
                    {diag.rapport && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSelectedRapport(diag);
                          setSelectedDiagnosticId(diag.id);
                          setShowRapport(true);
                        }}
                      >
                        Voir
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Notes Section */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-6 rounded-xl bg-gradient-to-br from-amber-50 to-amber-50/50 dark:from-amber-950/20 dark:to-amber-950/10 border border-amber-200/30 dark:border-amber-800/30"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                📝 Notes libres
              </h3>
              {!editingNotes && (
                <button
                  onClick={() => {
                    setNotes(fiche?.notes || '');
                    setEditingNotes(true);
                  }}
                  className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Éditer
                </button>
              )}
            </div>
            {editingNotes ? (
              <div className="space-y-3">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Inscrivez vos observations rapides lors des entretiens..."
                  className="w-full min-h-32 p-3 rounded-lg border border-input bg-card text-foreground placeholder-muted-foreground resize-vertical focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setEditingNotes(false)}
                    className="px-4 py-2 rounded-md bg-secondary text-foreground hover:bg-secondary/80 transition-colors text-sm font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleNotesChange}
                    className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            ) : (
              <div className="min-h-32 p-4 rounded-lg bg-white/50 dark:bg-foreground/5 border border-amber-200/20 dark:border-amber-800/20">
                {fiche?.notes ? (
                  <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">{fiche.notes}</p>
                ) : (
                  <p className="text-muted-foreground text-sm italic">Aucune note pour le moment</p>
                )}
              </div>
            )}
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-2 flex-wrap"
          >
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
            <Button
              onClick={() => navigate(`/diagnostic-eleve?id=${ficheId}`)}
              className="gap-2"
            >
              Observation
            </Button>
          </motion.div>

          {/* Modal Rapport */}
          {showRapport && selectedRapport && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowRapport(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 border border-border"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="font-semibold text-foreground mb-2">
                  {selectedDiagnosticId ? 'Rapport - Diagnostic' : 'Rapport - Fiche élève'}
                </h2>
                <p className="text-xs text-muted-foreground mb-4">
                  {new Date(selectedRapport.created_date).toLocaleDateString('fr-FR')}
                </p>
                <div className="mb-4">
                  <RapportContent text={selectedRapport.rapport} />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowRapport(false)}
                  className="w-full"
                >
                  Fermer
                </Button>
              </motion.div>
            </div>
          )}
        </motion.div>
      </ScreenLayout>
    </div>
  );
}