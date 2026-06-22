import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const email = body?.email;
    
    if (!email) {
      return Response.json({ error: 'Email requis' }, { status: 400 });
    }

    const subject = 'Invitation à rejoindre Suivis RASED · Circonscription de La Possession';
    const message = `Bonjour,

Vous êtes invité(e) à rejoindre Suivis RASED, l'application collaborative de l'équipe RASED de la Circonscription de La Possession (La Réunion).

Cette application vous permet de :
· Suivre les élèves en difficulté de manière partagée avec toute l'équipe
· Ajouter vos observations et notes de suivi sur les fiches élèves
· Consulter les hypothèses de travail formulées par la Psy-EN
· Accéder aux fiches élèves par école et par classe

Pour créer votre compte, cliquez sur le lien d'invitation reçu et renseignez :
· Votre prénom et nom
· Votre rôle :
  - Psychologue de l'Éducation Nationale · Spécialité EDA
  - Maître à Dominante Relationnelle (MaDR)
  - Maître à Dominante Pédagogique (MaDP)
· Un mot de passe personnel

Une fois votre compte créé, vous aurez immédiatement accès à l'application.

L'application est accessible depuis votre navigateur sur téléphone ou ordinateur. Elle peut s'installer sur votre écran d'accueil comme une application normale.

À très bientôt dans l'équipe !

RASED · Circonscription de La Possession
La Réunion

---
Ce lien est personnel et valable 7 jours.
Ne le partagez pas.
En cas de problème, contactez votre administrateur.`;

    await base44.integrations.Core.SendEmail({
      to: email,
      subject: subject,
      body: message
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return Response.json({ error: error.message || 'Erreur lors de l\'envoi' }, { status: 500 });
  }
});