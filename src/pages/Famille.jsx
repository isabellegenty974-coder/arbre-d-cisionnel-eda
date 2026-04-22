import NavigationBar from '@/components/NavigationBar';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Famille() {
  const navigate = useNavigate();
  const hypotheses = [
    "Impact émotionnel sur l'élève",
    "Désorganisation temporaire",
    "Fatigue, anxiété, préoccupations"
  ];

  return (
    <>
      <NavigationBar title="Événement familial" />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-foreground">Événement familial</h2>
          </motion.div>

          <motion.div 
            className="bg-card border border-border rounded-xl p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-6 text-foreground">
              Hypothèses possibles :
            </h3>

            <div className="space-y-4 mb-8">
              {hypotheses.map((hypo, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="flex gap-4 items-start"
                >
                  <CheckCircle2 className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                  <p className="text-foreground">{hypo}</p>
                </motion.div>
              ))}
            </div>

            <Button 
              onClick={() => navigate('/ActionsFamille')}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-lg"
            >
              Actions recommandées
            </Button>
          </motion.div>
        </div>
      </div>
    </>
  );
}