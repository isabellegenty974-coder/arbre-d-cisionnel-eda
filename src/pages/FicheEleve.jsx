import { useDiagnostic } from '@/lib/DiagnosticContext';
import { useNavigate } from 'react-router-dom';
import ScreenLayout from '@/components/tree/ScreenLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';

export default function FicheEleve() {
  const { eleve, setCurrentEleve, selections, addSelection } = useDiagnostic();
  const navigate = useNavigate();

  const handleEleveChange = (field, value) => {
    setCurrentEleve({ ...eleve, [field]: value });
  };

  const handleRemoveSelection = (category, index) => {
    // Créer une nouvelle liste sans l'élément
    const updated = {
      ...selections,
      [category]: selections[category].filter((_, i) => i !== index)
    };
    // Mettre à jour via le contexte (impossible directement, donc on utilise addSelection)
    // Pour l'instant, on va juste afficher un message
    alert('Fonctionnalité de suppression à implémenter');
  };

  return (
    <div className="min-h-screen bg-background">
      <HamburgerMenu />
      <ScreenLayout title="👤 Fiche élève">
        <div className="space-y-8">
          {/* Infos élève */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-primary/5 border-2 border-primary/20"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Informations de l'élève</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Prénom</label>
                <Input
                  value={eleve?.prenom || ''}
                  onChange={(e) => handleEleveChange('prenom', e.target.value)}
                  placeholder="Prénom"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Nom</label>
                <Input
                  value={eleve?.nom || ''}
                  onChange={(e) => handleEleveChange('nom', e.target.value)}
                  placeholder="Nom"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Âge</label>
                <Input
                  type="number"
                  value={eleve?.age || ''}
                  onChange={(e) => handleEleveChange('age', e.target.value)}
                  placeholder="Âge"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Classe</label>
                <Input
                  value={eleve?.classe || ''}
                  onChange={(e) => handleEleveChange('classe', e.target.value)}
                  placeholder="Ex: CM2"
                />
              </div>
            </div>
          </motion.div>

          {/* Hypothèses sélectionnées */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Hypothèses diagnostiques sélectionnées</h2>
            
            {Object.values(selections).some(arr => arr.length > 0) ? (
              <div className="space-y-4">
                <AnimatePresence>
                  {Object.entries(selections).map(([category, items]) =>
                    items.length > 0 && (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-5 rounded-xl bg-card border border-border"
                      >
                        <h3 className="font-semibold text-foreground capitalize mb-3">{category}</h3>
                        <div className="space-y-2">
                          {items.map((item, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-all group"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{item.label}</p>
                                {item.analysisType && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Analyse: {item.analysisType}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {new Date(item.timestamp).toLocaleDateString('fr-FR')} à {new Date(item.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              <button
                                onClick={() => handleRemoveSelection(category, idx)}
                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="p-6 rounded-lg bg-secondary/30 border border-secondary text-center">
                <p className="text-muted-foreground">Aucune hypothèse sélectionnée</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Sélectionnez des hypothèses dans l'arbre pour les voir apparaître ici
                </p>
              </div>
            )}
          </motion.div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => navigate('/apprentissage')}
              className="gap-2 bg-primary hover:bg-primary/90"
              >
              <Plus className="w-4 h-4" />
              Explorer les hypothèses
              </Button>
          </div>
        </div>
      </ScreenLayout>
    </div>
  );
}