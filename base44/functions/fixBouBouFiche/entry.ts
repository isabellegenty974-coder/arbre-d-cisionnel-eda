import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Trouver la fiche Bou Bou
    const fiches = await base44.asServiceRole.entities.FicheEleve.filter({ prenom: 'Bou', nom: 'Bou' });
    if (fiches.length === 0) return Response.json({ error: 'Fiche non trouvée' }, { status: 404 });

    const fiche = fiches[0];
    const membre = await base44.asServiceRole.entities.MembreEquipe.filter({ email: user.email });
    const profession = membre.length > 0 ? membre[0].profession : '';
    const annees = await base44.asServiceRole.entities.AnneeScolaire.filter({ est_active: true });
    const anneeActive = annees.length > 0 ? annees[0].libelle : '';

    // Mettre à jour avec les bonnes valeurs
    await base44.asServiceRole.entities.FicheEleve.update(fiche.id, {
      createdByName: user.full_name,
      createdByProfession: profession,
      annee_scolaire: anneeActive,
    });

    return Response.json({ success: true, message: 'Fiche Bou Bou corrigée' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});