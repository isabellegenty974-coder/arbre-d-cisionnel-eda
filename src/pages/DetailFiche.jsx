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

          {/* Retour */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-2"
          >
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
          </motion.div>
        </motion.div>
      </ScreenLayout>
    </div>
  );
}