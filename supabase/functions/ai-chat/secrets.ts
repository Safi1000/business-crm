// OpenAI key for the assistant. Provided as a Supabase Edge Function secret — never hardcode it here.
// Set it with:  supabase secrets set OPENAI_API_KEY=sk-... --project-ref <project-ref>
export const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? '';
