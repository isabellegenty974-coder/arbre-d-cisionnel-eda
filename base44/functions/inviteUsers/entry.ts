import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Verify user is admin
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Invite the 3 users
    const emails = [
      'isabellegenty974@gmail.com',
      'veroniquecaro1985@gmail.com',
      'laurencepetit.reunion@gmail.com'
    ];

    const results = [];
    for (const email of emails) {
      try {
        await base44.users.inviteUser(email, 'user');
        results.push({ email, status: 'invited' });
      } catch (err) {
        results.push({ email, status: 'error', message: err.message });
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});