import { z } from 'zod';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Length limits based on common practice / standards
const MAX_EMAIL_LENGTH = 254;
const MAX_LOCAL_PART_LENGTH = 64;

// INTENTIONAL MISSPELLINGS - DO NOT "FIX" OR REMOVE
// This map detects common email domain typos
const domainTypos: Record<string, string> = {
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
};

// List of known disposable/temporary email domains
// These are commonly used for spam or temporary registrations
const disposableEmailDomains = new Set([
  // Popular temporary email services
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'guerrillamailblock.com',
  'sharklasers.com',
  'grr.la',
  'guerrillamail.biz',
  'guerrillamail.de',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me',
  '10minutemail.com',
  '10minutemail.net',
  'mailinator.com',
  'trashmail.com',
  'throwaway.email',
  'maildrop.cc',
  'fakeinbox.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'cool.fr.nf',
  'jetable.fr.nf',
  'nospam.ze.tc',
  'nomail.xl.cx',
  'mega.zik.dj',
  'speed.1s.fr',
  'courriel.fr.nf',
  'moncourrier.fr.nf',
  'monemail.fr.nf',
  'monmail.fr.nf',
  'getnada.com',
  'getairmail.com',
  'burnermail.io',
  'mailnesia.com',
  'emailondeck.com',
  'mytemp.email',
  'tempmail.ninja',
  'dispostable.com',
  'fakemailgenerator.com',
  'disposablemail.com',
  'temp-mail.io',
  'mohmal.com',
  'inboxbear.com',
  'tmail.com',
  'tmails.net',
  'anonaddy.com',
  'simplelogin.com',
]);

/**
 * Normalize and extract domain parts safely
 */
function getDomain(email: string): string | null {
  const parts = email.split('@');
  if (parts.length !== 2) return null;
  return parts[1]?.toLowerCase() ?? null;
}

/**
 * Extract "base domain" (last two labels) to catch subdomains of disposable services:
 * e.g. "foo.mailinator.com" -> "mailinator.com"
 */
function getBaseDomain(domain: string): string {
  const labels = domain.toLowerCase().split('.');
  if (labels.length <= 2) return domain.toLowerCase();
  return labels.slice(-2).join('.');
}

/**
 * Check if an email domain is a known disposable/temporary email service
 */
function isDisposableEmail(email: string): boolean {
  const domain = getDomain(email);
  if (!domain) return false;

  const base = getBaseDomain(domain);
  return disposableEmailDomains.has(domain) || disposableEmailDomains.has(base);
}

/**
 * Validate local part according to common rules
 */
function isValidLocalPart(localPart: string): boolean {
  if (!localPart) return false;
  if (localPart.length > MAX_LOCAL_PART_LENGTH) return false;

  // No leading or trailing dot
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false;

  // No consecutive dots
  if (localPart.includes('..')) return false;

  // Allow common characters: letters, numbers, and basic specials
  // (Still permissive, but filters out obvious garbage)
  const localPartRegex = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+$/;
  if (!localPartRegex.test(localPart)) return false;

  return true;
}

/**
 * Validate domain part according to common DNS rules
 */
function isValidDomain(domain: string): boolean {
  if (!domain) return false;

  // No leading or trailing dot
  if (domain.startsWith('.') || domain.endsWith('.')) return false;

  // No consecutive dots
  if (domain.includes('..')) return false;

  const labels = domain.split('.');
  if (labels.length < 2) return false;

  // Validate each label
  const labelRegex = /^[a-zA-Z0-9-]+$/;
  for (const label of labels) {
    if (!label) return false;
    if (!labelRegex.test(label)) return false;
    // labels can't start or end with hyphen
    if (label.startsWith('-') || label.endsWith('-')) return false;
    // DNS label max length
    if (label.length > 63) return false;
  }

  // TLD validation (last label)
  const tld = labels[labels.length - 1];
  if (tld.length < 2) return false;
  if (!/^[a-zA-Z]+$/.test(tld)) return false;

  return true;
}

export const emailForAuthSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Please enter your email address.')
    .max(MAX_EMAIL_LENGTH, 'Email address is too long.')
    .transform((val) => val.toLowerCase())
    .refine((val) => EMAIL_REGEX.test(val), {
      message: 'Please enter a valid email address.',
    })
    .superRefine((val, ctx) => {
      // Basic format split
      const parts = val.split('@');
      if (parts.length !== 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter a valid email address.',
        });
        return;
      }

      const [localPart, domain] = parts;

      // Local part rules
      if (!isValidLocalPart(localPart)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter a valid email address (local part is invalid).',
        });
        return;
      }

      // Domain rules
      if (!isValidDomain(domain)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter a valid email address (domain is invalid).',
        });
        return;
      }

      // Check for disposable email
      if (isDisposableEmail(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Temporary or disposable email addresses are not allowed. Please use a permanent email address.',
        });
        return;
      }

      // Check for common typos
      const suggestedDomain = domainTypos[domain];
      if (suggestedDomain) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Did you mean ${localPart}@${suggestedDomain}? Please check your email address.`,
        });
      }
    }),
});

export type EmailForAuthInput = z.infer<typeof emailForAuthSchema>;

/**
 * Validates an email address for authentication purposes.
 * Checks syntax, disposable emails, and common domain typos.
 *
 * @param email - The email address to validate
 * @returns Object with success boolean and either data or error message
 */
export function validateEmailForAuth(
  email: string
):
  | { success: true; data: { email: string } }
  | { success: false; error: string } {
  const result = emailForAuthSchema.safeParse({ email });

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message ?? 'Invalid email address.',
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Client-side helper to check for email typos without full validation.
 * Use this for immediate feedback as user types.
 *
 * @param email - The email address to check
 * @returns Suggestion message if typo detected, null otherwise
 */
export function checkEmailTypo(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const parts = trimmed.split('@');

  if (parts.length !== 2) return null;

  const [localPart, domain] = parts;
  const suggestedDomain = domainTypos[domain];

  if (suggestedDomain) {
    return `Did you mean ${localPart}@${suggestedDomain}? Please check your email address.`;
  }

  return null;
}
