import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ScreenLayout from '@/components/tree/ScreenLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import PhotoEEUpload from '@/components/PhotoEEUpload';

export default function DetailFiche() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [fiche, setFiche] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRapport, setShowRapport] = useState(false);

  const ficheId = searchParams.get('id');

  useEffect(() => {
    if (!ficheId) {
      setLoading(false);
      return;
    }

    base44.entities.FicheEleve.get(ficheId)
      .then(setFiche)
      .catch(() => setFiche(null))
      .finally(() => setLoading(false));
  }, [ficheId]);

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

          {/* Rapport */}
          {fiche.rapport && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="space-y-2"
            >
              <h2 className="font-semibold text-foreground">Rapport</h2>
              <div className="text-sm text-foreground bg-card border border-border rounded-lg p-3 whitespace-pre-wrap">
                {fiche.rapport}
              </div>
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
            {fiche.rapport && (
              <Button
                variant="secondary"
                onClick={() => setShowRapport(true)}
                className="gap-2"
              >
                Rapport
              </Button>
            )}
          </motion.div>

          {/* Modal Rapport */}
          {fiche.rapport && showRapport && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowRapport(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto p-6 border border-border"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="font-semibold text-foreground mb-4">Rapport</h2>
                <p className="text-sm text-foreground whitespace-pre-wrap mb-4">{fiche.rapport}</p>
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