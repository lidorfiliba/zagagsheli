/**
 * Build a WhatsApp deep-link URL with an optional prefilled message.
 * The phone must be in E.164 form without the leading `+` — e.g. "972503024060".
 */
export function whatsappUrl(phoneE164: string, message?: string): string {
  const base = `https://wa.me/${phoneE164}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/**
 * Look up the per-page WhatsApp message template. Falls back to `default`.
 * Templates are stored in SiteSetting under `whatsapp.template.<slug>`.
 */
export function whatsappTemplate(
  templates: Record<string, string>,
  slug: string
): string {
  return templates[`whatsapp.template.${slug}`] || templates['whatsapp.template.default'] || 'היי, הגעתי מהאתר';
}
