import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { email } = await req.json();
    if (!email) {
      return Response.json({ error: 'Missing email' }, { status: 400 });
    }

    const emailBody = `Bonjour,

Vous êtes invité(e) à rejoindre Suivis RASED, l'application collaborative de l'équipe RASED de la Circonscription de La Possession (La Réunion).

Cette application vous permet de :
- Suivre les élèves en difficulté de manière partagée avec toute l'équipe
- Ajouter vos observations et notes de suivi sur les fiches élèves
- Consulter les hypothèses de travail formulées par la Psy-EN
- Accéder aux fiches élèves par école et par classe

Pour créer votre compte, cliquez sur le lien d'invitation reçu et renseignez votre prénom, nom, rôle et mot de passe.

Une fois votre compte créé, vous aurez immédiatement accès à l'application.

L'application est accessible depuis votre navigateur sur téléphone ou ordinateur.

À très bientôt dans l'équipe !

RASED · Circonscription de La Possession
La Réunion

---
Ce lien est personnel et valable 7 jours.
Ne le partagez pas.`;

    await base44.integrations.Core.SendEmail({
      to: email,
      subject: 'Invitation Suivis RASED · La Possession',
      body: emailBody
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});