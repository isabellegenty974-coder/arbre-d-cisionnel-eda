import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Plus, Download, AlertTriangle, Loader, FileText,
  Phone, Mail, User, MapPin, Pencil, School, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddEleveModal from '@/components/rased/AddEleveModal';
import AddEcoleModal from '@/components/rased/AddEcoleModal';

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
  const defaultClasse = searchParams.get('classe');

  const [ecole, setEcole] = useState(null);
  const [classes, setClasses] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeClasse, setActiveClasse] = useState(null);
  const [showAddEleve, setShowAddEleve] = useState(false);
  const [showEditEcole, setShowEditEcole] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    if (!ecoleId) { setLoading(false); return; }
    const [ec, cls, el, mb] = await Promise.all([
      base44.entities.EcoleRased.get(ecoleId).catch(() => null),
      base44.entities.ClasseEcole.filter({ ecole_id: ecoleId }).catch(() => []),
      base44.entities.EleveRased.filter({ ecole_id: ecoleId }).catch(() => []),
      base44.entities.MembreEquipe.list('-created_date', 100).catch(() => []),
    ]);
    setEcole(ec);
    setMembres(mb);
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
    if (defaultClasse) {
      const found = sorted.find(c => c.nom.toLowerCase() === defaultClasse.toLowerCase());
      if (found) setActiveClasse(found.id);
      else if (sorted.length > 0) setActiveClasse(sorted[0].id);
    } else if (sorted.length > 0 && !activeClasse) {
      setActiveClasse(sorted[0].id);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [ecoleId]);

  const handleDeleteEcole = async () => {
    setDeleting(true);
    try {
      await base44.entities.EleveRased.deleteMany({ ecole_id: ecoleId }).catch(() => {});
      await base44.entities.ClasseEcole.deleteMany({ ecole_id: ecoleId }).catch(() => {});
      await base44.entities.EcoleRased.delete(ecoleId);
      navigate('/mes-ecoles');
    } catch (error) {
      console.error('Erreur suppression école:', error);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

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
        <tr><td>${e.prenom} ${e.nom}</td>
        <td>${e.date_naissance ? new Date(e.date_naissance).toLocaleDateString('fr-FR') : '—'}</td>
        <td>${e.statut || '—'}</td>
        <td>${e.date_derniere_action ? new Date(e.date_derniere_action).toLocaleDateString('fr-FR') : '—'}</td></tr>`).join('')}
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
      {/* Header dark */}
      <div className="bg-[#0F172A] px-6 pt-10 pb-6">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => navigate('/mes-ecoles')} className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Mes écoles
          </button>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-white font-bold text-2xl">{ecole.nom}</h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {ecole.type && <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300">{ecole.type}</span>}
                {ecole.commune && <span className="text-white/60 text-sm">{ecole.commune}</span>}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => navigate(`/import-pdf?ecoleId=${ecoleId}`)} variant="outline" className="gap-2 border-white/20 text-white/80 hover:bg-white/10 bg-transparent">
                <FileText className="w-4 h-4" /> Importer liste PDF
              </Button>
              <Button onClick={() => setShowAddEleve(true)} className="gap-2 bg-blue-500 hover:bg-blue-600 text-white border-0">
                <Plus className="w-4 h-4" /> Ajouter un élève
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 pb-32 space-y-6">
        {/* Fiche école récapitulative */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <School className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="font-bold text-[#0F172A]">Fiche école</h2>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowEditEcole(true)} className="gap-1.5">
                <Pencil className="w-3.5 h-3.5" /> Modifier
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(true)} className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5" /> Supprimer
              </Button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
            {ecole.directeur && (
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Direction</p>
                  <p className="text-sm text-gray-800 font-medium">{ecole.directeur}</p>
                </div>
              </div>
            )}
            {ecole.telephone && (
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Téléphone</p>
                  <a href={`tel:${ecole.telephone}`} className="text-sm text-blue-600 hover:underline font-medium">{ecole.telephone}</a>
                </div>
              </div>
            )}
            {ecole.email && (
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</p>
                  <a href={`mailto:${ecole.email}`} className="text-sm text-blue-600 hover:underline font-medium break-all">{ecole.email}</a>
                </div>
              </div>
            )}
            {ecole.adresse && (
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Adresse</p>
                  <p className="text-sm text-gray-800">{ecole.adresse}</p>
                </div>
              </div>
            )}
          </div>

          {/* Membres RASED affectés */}
          {ecole.membres_rased?.length > 0 && membres.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Membres RASED affectés</p>
              <div className="flex flex-wrap gap-2">
                {ecole.membres_rased.map(mid => {
                  const m = membres.find(mb => mb.id === mid);
                  if (!m) return null;
                  return (
                    <span key={mid} className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100">
                      {m.prenom} {m.nom} · {m.profession}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Placeholder si aucune info */}
          {!ecole.directeur && !ecole.telephone && !ecole.email && !ecole.adresse && (
            <div className="text-center py-3">
              <p className="text-sm text-gray-400">Aucune information de contact renseignée.</p>
              <button onClick={() => setShowEditEcole(true)} className="text-blue-500 text-sm hover:underline mt-1">+ Compléter la fiche école</button>
            </div>
          )}
        </motion.div>

        {/* Onglets classes */}
        {classes.length > 0 ? (
          <>
            <div className="flex items-center gap-2 flex-wrap">
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
                    <p className="text-xs text-gray-400 mt-0.5">{activeEleves.length} élève{activeEleves.length > 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={exportClassePDF} className="gap-2">
                      <Download className="w-4 h-4" /> Exporter PDF
                    </Button>
                  </div>
                </div>

                {activeEleves.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 space-y-3">
                    <p className="text-sm font-medium text-gray-500">Aucun élève importé dans cette classe</p>
                    <button
                      onClick={() => navigate(`/import-pdf?ecoleId=${ecoleId}`)}
                      className="inline-flex items-center gap-2 text-blue-500 text-sm hover:underline font-medium"
                    >
                      <FileText className="w-4 h-4" /> Importer une liste PDF
                    </button>
                    <span className="text-gray-300 mx-2">ou</span>
                    <button onClick={() => setShowAddEleve(true)} className="text-blue-500 text-sm hover:underline">Ajouter un élève manuellement</button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Nom</th>
                          <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Prénom</th>
                          <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date de naissance</th>
                          <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Statut suivi</th>
                          <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {activeEleves.map(eleve => {
                          const conf = STATUS_CONFIG[eleve.statut] || STATUS_CONFIG['Nouveau'];
                          const stale = isStaleEleve(eleve);
                          return (
                            <tr key={eleve.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-5 py-3 font-semibold text-[#0F172A]">
                                <div className="flex items-center gap-2">
                                  {eleve.nom}
                                  {stale && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" title="Aucune mise à jour depuis +30 jours" />}
                                </div>
                              </td>
                              <td className="px-5 py-3 text-gray-700">{eleve.prenom}</td>
                              <td className="px-5 py-3 text-gray-600">
                                {eleve.date_naissance ? new Date(eleve.date_naissance).toLocaleDateString('fr-FR') : '—'}
                              </td>
                              <td className="px-5 py-3">
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: conf.bg, color: conf.color }}>
                                  {conf.label}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-right">
                                {eleve.fiche_eleve_id ? (
                                  <Button size="sm" variant="outline" onClick={() => navigate(`/detail-fiche?id=${eleve.fiche_eleve_id}`)}>
                                    Voir fiche
                                  </Button>
                                ) : (
                                  <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white border-0"
                                    onClick={() => navigate(`/fiche-eleve?prenom=${encodeURIComponent(eleve.prenom)}&nom=${encodeURIComponent(eleve.nom)}&classe=${encodeURIComponent(activeClasseData.nom)}&ecole=${encodeURIComponent(ecole.nom)}&date_naissance=${encodeURIComponent(eleve.date_naissance || '')}&enseignant=${encodeURIComponent(activeClasseData.enseignant || '')}&eleve_rased_id=${eleve.id}`)}>
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
            <p className="text-gray-400 text-sm mt-1">Importez une liste PDF ou ajoutez un élève manuellement</p>
            <div className="flex justify-center gap-3 mt-4 flex-wrap">
              <Button onClick={() => navigate(`/import-pdf?ecoleId=${ecoleId}`)} variant="outline" className="gap-2 border-blue-300 text-blue-600 hover:bg-blue-50">
                <FileText className="w-4 h-4" /> Importer liste PDF
              </Button>
              <Button onClick={() => setShowAddEleve(true)} className="gap-2 bg-blue-500 hover:bg-blue-600 text-white border-0">
                <Plus className="w-4 h-4" /> Ajouter un élève
              </Button>
            </div>
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

      <AddEcoleModal
        open={showEditEcole}
        onClose={() => setShowEditEcole(false)}
        membres={membres}
        ecole={ecole}
        onSaved={() => { setShowEditEcole(false); load(); }}
      />

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !deleting && setShowDeleteConfirm(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-sm w-full text-center"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Supprimer cette école ?</h3>
            <p className="text-sm text-gray-500 mb-1">
              <strong>{ecole.nom}</strong> sera supprimée définitivement.
            </p>
            <p className="text-xs text-gray-400 mb-6">
              Les {classes.length} classe{classes.length > 1 ? 's' : ''} et {eleves.length} élève{eleves.length > 1 ? 's' : ''} associé{eleves.length > 1 ? 's' : ''} seront également supprimés.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                Annuler
              </Button>
              <Button onClick={handleDeleteEcole} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white border-0 gap-1.5">
                {deleting ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? 'Suppression…' : 'Supprimer'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}