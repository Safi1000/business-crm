// TechXServe AI assistant. OpenAI gpt-5-mini with tool-calling over company data (RLS via caller JWT).
// Company users see their own company. The Super Super Admin (no company / unscoped) sees ALL companies.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { OPENAI_API_KEY } from './secrets.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const MODEL = 'gpt-5-mini';
const MAX_TOOL_ITERATIONS = 6;
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json', ...CORS } });
interface Caller { id: string; companyId: string | null; name: string; role: string; unscoped: boolean }
interface ChatMessage { role: 'system' | 'user' | 'assistant' | 'tool'; content: string | null; tool_calls?: any[]; tool_call_id?: string; name?: string }
interface ToolCtx { sb: SupabaseClient; unscoped: boolean; companyMap: Record<string, string> }

function buildSystemPrompt(c: Caller): string {
  const base = `You are the TechXServe Business Platform assistant. You help ${c.name} (${c.role}) with company data: clients, invoices, employees, attendance, payroll, expenses, banks, projects, and compliance dates.\nRules:\n- Answer ONLY from the tools provided; never invent figures. Call tools to get real data.\n- Money is in PKR unless stated. Be concise and specific; use short bullet points and real numbers.\n- If a tool returns empty, say there is no matching data yet (don't say the feature is missing).\n- You may do light small talk but steer back to the platform.`;
  if (c.unscoped) {
    return base + `\n- You are the platform owner (Super Super Admin). Tool results span ALL companies on the platform. Each row/group carries its 'company' name — always attribute figures to the right company, and when a question is platform-wide, total across companies and note the breakdown. get_dashboard and cashflow return cross-company aggregates with per-company detail.`;
  }
  return base;
}

const TOOLS = [
  { type: 'function', function: { name: 'get_dashboard', description: 'KPIs. For a single company: employees, attendance %, expenses MTD, payroll MTD, bank balances, cash, alerts. For the platform owner: per-company overview (employees, cash, outstanding, overdue, expenses MTD, payroll MTD) plus grand totals.', parameters: { type: 'object', properties: {} } } },
  { type: 'function', function: { name: 'list_clients', description: 'List clients with outstanding balance and active contract counts. Optional name/code search. Spans all companies for the platform owner.', parameters: { type: 'object', properties: { search: { type: 'string' } } } } },
  { type: 'function', function: { name: 'overdue_invoices', description: 'Invoices currently overdue, with client, total and amount received. Spans all companies for the platform owner.', parameters: { type: 'object', properties: {} } } },
  { type: 'function', function: { name: 'cashflow', description: 'Last 12 months of revenue, expenses and payroll. Summed across all companies for the platform owner.', parameters: { type: 'object', properties: {} } } },
  { type: 'function', function: { name: 'list_employees', description: 'List employees (code, name, department, status). Optional search. Spans all companies for the platform owner.', parameters: { type: 'object', properties: { search: { type: 'string' } } } } },
  { type: 'function', function: { name: 'payroll_summary', description: 'Payroll for a month (yyyy-mm, default current): total net, disbursed vs pending counts. Broken down per company for the platform owner.', parameters: { type: 'object', properties: { month: { type: 'string' } } } } },
  { type: 'function', function: { name: 'expenses_by_category', description: 'Total expenses grouped by category. Spans all companies for the platform owner.', parameters: { type: 'object', properties: {} } } },
  { type: 'function', function: { name: 'upcoming_compliance', description: 'Important dates due within N days (default 30): title, date, category, priority. Spans all companies for the platform owner.', parameters: { type: 'object', properties: { days: { type: 'number' } } } } },
];

const nameOf = (ctx: ToolCtx, id: string) => ctx.companyMap[id] ?? 'Unknown';
const tagCompany = (ctx: ToolCtx, rows: any[] | null) => ctx.unscoped ? (rows ?? []).map((r) => ({ ...r, company: nameOf(ctx, r.company_id) })) : rows;

