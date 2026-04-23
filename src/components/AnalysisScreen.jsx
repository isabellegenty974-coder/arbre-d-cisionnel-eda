import { useDiagnostic } from '@/lib/DiagnosticContext';
import ScreenLayout from '@/components/tree/ScreenLayout';
import InfoList from '@/components/tree/InfoList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function AnalysisScreen({ title, items, analysisType, questionId, category }) {
  const { addSelection } = useDiagnostic();
  const [added, setAdded] = useState(false);

  const handleAddToDiagnostic = () => {
    addSelection(category, questionId, title, analysisType);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <ScreenLayout title={title}>
      <div className="space-y-6">
        <InfoList type="hypothesis" items={items} />
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4"
        >
          <Button
            onClick={handleAddToDiagnostic}
            className={`w-full gap-2 transition-all ${
              added
                ? 'bg-chart-2 hover:bg-chart-2/90'
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            <Plus className="w-4 h-4" />
            {added ? '✓ Ajouté au diagnostic' : 'Ajouter au diagnostic'}
          </Button>
        </motion.div>
      </div>
    </ScreenLayout>
  );
}