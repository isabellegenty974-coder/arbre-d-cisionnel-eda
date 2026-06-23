import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Trash2, FileText, Upload } from 'lucide-react';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export default function DocumentsSection({ ficheId }) {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const loadDocuments = async () => {
    try {
      const fiche = await base44.entities.FicheEleve.get(ficheId);
      setDocuments(fiche.documents || []);
    } catch (e) {
      console.error('Erreur chargement documents:', e);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [ficheId]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const newDocs = [];
      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
          setError(`${file.name} dépasse 20 Mo.`);
          continue;
        }

        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        newDocs.push({
          name: file.name,
          url: file_url,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        });
      }

      if (newDocs.length > 0) {
        const updated = [...documents, ...newDocs];
        await base44.entities.FicheEleve.update(ficheId, { documents: updated });
        setDocuments(updated);
      }
    } catch (e) {
      console.error('Erreur upload document:', e);
      setError('Erreur lors de l\'upload. Réessayez.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const deleteDocument = async (idx) => {
    if (!confirm('Supprimer ce document ?')) return;
    const updated = documents.filter((_, i) => i !== idx);
    await base44.entities.FicheEleve.update(ficheId, { documents: updated });
    setDocuments(updated);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return '📄';
    if (['jpg', 'jpeg', 'png', 'heic', 'gif'].includes(ext)) return '🖼️';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['xls', 'xlsx'].includes(ext)) return '📊';
    if (['ppt', 'pptx'].includes(ext)) return '🎯';
    if (['txt', 'rtf'].includes(ext)) return '📋';
    return '📎';
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#182840', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        📎 Documents
      </h3>

      {error && (
        <div style={{ background: '#FEF0E4', border: '1px solid #B85C1A', borderRadius: 10, padding: '12px 14px', marginBottom: 14, fontSize: 12.5, color: '#B85C1A', fontWeight: 500, display: 'flex', gap: 8 }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Zone d'upload */}
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed #3B82C4',
          borderRadius: 12,
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: '#EAF2FB',
          marginBottom: 14,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#1A3353';
          e.currentTarget.style.background = '#D6E8F7';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#3B82C4';
          e.currentTarget.style.background = '#EAF2FB';
        }}
      >
        <Upload size={24} style={{ color: '#3B82C4', marginBottom: 8, margin: '0 auto 8px' }} />
        <div style={{ fontSize: 13, fontWeight: 600, color: '#182840', marginBottom: 4 }}>
          Importer un document
        </div>
        <div style={{ fontSize: 12, color: '#566880', marginBottom: 8 }}>
          Tous types de fichiers acceptés
          <br />
          (PDF, images, Word, Excel...)
        </div>
        <div style={{ fontSize: 11, color: '#94A3B8' }}>
          Maximum 20 Mo par fichier
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        disabled={uploading}
        style={{ display: 'none' }}
      />

      {/* Liste des documents */}
      {documents.length === 0 ? (
        <p style={{ fontSize: 12.5, color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
          Aucun document pour le moment
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {documents.map((doc, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px',
                background: '#FAFBFD',
                border: '1px solid #D8E1EE',
                borderRadius: 10,
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>
                {getFileIcon(doc.name)}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#3B82C4',
                    textDecoration: 'none',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block',
                    whiteSpace: 'nowrap',
                  }}
                  title={doc.name}
                >
                  {doc.name}
                </a>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                  {formatFileSize(doc.size)}
                  {doc.uploadedAt && (
                    <>
                      {' · '}
                      {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteDocument(idx)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  padding: 4,
                  flexShrink: 0,
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}