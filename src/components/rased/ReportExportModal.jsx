import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { generateReport, downloadReport } from '@/lib/reportGenerator';

export default function ReportExportModal({ isOpen, onClose, eleve, user, reportType = 'synthese' }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    motif: '',
    observations: '',
    hypotheses: [],
    actions: [],
    suites: ''
  });

  const handleHypothesesChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      hypotheses: value.split('\n').filter(h => h.trim())
    }));
  };

  const handleActionsChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      actions: value.split('\n').filter(a => a.trim())
    }));
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const doc = await generateReport({
        type: reportType,
        eleve,
        ...formData
      }, user);
      
      const filename = `Rapport_${eleve.prenom}_${eleve.nom}_${new Date().toISOString().split('T')[0]}.pdf`;
      downloadReport(doc, filename);
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      alert('Erreur lors de la génération du rapport');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 300 }}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed',
              inset: '50% auto auto 50%',
              transform: 'translate(-50%, -50%)',
              background: '#fff',
              borderRadius: 12,
              width: '90%',
              maxWidth: 600,
              maxHeight: '90vh',
              overflow: 'auto',
              zIndex: 301,
              boxShadow: '0 20px 50px rgba(0,0,0,.3)'
            }}
          >
            {/* En-tête */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid #D8E1EE'
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#182840', margin: 0 }}>
                📄 Générer un rapport
              </h2>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex'
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu */}
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: 12, color: '#566880', marginBottom: 16 }}>
                Remplissez les informations ci-dessous pour générer le rapport de <strong>{eleve.prenom} {eleve.nom}</strong>.
                Votre nom et rôle seront automatiquement renseignés.
              </p>

              {/* Motif */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#182840', marginBottom: 6 }}>
                  Motif du signalement
                </label>
                <textarea
                  value={formData.motif}
                  onChange={(e) => setFormData(prev => ({ ...prev, motif: e.target.value }))}
                  placeholder="Décrivez le motif du signalement..."
                  style={{
                    width: '100%',
                    minHeight: 80,
                    padding: '10px 12px',
                    fontSize: 13,
                    border: '1px solid #D8E1EE',
                    borderRadius: 8,
                    fontFamily: 'Arial, sans-serif',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Observations */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#182840', marginBottom: 6 }}>
                  Observations
                </label>
                <textarea
                  value={formData.observations}
                  onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                  placeholder="Résumez vos observations..."
                  style={{
                    width: '100%',
                    minHeight: 80,
                    padding: '10px 12px',
                    fontSize: 13,
                    border: '1px solid #D8E1EE',
                    borderRadius: 8,
                    fontFamily: 'Arial, sans-serif',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Hypothèses */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#182840', marginBottom: 6 }}>
                  Hypothèses formulées <span style={{ fontSize: 11, color: '#94A3B8' }}>(une par ligne)</span>
                </label>
                <textarea
                  value={formData.hypotheses.join('\n')}
                  onChange={handleHypothesesChange}
                  placeholder="Hypothèse 1&#10;Hypothèse 2&#10;..."
                  style={{
                    width: '100%',
                    minHeight: 80,
                    padding: '10px 12px',
                    fontSize: 13,
                    border: '1px solid #D8E1EE',
                    borderRadius: 8,
                    fontFamily: 'Arial, sans-serif',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#182840', marginBottom: 6 }}>
                  Recommandations et actions <span style={{ fontSize: 11, color: '#94A3B8' }}>(une par ligne)</span>
                </label>
                <textarea
                  value={formData.actions.join('\n')}
                  onChange={handleActionsChange}
                  placeholder="Action 1&#10;Action 2&#10;..."
                  style={{
                    width: '100%',
                    minHeight: 80,
                    padding: '10px 12px',
                    fontSize: 13,
                    border: '1px solid #D8E1EE',
                    borderRadius: 8,
                    fontFamily: 'Arial, sans-serif',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Suites */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#182840', marginBottom: 6 }}>
                  Suites envisagées
                </label>
                <textarea
                  value={formData.suites}
                  onChange={(e) => setFormData(prev => ({ ...prev, suites: e.target.value }))}
                  placeholder="Décrivez les suites envisagées..."
                  style={{
                    width: '100%',
                    minHeight: 80,
                    padding: '10px 12px',
                    fontSize: 13,
                    border: '1px solid #D8E1EE',
                    borderRadius: 8,
                    fontFamily: 'Arial, sans-serif',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Boutons */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  onClick={onClose}
                  disabled={loading}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 8,
                    border: '1px solid #D8E1EE',
                    background: 'transparent',
                    color: '#182840',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleExport}
                  disabled={loading}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 8,
                    border: 'none',
                    background: loading ? '#9CA3AF' : '#3B82C4',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {loading ? '⏳ Génération...' : '✓ Générer le PDF'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}