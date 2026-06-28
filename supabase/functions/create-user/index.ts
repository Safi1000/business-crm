import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json', ...CORS } });
const tempPassword = () => 'Tx-' + crypto.randomUUID().slice(0, 8) + '!9';

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
  const { data: me } = await caller.from('profiles').select('company_id, role, portal_kind, view_as_company').eq('id', user.id).single();
  if (!me || me.portal_kind !== 'admin') return json({ error: 'forbidden' }, 403);

  const isSSA = me.role === 'Super Super Admin';
  const isSA = me.role === 'Super Admin';
  if (!isSSA && !isSA) return json({ error: 'forbidden: admins only' }, 403);

  const body = await req.json().catch(() => ({}));
  const { name, email, password, title, role, permissions, company_id } = body;
  if (!email) return json({ error: 'email required' }, 400);

  // SSA may target any company; defaults to the company it's currently viewing.
  // SA may only create staff within their own company (never another SSA/SA).
  const targetCompany = isSSA ? (company_id ?? me.view_as_company) : me.company_id;
  if (!targetCompany) return json({ error: 'company_id required (switch into a company first)' }, 400);
  let targetRole = isSSA ? (role ?? 'Super Admin') : (role ?? 'Ops');
  if (targetRole === 'Super Super Admin') return json({ error: 'cannot create another SSA' }, 400);
  if (isSA && targetRole === 'Super Admin') return json({ error: 'only the SSA can create Super Admins' }, 403);

  const admin = createClient(url, service);
  const { data: co } = await admin.from('companies').select('id, name').eq('id', targetCompany).maybeSingle();
  if (!co) return json({ error: 'company not found' }, 404);

  const pwd = password || tempPassword();
  let userId: string;
  const { data: created, error } = await admin.auth.admin.createUser({ email, password: pwd, email_confirm: true });
  if (error) {
    const { data: list } = await admin.auth.admin.listUsers();
    const found = list.users.find((u) => u.email === email);
    if (!found) return json({ error: error.message }, 400);
    userId = found.id;
    await admin.auth.admin.updateUserById(userId, { password: pwd });
  } else {
    userId = created.user.id;
  }

  const { error: pErr } = await admin.from('profiles').upsert({
    id: userId,
    company_id: targetCompany,
    role: targetRole,
    portal_kind: 'admin',
    full_name: name ?? '',
    email,
    title: title ?? (targetRole === 'Super Admin' ? 'Administrator' : ''),
    permissions: permissions ?? [],
    must_change_password: !password,
  });
  if (pErr) return json({ error: pErr.message }, 400);

  return json({ id: userId, name: name ?? '', email, title: title ?? '', permissions: permissions ?? [], role: targetRole, company: co.name, tempPassword: password ? undefined : pwd });
});
