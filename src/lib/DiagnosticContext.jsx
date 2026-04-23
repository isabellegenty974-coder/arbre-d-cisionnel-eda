import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLinkedQuestions } from './crossDiagnosticLinks';

const DiagnosticContext = createContext();

export function DiagnosticProvider({ children }) {
  const [selections, setSelections] = useState({});
  const [eleve, setEleve] = useState(null);
  const [crossRecommendations, setCrossRecommendations] = useState({});

  // Charger depuis localStorage au montage
  useEffect(() => {
    const saved = localStorage.getItem('diagnostic_selections');
    const savedEleve = localStorage.getItem('current_eleve');
    if (saved) setSelections(JSON.parse(saved));
    if (savedEleve) setEleve(JSON.parse(savedEleve));
  }, []);

  // Sauvegarder à chaque changement
  useEffect(() => {
    localStorage.setItem('diagnostic_selections', JSON.stringify(selections));
  }, [selections]);

  useEffect(() => {
    localStorage.setItem('current_eleve', JSON.stringify(eleve));
  }, [eleve]);

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
    <DiagnosticContext.Provider value={{ selections, addSelection, clearAll, eleve, setCurrentEleve, crossRecommendations }}>
      {children}
    </DiagnosticContext.Provider>
  );
}

export function useDiagnostic() {
  return useContext(DiagnosticContext);
}