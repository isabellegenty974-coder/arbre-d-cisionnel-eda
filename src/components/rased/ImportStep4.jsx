import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Users, AlertTriangle, Calendar, School, RotateCcw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ImportStep4({ stats, ecoleId, onRestart }) {
  const navigate = useNavigate();
  const { created = 0, duplicatesIgnored = 0, missingDates = 0 } = stats || {};

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Success banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center bg-white rounded-3xl border-2 border-green-200 p-8 shadow-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-9 h-9 text-green-500" />
        </motion.div>
        <h2 className="font-bold text-2xl text-[#0F172A] mb-2">Import terminé !</h2>
        <p className="text-gray-500 text-sm">Les fiches élèves ont été créées avec succès.</p>
      </motion.div>

      {/* Counters */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-green-200 p-4 text-center">
          <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-2">
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{created}</p>
          <p className="text-[10px] text-gray-500 mt-0.5 font-medium leading-tight">Fiches créées</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-2">
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-400">{duplicatesIgnored}</p>
          <p className="text-[10px] text-gray-500 mt-0.5 font-medium leading-tight">Doublons ignorés</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className={`bg-white rounded-2xl p-4 text-center border ${missingDates > 0 ? 'border-amber-200' : 'border-gray-200'}`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2 ${missingDates > 0 ? 'bg-amber-100' : 'bg-gray-100'}`}>
            <Calendar className={`w-5 h-5 ${missingDates > 0 ? 'text-amber-500' : 'text-gray-400'}`} />
          </div>
          <p className={`text-2xl font-bold ${missingDates > 0 ? 'text-amber-500' : 'text-gray-400'}`}>{missingDates}</p>
          <p className="text-[10px] text-gray-500 mt-0.5 font-medium leading-tight">Dates manquantes</p>
        </motion.div>
      </div>

      {/* Action buttons */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Actions suivantes</p>

        {ecoleId && (
          <button
            onClick={() => navigate(`/detail-ecole?id=${ecoleId}`)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <School className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-[#0F172A] text-sm">Voir la liste de la classe</p>
              <p className="text-xs text-gray-500">Consulter les élèves importés</p>
            </div>
          </button>
        )}

        <button
          onClick={onRestart}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
            <RotateCcw className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-[#0F172A] text-sm">Importer une autre classe</p>
            <p className="text-xs text-gray-500">Recommencer avec un nouveau PDF</p>
          </div>
        </button>

        {ecoleId && (
          <button
            onClick={() => navigate(`/diagnostic-eleve`)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-[#0F172A] text-sm">Démarrer un diagnostic EDA</p>
              <p className="text-xs text-gray-500">Lancer l'arbre décisionnel</p>
            </div>
          </button>
        )}

        <button
          onClick={() => navigate('/mes-ecoles')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <School className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <p className="font-semibold text-[#0F172A] text-sm">Retour aux écoles</p>
            <p className="text-xs text-gray-500">Tableau de bord réseau RASED</p>
          </div>
        </button>
      </motion.div>
    </div>
  );
}