import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ImportElevesPDF from '@/components/rased/ImportElevesPDF';

export default function ImportPDF() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ecoleId = searchParams.get('ecoleId');

  const handleDone = () => {
    if (ecoleId) {
      navigate(`/detail-ecole?id=${ecoleId}`);
    } else {
      navigate('/mes-ecoles');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F0F3F8', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1A3353', padding: '20px 24px 18px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <button
            onClick={() => ecoleId ? navigate(`/detail-ecole?id=${ecoleId}`) : navigate('/mes-ecoles')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,.6)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginBottom: 12 }}
          >
            <ArrowLeft size={16} /> Retour
          </button>
          <h1 style={{ color: '#fff', fontSize: 21, fontWeight: 700, margin: 0 }}>Import PDF</h1>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, marginTop: 4 }}>
            Importez une liste de classe depuis Onde ou Base Élèves
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 20px 60px' }}>
        <ImportElevesPDF onDone={handleDone} />
      </div>
    </div>
  );
}