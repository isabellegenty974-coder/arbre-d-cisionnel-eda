import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function WelcomeModal({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8 sm:p-10">
          {/* Header */}
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Bienvenue dans l'équipe RASED de La Possession ! 👋
          </h1>
          <p className="text-muted-foreground mb-8">
            Outil de suivi collaboratif de l&apos;équipe RASED · Circonscription de La Possession · La Réunion
          </p>

          {/* Features */}
          <div className="space-y-6 mb-10">
            <div className="flex gap-4">
              <div className="text-2xl">📋</div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Suivre les élèves</h3>
                <p className="text-sm text-muted-foreground">
                  Consultez et mettez à jour les fiches de suivi des élèves par école et par classe.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-2xl">💬</div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Partager vos observations</h3>
                <p className="text-sm text-muted-foreground">
                  Ajoutez vos notes et observations sur les fiches élèves, visibles par toute l'équipe en temps réel.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-2xl">🔍</div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Outil d'aide aux hypothèses de travail</h3>
                <p className="text-sm text-muted-foreground">
                  Chaque membre de l'équipe peut utiliser l'outil d'aide à la formulation d'hypothèses de travail, accessible depuis la fiche de chaque élève suivi.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-2xl">📄</div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Générer des rapports</h3>
                <p className="text-sm text-muted-foreground">
                  Produisez des comptes-rendus officiels signés de votre nom et de votre rôle.
                </p>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              ⚙️ Avant de commencer
            </h4>
            <p className="text-sm text-blue-800">
              Rendez-vous dans <strong>Paramètres</strong> pour vérifier votre nom, prénom et rôle afin qu'ils apparaissent correctement sur vos rapports et notes de suivi.
            </p>
          </div>

          {/* Roles Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-8">
            <h4 className="font-semibold text-foreground mb-3">Votre rôle dans l'équipe :</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>· Psychologue de l'Éducation Nationale · Spécialité EDA</li>
              <li>· Maître à Dominante Relationnelle (MaDR)</li>
              <li>· Maître à Dominante Pédagogique (MaDP)</li>
            </ul>
          </div>

          {/* Action Button */}
          <Button
            onClick={onClose}
            className="w-full h-10 text-base font-semibold"
          >
            Accéder à l'application →
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}