import NavigationBar from '@/components/NavigationBar';
import CardButton from '@/components/CardButton';
import { motion } from 'framer-motion';

export default function Apprentissage() {
  const cards = [
    { label: "Lecture", navigate: "Lecture" },
    { label: "Écriture", navigate: "Ecriture" },
    { label: "Mathématiques", navigate: "Maths" },
    { label: "Difficultés globales", navigate: "GlobalApprentissage" }
  ];

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <NavigationBar title="Difficultés d'apprentissage" />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.h2 
            className="text-3xl font-bold mb-8 text-foreground"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Difficultés d'apprentissage
          </motion.h2>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {cards.map((card, index) => (
              <motion.div key={index} variants={itemVariants}>
                <CardButton label={card.label} navigate={card.navigate} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
}