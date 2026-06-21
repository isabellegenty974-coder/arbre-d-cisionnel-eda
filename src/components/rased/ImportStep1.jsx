import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Scan, Database, File } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FORMAT_CARDS = [
  {
    icon: '🌊',
    title: 'Export Onde',
    desc: 'Liste exportée depuis l\'application Onde (SIEP)',
    color: '#dbeafe',
    border: '#93c5fd',
  },
  {
    icon: '📋',
    title: 'Liste école / Base élèves',
    desc: 'Document officiel fourni par l\'école ou extrait de Base Élèves',
    color: '#dcfce7',
    border: '#86efac',
  },
  {
    icon: '📄',
    title: 'Document scanné (OCR)',
    desc: 'Photo ou scan d\'une liste papier — reconnaissance optique automatique',
    color: '#fef3c7',
    border: '#fcd34d',
  },
];

export default function ImportStep1({ onFileSelected }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (f && (f.type === 'application/pdf' || f.name.endsWith('.pdf'))) {
      onFileSelected(f);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    handleFile(f);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
          dragging
            ? 'border-blue-500 bg-blue-50 scale-[1.01]'
            : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/40'
        }`}
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${dragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
          <Upload className={`w-8 h-8 transition-all ${dragging ? 'text-blue-500' : 'text-gray-400'}`} />
        </div>
        <div className="text-center">
          <p className="font-bold text-[#0F172A] text-lg">{dragging ? 'Déposez le fichier ici' : 'Déposez votre PDF ici'}</p>
          <p className="text-gray-500 text-sm mt-1">ou cliquez pour choisir un fichier</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
          onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
        >
          <File className="w-4 h-4" /> Choisir un fichier PDF
        </Button>
        <p className="text-xs text-gray-400">Fichiers PDF uniquement · Taille max recommandée : 10 Mo</p>
        <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
      </div>

      {/* Format cards */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Formats compatibles</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {FORMAT_CARDS.map(card => (
            <div
              key={card.title}
              className="rounded-2xl border p-4 flex flex-col gap-2"
              style={{ background: card.color, borderColor: card.border }}
            >
              <span className="text-2xl">{card.icon}</span>
              <p className="font-bold text-[#0F172A] text-sm">{card.title}</p>
              <p className="text-xs text-gray-600 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}