import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...CORS } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const authHeader = req.headers.get('Authorization') ?? '';

  const caller = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
  const { data: { user }, error: uerr } = await caller.auth.getUser();
  if (uerr || !user) return json({ error: 'unauthorized' }, 401);
  const { data: me } = await caller.from('profiles').select('company_id, role').eq('id', user.id).single();
  const isSSA = me?.role === 'Super Super Admin';
  const isSA = me?.role === 'Super Admin';
  if (!me || (!isSSA && !isSA)) return json({ error: 'forbidden: admins only' }, 403);

  const { id } = await req.json().catch(() => ({}));
  if (!id) return json({ error: 'id required' }, 400);
  if (id === user.id) return json({ error: 'cannot delete yourself' }, 400);

  const admin = createClient(url, service);
  const { data: target } = await admin.from('profiles').select('company_id, role').eq('id', id).single();
  if (!target) return json({ error: 'not found' }, 404);
  // Nobody can delete the platform owner (Super Super Admin).
  if (target.role === 'Super Super Admin') return json({ error: 'cannot delete the Super Super Admin' }, 403);

  if (isSA) {
    // A Super Admin may only remove non-admin staff within their own company.
    if (target.company_id !== me.company_id) return json({ error: 'not found in your company' }, 404);
    if (target.role === 'Super Admin') return json({ error: 'only the Super Super Admin can remove a Super Admin' }, 403);
  }
  // The Super Super Admin may remove any company user, including Super Admins.

  const { error } = await admin.auth.admin.deleteUser(id); // profile row cascades via FK
  if (error) return json({ error: error.message }, 400);
  return json({ ok: true });
});
