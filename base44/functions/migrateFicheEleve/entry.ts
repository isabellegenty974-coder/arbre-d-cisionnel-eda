import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Récupérer toutes les fiches
    const fiches = await base44.asServiceRole.entities.FicheEleve.list('', 1000);
    
    let updated = 0;
    let errors = [];

    // Migrer chaque fiche
    for (const fiche of fiches) {
      try {
        const updates = {};
        
        // Si createdByName = "Utilisateur", remplacer par le nom de l'admin
        if (fiche.createdByName === 'Utilisateur') {
          updates.createdByName = user.full_name || 'Administrateur';
        }
        
        // Si createdByProfession = "Profession non renseignée", supprimer/vider
        if (fiche.createdByProfession === 'Profession non renseignée') {
          updates.createdByProfession = '';
        }
        
        // Appliquer les mises à jour si nécessaire
        if (Object.keys(updates).length > 0) {
          await base44.asServiceRole.entities.FicheEleve.update(fiche.id, updates);
          updated++;
        }
      } catch (err) {
        errors.push({ ficheId: fiche.id, error: err.message });
      }
    }

    return Response.json({ 
      success: true, 
      message: `Migration complétée: ${updated} fiche(s) mise(s) à jour`,
      errors: errors.length > 0 ? errors : null
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});