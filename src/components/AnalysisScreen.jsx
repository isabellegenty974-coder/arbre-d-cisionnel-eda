import { useDiagnostic } from '@/lib/DiagnosticContext';
import { useNavigate } from 'react-router-dom';
import ScreenLayout from '@/components/tree/ScreenLayout';
import InfoList from '@/components/tree/InfoList';
import { Button } from '@/components/ui/button';
import { Plus, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function AnalysisScreen({ title, items, analysisType, questionId, category }) {
  const { addSelection, selections } = useDiagnostic();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleAddToDiagnostic = () => {
    addSelection(category, questionId, title, analysisType);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleSelectItems = (items) => {
    setSelectedItems(items);
  };

  const hasSelections = Object.values(selections).some(arr => arr.length > 0);

  return (
    <ScreenLayout title={title}>
      <div className="space-y-6">
        <InfoList type="hypothesis" items={items} onSelectItems={handleSelectItems} />
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4 space-y-3"
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

          {hasSelections && (
            <Button
              onClick={() => navigate('/resume')}
              variant="outline"
              className="w-full gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              Voir les recommandations
            </Button>
          )}
        </motion.div>
      </div>
    </ScreenLayout>
  );
}