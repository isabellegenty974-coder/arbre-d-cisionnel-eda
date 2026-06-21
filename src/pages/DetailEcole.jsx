import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Download, AlertTriangle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddEleveModal from '@/components/rased/AddEleveModal';

const STATUS_CONFIG = {
  'Suivi actif': { color: '#16a34a', bg: '#dcfce7', label: 'Suivi actif' },
  'En attente': { color: '#d97706', bg: '#fef3c7', label: 'En attente' },
  'Nouveau': { color: '#2563eb', bg: '#dbeafe', label: 'Nouveau' },
  'Clôturé': { color: '#6b7280', bg: '#f3f4f6', label: 'Clôturé' },
};

const CLASSES_ORDER = ['TPS', 'PS', 'MS', 'GS', 'CP', 'CE1', 'CE2', 'CM1', 'CM2', 'ULIS', 'Autre'];

function isStaleEleve(eleve) {
  const d = eleve.date_derniere_action || eleve.created_date;
  if (!d) return false;
  return (Date.now() - new Date(d).getTime()) > 30 * 24 * 3600 * 1000;
}

export default function DetailEcole() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ecoleId = searchParams.get('id');
  const [ecole, setEcole] = useState(null);
  const [classes, setClasses] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeClasse, setActiveClasse] = useState(null);
  const [showAddEleve, setShowAddEleve] = useState(false);

  const load = async () => {
    if (!ecoleId) { setLoading(false); return; }
    const [ec, cls, el] = await Promise.all([
      base44.entities.EcoleRased.get(ecoleId).catch(() => null),
      base44.entities.ClasseEcole.filter({ ecole_id: ecoleId }).catch(() => []),
      base44.entities.EleveRased.filter({ ecole_id: ecoleId }).catch(() => []),
    ]);
    setEcole(ec);
    // Trier les classes
    const sorted = [...cls].sort((a, b) => {
      const ia = CLASSES_ORDER.indexOf(a.nom);
      const ib = CLASSES_ORDER.indexOf(b.nom);
      if (ia === -1 && ib === -1) return a.nom.localeCompare(b.nom);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    setClasses(sorted);
    setEleves(el);
    if (sorted.length > 0 && !activeClasse) setActiveClasse(sorted[0].id);
    setLoading(false);
  };

  useEffect(() => { load(); }, [ecoleId]);

  const elevesDeClasse = (classeId) => eleves.filter(e => e.classe_id === classeId);
  const activeClasseData = classes.find(c => c.id === activeClasse);
  const activeEleves = activeClasse ? elevesDeClasse(activeClasse) : [];

  const exportClassePDF = () => {
    const html = `
      <html><head><title>Classe ${activeClasseData?.nom} — ${ecole?.nom}</title>
      <style>body{font-family:sans-serif;padding:24px}h1{font-size:18px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px;text-align:left;font-size:12px}th{background:#f3f4f6}</style>
      </head><body>
      <h1>Classe ${activeClasseData?.nom} — ${ecole?.nom}</h1>
      <p style="color:#666;font-size:12px">Enseignant·e : ${activeClasseData?.enseignant || '—'} | Exporté le ${new Date().toLocaleDateString('fr-FR')}</p>
      <table><thead><tr><th>Nom Prénom</th><th>Date de naissance</th><th>Statut</th><th>Dernière action</th></tr></thead>
      <tbody>${activeEleves.map(e => `
        <tr>
          <td>${e.prenom} ${e.nom}</td>
          <td>${e.date_naissance ? new Date(e.date_naissance).toLocaleDateString('fr-FR') : '—'}</td>
          <td>${e.statut || '—'}</td>
          <td>${e.date_derniere_action ? new Date(e.date_derniere_action).toLocaleDateString('fr-FR') : '—'}</td>
        </tr>`).join('')}
      </tbody></table></body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.print();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
      <Loader className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );

  if (!ecole) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
      <div className="text-center">
        <p className="text-gray-500">École introuvable</p>
        <Button onClick={() => navigate('/mes-ecoles')} className="mt-4">Retour</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Header */}
      <div className="bg-[#0F172A] px-6 pt-10 pb-6">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => navigate('/mes-ecoles')} className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Mes écoles
          </button>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-white font-bold text-2xl">{ecole.nom}</h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {ecole.type && <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300">{ecole.type}</span>}
                {ecole.commune && <span className="text-white/60 text-sm">{ecole.commune}</span>}
                {ecole.nombre_classes && <span className="text-white/60 text-sm">{ecole.nombre_classes} classe{ecole.nombre_classes > 1 ? 's' : ''}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowAddEleve(true)} className="gap-2 bg-blue-500 hover:bg-blue-600 text-white border-0">
                <Plus className="w-4 h-4" /> Ajouter un élève
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Onglets classes */}
        {classes.length > 0 ? (
          <>
            <div className="flex items-center gap-2 flex-wrap mb-6">
              {classes.map(cls => (
                <button
                  key={cls.id}
                  onClick={() => setActiveClasse(cls.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeClasse === cls.id
                      ? 'bg-[#0F172A] text-white shadow'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {cls.nom}
                  <span className="ml-2 opacity-60 text-xs">({elevesDeClasse(cls.id).length})</span>
                </button>
              ))}
            </div>

            {activeClasseData && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h2 className="font-bold text-[#0F172A]">Classe {activeClasseData.nom}</h2>
                    {activeClasseData.enseignant && (
                      <p className="text-sm text-gray-500 mt-0.5">Enseignant·e : {activeClasseData.enseignant}</p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={exportClassePDF} className="gap-2">
                    <Download className="w-4 h-4" /> Exporter PDF
                  </Button>
                </div>

                {activeEleves.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-sm">Aucun élève dans cette classe</p>
                    <button onClick={() => setShowAddEleve(true)} className="mt-3 text-blue-500 text-sm hover:underline">+ Ajouter un élève</button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Nom Prénom</th>
                          <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date de naissance</th>
                          <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                          <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Dernière action</th>
                          <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {activeEleves.map(eleve => {
                          const conf = STATUS_CONFIG[eleve.statut] || STATUS_CONFIG['Nouveau'];
                          const stale = isStaleEleve(eleve);
                          return (
                            <tr key={eleve.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-[#0F172A]">{eleve.prenom} {eleve.nom}</span>
                                  {stale && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" title="Aucune mise à jour depuis +30 jours" />}
                                </div>
                              </td>
                              <td className="px-5 py-3 text-gray-600">
                                {eleve.date_naissance ? new Date(eleve.date_naissance).toLocaleDateString('fr-FR') : '—'}
                              </td>
                              <td className="px-5 py-3">
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: conf.bg, color: conf.color }}>
                                  {conf.label}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-gray-500 text-xs">
                                {eleve.date_derniere_action
                                  ? new Date(eleve.date_derniere_action).toLocaleDateString('fr-FR')
                                  : '—'}
                              </td>
                              <td className="px-5 py-3 text-right">
                                {eleve.fiche_eleve_id ? (
                                  <Button size="sm" variant="outline" onClick={() => navigate(`/detail-fiche?id=${eleve.fiche_eleve_id}`)}>
                                    Voir fiche
                                  </Button>
                                ) : (
                                  <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white border-0"
                                    onClick={() => navigate(`/fiche-eleve?prenom=${encodeURIComponent(eleve.prenom)}&nom=${encodeURIComponent(eleve.nom)}&eleve_rased_id=${eleve.id}`)}>
                                    Créer fiche
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium">Aucune classe dans cette école</p>
            <p className="text-gray-400 text-sm mt-1">Ajoutez un élève pour créer automatiquement une classe</p>
            <Button onClick={() => setShowAddEleve(true)} className="mt-4 gap-2 bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="w-4 h-4" /> Ajouter un élève
            </Button>
          </div>
        )}
      </div>

      <AddEleveModal
        open={showAddEleve}
        onClose={() => setShowAddEleve(false)}
        ecoleId={ecoleId}
        classes={classes}
        onSaved={() => { setShowAddEleve(false); load(); }}
      />
    </div>
  );
}