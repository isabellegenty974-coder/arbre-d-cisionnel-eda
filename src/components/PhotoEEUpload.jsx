import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PhotoEEUpload({ ficheId, onPhotoUploaded, initialPhotoUrl }) {
  const [preview, setPreview] = useState(initialPhotoUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file || isLoading) return;
    if (!ficheId) {
      setError('ID de fiche manquant');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Afficher l'aperçu
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);

      // Upload le fichier
      const response = await base44.integrations.Core.UploadFile({ file });
      
      if (!response?.file_url) {
        throw new Error('URL du fichier manquante');
      }

      // Sauvegarde l'URL
      await base44.entities.FicheEleve.update(ficheId, {
        photo_ee_url: response.file_url
      });

      onPhotoUploaded?.(response.file_url);
    } catch (err) {
      console.error('Erreur upload photo:', err);
      setPreview(null);
      setError(err?.message || 'Erreur lors de l\'upload');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground block">Photo de synthèse EE</label>
      
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
        >
          {error}
        </motion.div>
      )}
      
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-lg overflow-hidden border-2 border-primary/20 bg-secondary/30"
          >
            <img src={preview} alt="Photo EE" className="w-full h-auto max-h-72 object-cover" />
            <button
              onClick={() => {
                setPreview(null);
                setError(null);
                base44.entities.FicheEleve.update(ficheId, { photo_ee_url: null });
              }}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-destructive/90 hover:bg-destructive transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => cameraInputRef.current?.click()}
          disabled={isLoading}
          className="flex-1 gap-2"
        >
          {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          Capturer
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="flex-1 gap-2"
        >
          <Upload className="w-4 h-4" />
          Importer
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFileSelect(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleFileSelect(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}