async function companiesOverview(ctx: ToolCtx): Promise<unknown> {
  const sb = ctx.sb;
  const ym = new Date().toISOString().slice(0, 7);
  const [emps, banks, clients, invs, exps, pays] = await Promise.all([
    sb.from('employee_list').select('company_id,status'),
    sb.from('bank_accounts').select('company_id,balance'),
    sb.from('client_list').select('company_id,outstanding'),
    sb.from('invoice_list').select('company_id,status,total,received'),
    sb.from('expense_list').select('company_id,date,amount'),
    sb.from('payslip_list').select('company_id,month,net_salary'),
  ]);
  const per: Record<string, any> = {};
  const ensure = (id: string) => (per[id] ??= { company: nameOf(ctx, id), employees: 0, cash: 0, outstanding: 0, overdueCount: 0, overdueAmount: 0, expensesMtd: 0, payrollMtd: 0 });
  (emps.data ?? []).forEach((r: any) => { if (r.status !== 'Inactive') ensure(r.company_id).employees++; });
  (banks.data ?? []).forEach((r: any) => { ensure(r.company_id).cash += Number(r.balance || 0); });
  (clients.data ?? []).forEach((r: any) => { ensure(r.company_id).outstanding += Number(r.outstanding || 0); });
  (invs.data ?? []).forEach((r: any) => { if (r.status === 'Overdue') { const a = ensure(r.company_id); a.overdueCount++; a.overdueAmount += Number(r.total || 0) - Number(r.received || 0); } });
  (exps.data ?? []).forEach((r: any) => { if (String(r.date ?? '').slice(0, 7) === ym) ensure(r.company_id).expensesMtd += Number(r.amount || 0); });
  (pays.data ?? []).forEach((r: any) => { if (r.month === ym) ensure(r.company_id).payrollMtd += Number(r.net_salary || 0); });
  const companies = Object.values(per);
  const totals = companies.reduce((t: any, c: any) => ({ employees: t.employees + c.employees, cash: t.cash + c.cash, outstanding: t.outstanding + c.outstanding, overdueCount: t.overdueCount + c.overdueCount, overdueAmount: t.overdueAmount + c.overdueAmount, expensesMtd: t.expensesMtd + c.expensesMtd, payrollMtd: t.payrollMtd + c.payrollMtd }), { employees: 0, cash: 0, outstanding: 0, overdueCount: 0, overdueAmount: 0, expensesMtd: 0, payrollMtd: 0 });
  return { scope: 'all_companies', companyCount: companies.length, companies, totals };
}

async function cashflowAll(ctx: ToolCtx): Promise<unknown> {
  const sb = ctx.sb;
  const [invs, exps, pays] = await Promise.all([
    sb.from('invoice_list').select('issue_date,total,status'),
    sb.from('expense_list').select('date,amount'),
    sb.from('payslip_list').select('month,net_salary'),
  ]);
  const now = new Date();
  const months: any[] = [];
  for (let i = 11; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); months.push({ ym: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, month: d.toLocaleString('en-US', { month: 'short' }), revenue: 0, expenses: 0, payroll: 0 }); }
  const idx: Record<string, number> = {}; months.forEach((m, i) => { idx[m.ym] = i; });
  (invs.data ?? []).forEach((r: any) => { if (r.status === 'Draft' || r.status === 'Cancelled') return; const ym = String(r.issue_date ?? '').slice(0, 7); if (ym in idx) months[idx[ym]].revenue += Number(r.total || 0); });
  (exps.data ?? []).forEach((r: any) => { const ym = String(r.date ?? '').slice(0, 7); if (ym in idx) months[idx[ym]].expenses += Number(r.amount || 0); });
  (pays.data ?? []).forEach((r: any) => { const ym = r.month; if (ym in idx) months[idx[ym]].payroll += Number(r.net_salary || 0); });
  return months.map(({ month, revenue, expenses, payroll }) => ({ month, revenue, expenses, payroll }));
}

async function runTool(name: string, args: Record<string, unknown>, ctx: ToolCtx): Promise<unknown> {
  const sb = ctx.sb;
  switch (name) {
    case 'get_dashboard': { if (ctx.unscoped) return companiesOverview(ctx); const { data } = await sb.rpc('dashboard_summary'); return data; }
    case 'list_clients': { let q = sb.from('client_list').select('company_id,code,name,status,outstanding,active_contracts').order('outstanding', { ascending: false }).limit(ctx.unscoped ? 100 : 50); if (args.search) q = q.or(`name.ilike.%${args.search}%,code.ilike.%${args.search}%`); const { data } = await q; return tagCompany(ctx, data); }
    case 'overdue_invoices': { const { data } = await sb.from('invoice_list').select('company_id,number,client_name,total,received,due_date').eq('status', 'Overdue').order('due_date'); return tagCompany(ctx, data); }
    case 'cashflow': { if (ctx.unscoped) return cashflowAll(ctx); const { data } = await sb.rpc('cashflow_monthly'); return data; }
    case 'list_employees': { let q = sb.from('employee_list').select('company_id,code,name,department,status,base_salary').order('name').limit(ctx.unscoped ? 200 : 100); if (args.search) q = q.or(`name.ilike.%${args.search}%,code.ilike.%${args.search}%`); const { data } = await q; return tagCompany(ctx, data); }
    case 'payroll_summary': { const month = (args.month as string) || new Date().toISOString().slice(0, 7); const { data } = await sb.from('payslip_list').select('company_id,status,net_salary').eq('month', month); const rows = data ?? []; if (ctx.unscoped) { const per: Record<string, any> = {}; rows.forEach((r: any) => { const a = (per[r.company_id] ??= { company: nameOf(ctx, r.company_id), total_net: 0, disbursed: 0, pending: 0, count: 0 }); a.total_net += Number(r.net_salary || 0); a.count++; if (r.status === 'Disbursed') a.disbursed++; if (r.status === 'Pending') a.pending++; }); return { month, scope: 'all_companies', companies: Object.values(per) }; } const total = rows.reduce((s: number, r: any) => s + Number(r.net_salary), 0); return { month, total_net: total, disbursed: rows.filter((r: any) => r.status === 'Disbursed').length, pending: rows.filter((r: any) => r.status === 'Pending').length, count: rows.length }; }
    case 'expenses_by_category': { const { data } = await sb.from('expense_list').select('category,amount'); const map: Record<string, number> = {}; (data ?? []).forEach((e: any) => { map[e.category ?? 'Uncategorised'] = (map[e.category ?? 'Uncategorised'] ?? 0) + Number(e.amount); }); return Object.entries(map).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount); }
    case 'upcoming_compliance': { const days = (args.days as number) || 30; const until = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10); const { data } = await sb.from('important_dates').select('company_id,title,date,category,priority').lte('date', until).eq('completed', false).order('date'); return tagCompany(ctx, data); }
    default: return { error: `unknown tool ${name}` };
  }
}

