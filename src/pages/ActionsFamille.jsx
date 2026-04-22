import NavigationBar from '@/components/NavigationBar';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function ActionsFamille() {
  const actions = [
    "Entretien famille (écoute, repérage des besoins)",
    "Échanges avec l'enseignant",
    "Aménagements temporaires",
    "Suivi psychologique si nécessaire"
  ];

  return (
    <>
      <NavigationBar title="Actions recommandées – Contexte familial" />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-foreground">Actions recommandées – Contexte familial</h2>
          </motion.div>

          <motion.div 
            className="bg-card border border-border rounded-xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="space-y-4">
              {actions.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="flex gap-4 items-start p-4 rounded-lg bg-background hover:bg-secondary/5 transition-colors"
                >
                  <ArrowRight className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                  <p className="text-foreground">{action}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}