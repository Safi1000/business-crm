# Supabase Edge Functions

Source for the project's edge functions. The deployed copies live in the Supabase
project `techxserve` (ref `fktjdtncdtxlilvsjelf`).

## ai-chat

The in-app AI assistant (OpenAI `gpt-5-mini` with tool-calling over company data).
RLS is enforced via the caller's JWT. Company users see their own company; the
Super Super Admin (no company / unscoped) sees **all** companies via cross-company
aggregates.

### Required secret

`OPENAI_API_KEY` must be set as an Edge Function secret — it is intentionally **not**
committed. Set it before deploying:

```bash
supabase secrets set OPENAI_API_KEY=sk-... --project-ref fktjdtncdtxlilvsjelf
```

### Deploy

```bash
supabase functions deploy ai-chat --project-ref fktjdtncdtxlilvsjelf
```

> Note: other edge functions (`send-email`, `create-user`, `delete-user`,
> `invite-portal-user`, `gdrive-upload`, `gdrive-delete`, `bootstrap-admin`) are
> deployed to the same project but their source is not yet in this repo.
> `send-email` requires a `RESEND_API_KEY` secret.
