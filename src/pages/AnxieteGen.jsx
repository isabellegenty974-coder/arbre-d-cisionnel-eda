import NavigationBar from '@/components/NavigationBar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function AnxieteGen() {
  const navigate = useNavigate();
  const items = [
    "Anxiété de performance",
    "Anxiété sociale",
    "Stress lié à un événement extérieur",
    "Hypersensibilité émotionnelle"
  ];

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <>
      <NavigationBar title="Anxiété généralisée – Hypothèses" />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.h2 
            className="text-3xl font-bold mb-8 text-foreground"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Anxiété généralisée – Hypothèses
          </motion.h2>

          <motion.div 
            className="bg-card border border-border rounded-xl p-8 mb-8"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.2,
                },
              },
            }}
          >
            <ul className="space-y-4">
              {items.map((item, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <span className="text-lg text-foreground leading-relaxed">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button 
              onClick={() => navigate('/ActionsAnxiete')}
              className="w-full md:w-auto px-8 py-6 text-lg"
            >
              Actions recommandées
            </Button>
          </motion.div>
        </div>
      </div>
    </>
  );
}