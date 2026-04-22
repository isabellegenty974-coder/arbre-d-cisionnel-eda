import NavigationBar from '@/components/NavigationBar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Famille() {
  const navigate = useNavigate();
  const items = [
    "Impact émotionnel sur l'élève",
    "Désorganisation temporaire",
    "Fatigue, anxiété, préoccupations"
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <>
      <NavigationBar title="Événement familial" />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.h2 
            className="text-3xl font-bold mb-8 text-foreground"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Événement familial
          </motion.h2>

          <motion.div
            className="bg-card border border-border rounded-xl p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-lg text-muted-foreground mb-6 font-semibold">Hypothèses possibles :</p>
            <motion.ul
              className="space-y-4 mb-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {items.map((item, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className="flex items-start gap-3 text-lg text-foreground"
                >
                  <span className="text-primary font-semibold mt-1">•</span>
                  <span>{item}</span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              className="pt-6 border-t border-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={() => navigate('/ActionsFamille')}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Actions recommandées
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}