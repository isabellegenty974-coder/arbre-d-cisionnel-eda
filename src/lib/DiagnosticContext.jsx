import React, { createContext, useContext, useState, useEffect } from 'react';

const DiagnosticContext = createContext();

export function DiagnosticProvider({ children }) {
  const [selections, setSelections] = useState({});
  const [eleve, setEleve] = useState(null);

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
    setSelections(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), { questionId, label, analysisType, timestamp: new Date().toISOString() }]
    }));
  };

  const clearAll = () => {
    setSelections({});
    localStorage.removeItem('diagnostic_selections');
  };

  const setCurrentEleve = (elevData) => {
    setEleve(elevData);
  };

  return (
    <DiagnosticContext.Provider value={{ selections, addSelection, clearAll, eleve, setCurrentEleve }}>
      {children}
    </DiagnosticContext.Provider>
  );
}

export function useDiagnostic() {
  return useContext(DiagnosticContext);
}