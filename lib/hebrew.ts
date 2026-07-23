/**
 * Format a phone number for readable display inside RTL Hebrew text.
 * Accepts "0503024060", "050-3024060", or "+972503024060" and returns a
 * consistent "050-302-4060" (or "077-412-3186") form.
 * The consumer wraps the result in `<span class="ltr-num">` to isolate bidi.
 */
export function formatIsraeliPhone(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '');
  // Strip international prefix
  const local = digits.startsWith('972') ? '0' + digits.slice(3) : digits;
  if (local.length === 10) {
    return `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`;
  }
  if (local.length === 9) {
    // Landlines: 077-XXX-XXXX
    return `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`;
  }
  return raw;
}

/**
 * Convert display phone to `tel:` href (E.164, `+972...`).
 */
export function telHref(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '');
  if (digits.startsWith('972')) return `tel:+${digits}`;
  if (digits.startsWith('0')) return `tel:+972${digits.slice(1)}`;
  return `tel:${digits}`;
}
