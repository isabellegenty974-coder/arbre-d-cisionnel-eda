import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLinkedQuestions } from './crossDiagnosticLinks';
import { base44 } from '@/api/base44Client';

const DiagnosticContext = createContext();

export function DiagnosticProvider({ children }) {
  const [selections, setSelections] = useState({});
  const [eleve, setEleve] = useState(null);
  const [crossRecommendations, setCrossRecommendations] = useState({});
  const [currentDiagnosticId, setCurrentDiagnosticId] = useState(null);

  // Charger depuis localStorage au montage
  useEffect(() => {
    const saved = localStorage.getItem('diagnostic_selections');
    const savedEleve = localStorage.getItem('current_eleve');
    const savedId = localStorage.getItem('current_diagnostic_id');
    if (saved) setSelections(JSON.parse(saved));
    if (savedEleve) setEleve(JSON.parse(savedEleve));
    if (savedId) setCurrentDiagnosticId(savedId);
  }, []);

  // Sauvegarder à chaque changement
  useEffect(() => {
    localStorage.setItem('diagnostic_selections', JSON.stringify(selections));
    saveDiagnosticToDB();
  }, [selections]);

  useEffect(() => {
    localStorage.setItem('current_eleve', JSON.stringify(eleve));
  }, [eleve]);

  const saveDiagnosticToDB = async () => {
    if (!eleve?.prenom || !eleve?.nom) return;
    try {
      if (currentDiagnosticId) {
        await base44.entities.Diagnostic.update(currentDiagnosticId, {
          selections,
          eleve_prenom: eleve.prenom,
          eleve_nom: eleve.nom,
          eleve_age: eleve.age,
          eleve_classe: eleve.classe,
          statut: 'en_cours'
        });
      } else {
        const result = await base44.entities.Diagnostic.create({
          selections,
          eleve_prenom: eleve.prenom,
          eleve_nom: eleve.nom,
          eleve_age: eleve.age,
          eleve_classe: eleve.classe,
          statut: 'en_cours'
        });
        setCurrentDiagnosticId(result.id);
        localStorage.setItem('current_diagnostic_id', result.id);
      }
    } catch (error) {
      console.error('Erreur sauvegarde BD:', error);
    }
  };

  const addSelection = (category, questionId, label, analysisType) => {
    setSelections(prev => {
      const updated = {
        ...prev,
        [category]: [...(prev[category] || []), { questionId, label, analysisType, timestamp: new Date().toISOString() }]
      };
      
      // Calculer les recommandations croisées
      const allQuestions = Object.values(updated).flatMap(arr => arr.map(item => item.questionId));
      const linkedQuestions = getLinkedQuestions(allQuestions);
      setCrossRecommendations(linkedQuestions);
      
      return updated;
    });
  };

  const clearAll = () => {
    setSelections({});
    localStorage.removeItem('diagnostic_selections');
  };

  const setCurrentEleve = (elevData) => {
    setEleve(elevData);
  };

  return (
    <DiagnosticContext.Provider value={{ selections, addSelection, clearAll, eleve, setCurrentEleve, crossRecommendations, currentDiagnosticId }}>
      {children}
    </DiagnosticContext.Provider>
  );
}

export function useDiagnostic() {
  return useContext(DiagnosticContext);
}