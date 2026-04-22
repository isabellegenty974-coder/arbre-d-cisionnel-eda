import NavigationBar from '@/components/NavigationBar';
import { motion } from 'framer-motion';

export default function LectureRecente() {
  return (
    <>
      <NavigationBar title="Lecture – Difficulté récente" />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-foreground">Lecture – Difficulté récente</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-8"
          >
            <p className="text-lg text-muted-foreground">
              Vérifier les éléments contextuels : changement récent, événement familial, santé, environnement scolaire.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}