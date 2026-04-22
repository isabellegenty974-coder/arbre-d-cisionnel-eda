import NavigationBar from '@/components/NavigationBar';
import OptionButton from '@/components/OptionButton';
import { motion } from 'framer-motion';

export default function Lecture() {
  return (
    <>
      <NavigationBar title="Lecture – Analyse" />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-2 text-foreground">Lecture – Analyse</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-8 mb-8"
          >
            <h3 className="text-xl font-semibold mb-6 text-foreground">
              Les difficultés sont-elles récentes ou installées ?
            </h3>

            <div className="space-y-3">
              <OptionButton label="Récentes" navigate="LectureRecente" />
              <OptionButton label="Installées" navigate="LectureInstallee" />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}