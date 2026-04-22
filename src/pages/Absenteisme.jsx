import NavigationBar from '@/components/NavigationBar';
import { motion } from 'framer-motion';

export default function Absenteisme() {
  return (
    <>
      <NavigationBar title="Absentéisme" />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold mb-4 text-foreground">Absentéisme</h2>
            <p className="text-lg text-muted-foreground">
              Analyser l'impact de l'absentéisme sur les apprentissages.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}