async function callOpenAI(messages: ChatMessage[]): Promise<ChatMessage> {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: MODEL, messages, tools: TOOLS, tool_choice: 'auto' }) });
  if (!resp.ok) throw new Error(`OpenAI request failed (${resp.status}): ${await resp.text()}`);
  const j = await resp.json();
  return j.choices[0].message as ChatMessage;
}

async function persistTurn(sb: SupabaseClient, c: Caller, threadId: string | null, userText: string | null, reply: string): Promise<string | null> {
  if (c.unscoped || !c.companyId) return threadId; // SSA chats aren't persisted (company_id is NOT NULL).
  if (!threadId) { const title = (userText ?? 'New chat').slice(0, 60); const { data } = await sb.from('ai_chat_threads').insert({ company_id: c.companyId, user_id: c.id, title }).select('id').single(); threadId = data!.id as string; }
  else { await sb.from('ai_chat_threads').update({ updated_at: new Date().toISOString() }).eq('id', threadId); }
  const rows: any[] = [];
  if (userText) rows.push({ company_id: c.companyId, thread_id: threadId, role: 'user', content: userText });
  rows.push({ company_id: c.companyId, thread_id: threadId, role: 'assistant', content: reply });
  await sb.from('ai_chat_messages').insert(rows);
  return threadId;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!OPENAI_API_KEY) return json({ error: 'OPENAI_API_KEY not set' }, 500);
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'unauthorized' }, 401);
  const jwt = authHeader.slice(7);
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: `Bearer ${jwt}` } }, auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return json({ error: 'invalid_token' }, 401);
  const { data: prof } = await sb.from('profiles').select('company_id, view_as_company, full_name, role').eq('id', user.id).single();
  const effectiveCompany = ((prof?.view_as_company as string | null) ?? (prof?.company_id as string | null)) ?? null;
  const role = (prof?.role as string) || 'user';
  const isSSA = !effectiveCompany && role === 'Super Super Admin';
  if (!effectiveCompany && !isSSA) return json({ error: 'no_company' }, 403);
  const caller: Caller = { id: user.id, companyId: effectiveCompany, name: (prof?.full_name as string) || 'there', role, unscoped: isSSA };
  let body: { messages?: Array<{ role: string; content: string }>; thread_id?: string | null };
  try { body = await req.json(); } catch { return json({ error: 'invalid_json' }, 400); }
  const inbound = body.messages ?? [];
  if (!Array.isArray(inbound) || inbound.length === 0) return json({ error: 'messages_required' }, 400);
  let threadId = body.thread_id ?? null;
  const messages: ChatMessage[] = [{ role: 'system', content: buildSystemPrompt(caller) }, ...inbound.map((m) => ({ role: m.role as ChatMessage['role'], content: m.content }))];
  const lastUser = [...inbound].reverse().find((m) => m.role === 'user')?.content ?? null;
  const companyMap: Record<string, string> = {};
  if (caller.unscoped) { const { data: cos } = await sb.from('companies').select('id,name'); (cos ?? []).forEach((c: any) => { companyMap[c.id] = c.name; }); }
  const ctx: ToolCtx = { sb, unscoped: caller.unscoped, companyMap };
  try {
    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const assistant = await callOpenAI(messages);
      messages.push(assistant);
      const calls = assistant.tool_calls;
      if (!calls || calls.length === 0) { const reply = assistant.content ?? ''; threadId = await persistTurn(sb, caller, threadId, lastUser, reply); return json({ reply, thread_id: threadId }); }
      for (const call of calls) {
        let parsed: Record<string, unknown> = {};
        try { parsed = JSON.parse(call.function.arguments || '{}'); } catch { parsed = {}; }
        let result: unknown;
        try { result = await runTool(call.function.name, parsed, ctx); } catch (e) { result = { error: e instanceof Error ? e.message : String(e) }; }
        messages.push({ role: 'tool', tool_call_id: call.id, name: call.function.name, content: JSON.stringify(result) });
      }
    }
    const fallback = 'That needed too many steps — could you narrow the question a little?';
    threadId = await persistTurn(sb, caller, threadId, lastUser, fallback);
    return json({ reply: fallback, thread_id: threadId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('ai-chat:', msg);
    return json({ error: msg }, 500);
  }
});
