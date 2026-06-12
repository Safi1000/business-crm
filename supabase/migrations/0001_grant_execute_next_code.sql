-- Fix: client creation failed with "permission denied for function next_code".
--
-- The set_code BEFORE INSERT trigger on clients (and other code-numbered tables)
-- calls public.next_code() to generate the per-company code (e.g. CLI-0001). That
-- function is SECURITY DEFINER, but the authenticated role had never been granted
-- EXECUTE on it, so the trigger call was rejected and every insert failed with
-- "permission denied for function next_code".
grant execute on function public.next_code(text, text) to authenticated;
