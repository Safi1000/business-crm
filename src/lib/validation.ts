/**
 * Shared form-validation helpers (BUG-01).
 *
 * One source of truth for the input rules so every form — and the backend
 * mirror in `supabase/migrations` / edge functions — enforces the same thing.
 *
 * Philosophy (see project decision): structured fields are strict; free-text
 * fields (address, notes, descriptions, org/project/task labels) reject only
 * genuine injection / script patterns so legitimate data (e.g. "Smith & Co
 * (Pvt) Ltd.", "12/3 Main Rd #4") is never rejected.
 */
import { z } from 'zod';

/**
 * The hard special-character set from the spec. Rejected in strict text fields.
 * Kept as a plain character class (no lookbehind) so it works identically in
 * Chrome, Firefox and Edge.
 */
export const SPECIAL_CHARS = /[=<>"';/\\(){}[\]#%&*!?|^~]/;

/**
 * Injection / script signatures — blocked even inside free-text fields.
 * Catches <script>, HTML tags, JS handlers, quotes/backslashes/angle brackets,
 * SQL comment markers, `UNION SELECT`, `' OR '1'='1`, and `1=1` style tautologies.
 */
export const INJECTION_PATTERN =
  /(<\s*script|<\s*\/?[a-z]|javascript:|on\w+\s*=|\bunion\b[\s\S]*\bselect\b|\bor\b\s+['"\d]|\d+\s*=\s*\d+|--|\/\*|\*\/|[<>"'`\\])/i;

/** True if a value is safe to store in a free-text field (no injection markers). */
export function isSafeText(value: string): boolean {
  return !INJECTION_PATTERN.test(value);
}

/** True if a value contains none of the strict special characters. */
export function hasNoSpecialChars(value: string): boolean {
  return !SPECIAL_CHARS.test(value);
}

const SAFE_MSG = 'Unsafe or invalid characters detected';
const SPECIAL_MSG = 'Special characters are not allowed';

/* ------------------------------------------------------------------ *
 * Structured fields — strict.
 * ------------------------------------------------------------------ */

/** Person name: letters, spaces, hyphens (plus apostrophe/period for real names). */
export function personName(label = 'Name') {
  return z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .regex(/^[A-Za-z][A-Za-z\s.'-]*$/, `${label} may only contain letters, spaces and hyphens`);
}

/** Required email. */
export const emailRequired = z.string().trim().min(1, 'Email is required').email('Enter a valid email');

/** Optional email — empty string allowed, otherwise must be valid. */
export const emailOptional = z
  .string()
  .trim()
  .refine((v) => v === '' || z.string().email().safeParse(v).success, 'Enter a valid email');

/** Phone: digits, spaces, hyphens, parentheses (optional leading +). Optional by default. */
export function phoneField(required = false) {
  const base = z
    .string()
    .trim()
    .refine((v) => v === '' || /^\+?[\d\s()-]+$/.test(v), 'Phone may only contain digits, spaces, hyphens and parentheses');
  return required ? base.refine((v) => v !== '', 'Phone is required') : base;
}

/** CNIC / national ID: digits and hyphens only. Optional by default. */
export function cnicField(required = false) {
  const base = z
    .string()
    .trim()
    .refine((v) => v === '' || /^[\d-]+$/.test(v), 'CNIC may only contain digits and hyphens');
  return required ? base.refine((v) => v !== '', 'CNIC is required') : base;
}

/** Numeric field. Coerces "" -> undefined so optional numbers stay optional. */
export function numberField(opts: { min?: number; max?: number; label?: string } = {}) {
  const label = opts.label ?? 'Value';
  return z.coerce
    .number({ invalid_type_error: `${label} must be a number` })
    .refine(Number.isFinite, `${label} must be a number`)
    .refine((n) => opts.min === undefined || n >= opts.min, `${label} must be ≥ ${opts.min}`)
    .refine((n) => opts.max === undefined || n <= opts.max, `${label} must be ≤ ${opts.max}`);
}

/** ISO date (yyyy-mm-dd from <input type="date">). */
export function dateField(required = false, label = 'Date') {
  const valid = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
  const base = z.string().trim().refine((v) => v === '' || valid(v), `Enter a valid ${label.toLowerCase()}`);
  return required ? base.refine((v) => v !== '', `${label} is required`) : base;
}

/* ------------------------------------------------------------------ *
 * Free-text / label fields — injection-safe but permissive.
 * ------------------------------------------------------------------ */

/** Required label/title (client name, project/task title, industry…). */
export function labelText(label = 'This field') {
  return z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine(isSafeText, SAFE_MSG);
}

/** Optional free text (address, notes, description, reference…). */
export const freeText = z
  .string()
  .refine((v) => v.trim() === '' || isSafeText(v), SAFE_MSG)
  .optional()
  .or(z.literal(''));

/** Optional strict text — no special characters at all (identifiers/codes). */
export const strictOptionalText = z
  .string()
  .trim()
  .refine((v) => v === '' || hasNoSpecialChars(v), SPECIAL_MSG)
  .optional()
  .or(z.literal(''));
