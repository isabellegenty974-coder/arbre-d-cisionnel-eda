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

Vous êtes invité(e) à rejoindre l'application Suivis RASED de l'équipe RASED de La Possession.

Cliquez ici pour créer votre compte et accéder à l'application.

Ce lien est valable 7 jours.

RASED · La Possession · La Réunion`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: 'Invitation Suivis RASED · La Possession',
      body: emailBody,
      from_name: 'RASED La Possession'
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});