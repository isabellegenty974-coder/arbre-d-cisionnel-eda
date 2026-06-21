import { useState } from 'react';
import ScreenLayout from './ScreenLayout';
import InfoList from './InfoList';
import SaveDiagnosticButton from '@/components/SaveDiagnosticButton';

/**
 * Composant générique pour les pages d'actions.
 * Récupère le ficheId depuis l'URL (?ficheId=xxx) et affiche le bouton de sauvegarde.
 */
export default function ActionsPage({ title, domaine, sousDomaine, items }) {
  const [selectedActions, setSelectedActions] = useState([]);

  const urlParams = new URLSearchParams(window.location.search);
  const ficheId = urlParams.get('ficheId');
  const prenomEleve = urlParams.get('prenom');

  return (
    <ScreenLayout title={title}>
      <InfoList
        type="action"
        items={items}
        onSelectItems={setSelectedActions}
      />
      {ficheId && (
        <div className="mt-6">
          <p className="text-xs text-muted-foreground mb-2 text-center">
            {selectedActions.length > 0
              ? `${selectedActions.length} action(s) sélectionnée(s)`
              : 'Sélectionnez des actions à enregistrer'}
          </p>
          <SaveDiagnosticButton
            ficheId={ficheId}
            prenomEleve={prenomEleve}
            domaine={domaine}
            sousDomaine={sousDomaine}
            hypotheses={[]}
            actions={selectedActions.length > 0 ? selectedActions : items}
          />
        </div>
      )}
    </ScreenLayout>
  );
}