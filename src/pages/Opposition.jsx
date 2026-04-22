import NavigationBar from '@/components/NavigationBar';
import { motion } from 'framer-motion';

export default function Opposition() {
  return (
    <>
      <NavigationBar title="Opposition" />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold mb-4 text-foreground">Difficultés d'opposition</h2>
            <p className="text-lg text-muted-foreground">
              Analyser les comportements d'opposition.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}