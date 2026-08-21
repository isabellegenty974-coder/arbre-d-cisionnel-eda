import { base44 } from '@/api/base44Client';
import { fetchAllPages } from './fetchAllPages';

// Entités qui référencent une FicheEleve par identifiant (voir
// base44/entities/*.jsonc) — source unique de la liste des dépendances,
// utilisée à la fois pour annoncer à l'utilisateur ce qui va être supprimé et
// pour exécuter la cascade elle-même. HistoriqueEDA.eleve_id stocke en
// réalité l'id de la FicheEleve (voir SaveDiagnosticButton.jsx), malgré son
// nom. Diagnostic est volontairement exclu : il ne porte aucun identifiant
// fiable vers FicheEleve (seulement eleve_nom/eleve_prenom en texte libre),
// un rapprochement par nom risquerait de mélanger deux élèves homonymes.
export const FICHE_DEPENDENTS = [
  { entity: 'NotesMembre', field: 'fiche_id', label: "note(s) de l'équipe" },
  { entity: 'HistoriqueEDA', field: 'eleve_id', label: "entrée(s) d'historique EDA" },
  { entity: 'RappelEleve', field: 'fiche_id', label: 'rappel(s)' },
  { entity: 'Notification', field: 'fiche_id', label: 'notification(s)' },
  { entity: 'Presence', field: 'fiche_id', label: 'entrée(s) de présence' },
];

async function countDependent(entity, field, ficheId) {
  const rows = await fetchAllPages(entity, undefined, { query: { [field]: ficheId }, throwOnError: true });
  return rows.length;
}

// Compte, pour une FicheEleve donnée, le nombre d'enregistrements liés dans
// chaque entité dépendante — à afficher dans la confirmation avant
// suppression. Remonte l'erreur si une entité ne peut pas être interrogée :
// mieux vaut empêcher la suppression que l'autoriser sur un décompte partiel.
export async function countFicheDependents(ficheId) {
  const counts = {};
  for (const { entity, field } of FICHE_DEPENDENTS) {
    counts[entity] = await countDependent(entity, field, ficheId);
  }
  return counts;
}

// Supprime en cascade tout ce qui référence une FicheEleve : les entités
// dépendantes listées ci-dessus, puis délie (sans les supprimer) les
// EleveRased qui pointaient vers cette fiche — l'élève reste répertorié dans
// son école, seul le dossier RASED disparaît. Vérifie ensuite qu'aucun
// enregistrement lié ne subsiste avant de supprimer la fiche elle-même : en
// cas de reste (échec partiel d'un deleteMany), la fiche n'est PAS supprimée
// — un dossier incomplet mais signalé vaut mieux qu'un dossier supprimé avec
// des dépendances orphelines.
export async function deleteFicheCascade(ficheId) {
  for (const { entity, field } of FICHE_DEPENDENTS) {
    await base44.entities[entity].deleteMany({ [field]: ficheId });
  }

  const remaining = [];
  for (const { entity, field } of FICHE_DEPENDENTS) {
    const n = await countDependent(entity, field, ficheId);
    if (n > 0) remaining.push(`${entity} (${n})`);
  }
  if (remaining.length > 0) {
    throw new Error(
      `Suppression incomplète : des données liées subsistent encore (${remaining.join(', ')}). ` +
      `La fiche n'a pas été supprimée — réessayez.`
    );
  }

  const eleveRasedLies = await fetchAllPages('EleveRased', undefined, {
    query: { fiche_eleve_id: ficheId },
    throwOnError: true,
  });
  for (const er of eleveRasedLies) {
    await base44.entities.EleveRased.update(er.id, { fiche_eleve_id: '' });
  }

  await base44.entities.FicheEleve.delete(ficheId);
}

// Supprime en cascade une école : traite d'abord chaque FicheEleve rattachée
// (via les EleveRased de l'école, cascade complète ci-dessus) AVANT de
// supprimer les EleveRased eux-mêmes — sinon le seul lien fiable vers ces
// fiches (fiche_eleve_id) disparaîtrait avant d'avoir pu les nettoyer. Si une
// fiche échoue, la fonction s'arrête : les fiches déjà traitées restent
// supprimées (l'opération est idempotente, un nouvel essai reprend là où ça
// s'est arrêté), mais l'école et le reste du répertoire ne sont pas touchés
// tant que tout n'a pas été nettoyé avec succès.
export async function deleteEcoleCascade(ecoleId) {
  const eleves = await fetchAllPages('EleveRased', undefined, {
    query: { ecole_id: ecoleId },
    throwOnError: true,
  });
  const ficheIds = eleves.map(e => e.fiche_eleve_id).filter(Boolean);

  for (const ficheId of ficheIds) {
    await deleteFicheCascade(ficheId);
  }

  await base44.entities.EleveRased.deleteMany({ ecole_id: ecoleId });
  await base44.entities.ClasseEcole.deleteMany({ ecole_id: ecoleId });
  await base44.entities.EcoleRased.delete(ecoleId);
}
