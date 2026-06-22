import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Save, CheckCircle2, Loader } from 'lucide-react';

/**
 * Bouton réutilisable pour enregistrer un diagnostic dans la fiche élève.
 * Props :
 *   ficheId     - ID de la FicheEleve (string)
 *   prenomEleve - prénom affiché dans le bouton
 *   domaine     - ex: "comportement"
 *   sousDomaine - ex: "anxiété"
 *   hypotheses  - string[]
 *   actions     - string[]
 */
export default function SaveDiagnosticButton({ ficheId, prenomEleve, domaine, sousDomaine, hypotheses = [], actions = [] }) {
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error

  if (!ficheId) return null;

  const handleSave = async () => {
    setStatus('saving');
    try {
      const today = new Date().toISOString().split('T')[0];

      // 1. Créer l'entrée HistoriqueEDA
      await base44.entities.HistoriqueEDA.create({
        eleve_id: ficheId,
        date: today,
        domaine,
        sous_domaine: sousDomaine,
        hypotheses,
        recommandations: actions,
      });

      // 2. Ajouter une intervention dans FicheEleve
      const fiche = await base44.entities.FicheEleve.get(ficheId);
      const interventions = fiche.interventions || [];
      interventions.push({
        date: today,
        profession: fiche.createdByProfession || 'RASED',
        description: `[${domaine}${sousDomaine ? ' / ' + sousDomaine : ''}] ${hypotheses.slice(0, 2).join(', ')}`,
        type_intervention: 'Arbre EDA',
      });
      await base44.entities.FicheEleve.update(ficheId, { interventions });

      setStatus('saved');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  if (status === 'saved') {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        Enregistré dans la fiche de {prenomEleve || 'l\'élève'} !
      </div>
    );
  }

  return (
    <Button
      onClick={handleSave}
      disabled={status === 'saving'}
      className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
    >
      {status === 'saving' ? (
        <><Loader className="w-4 h-4 animate-spin" /> Enregistrement...</>
      ) : (
        <><Save className="w-4 h-4" /> Enregistrer dans la fiche élève{prenomEleve ? ` de ${prenomEleve}` : ''}</>
      )}
    </Button>
  );
}