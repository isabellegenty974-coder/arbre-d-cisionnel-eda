import NavigationBar from '@/components/NavigationBar';
import CardButton from '@/components/CardButton';
import { motion } from 'framer-motion';

export default function LectureInstallee() {
  const cards = [
    { label: "Hypothèses possibles", navigate: "HypoLecture" },
    { label: "Actions recommandées", navigate: "ActionsLecture" }
  ];

  return (
    <>
      <NavigationBar title="Lecture – Difficulté installée" />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold mb-4 text-foreground">Lecture – Difficulté installée</h2>
            <p className="text-lg text-muted-foreground">Plusieurs hypothèses peuvent être envisagées.</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.2,
                },
              },
            }}
          >
            {cards.map((card, index) => (
              <motion.div 
                key={index} 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <CardButton label={card.label} navigate={card.navigate} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
}