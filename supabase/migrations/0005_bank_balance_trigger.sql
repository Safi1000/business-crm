-- 0005_bank_balance_trigger.sql
-- BUG-09 — bank balance sync on recorded revenue.
--
-- REVISED: crediting is now handled application-side in
-- src/data/mock-api/invoices.ts `recordPayment`, which credits the SPECIFIC bank
-- account chosen in the Record Payment dialog (HBL / UBL / …) and writes a
-- matching bank_transactions row — consistent with how expensesApi.create and
-- wireTransfer already move money. Cheque payments create a Pending cheque row
-- instead of crediting the balance.
--
-- An AFTER-INSERT trigger here would double-count those credits, so this
-- migration only ensures any earlier trigger/function is removed. Safe to run
-- even if they were never created.
--
-- Apply against the TechXServe Supabase project only.

drop trigger if exists trg_credit_bank_on_payment on public.invoice_payments;
drop function if exists public.credit_bank_on_payment();
