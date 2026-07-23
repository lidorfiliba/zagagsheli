import { z } from 'zod';

/**
 * Shared schemas — imported by both the client form (react-hook-form
 * resolver) and the server action (validation gate). Single source of truth
 * for what constitutes a valid submission.
 */

export const leadSchema = z.object({
  name: z.string().trim().min(2, 'שם קצר מדי').max(100, 'שם ארוך מדי'),
  phone: z.string().trim()
    .min(9, 'מספר טלפון קצר מדי')
    .max(20, 'מספר טלפון ארוך מדי')
    .regex(/^[+\d\s\-()]+$/, 'מספר טלפון לא תקין'),
  email: z.string().trim().email('אימייל לא תקין').max(200).optional().or(z.literal('')),
  city: z.string().trim().max(60).optional().or(z.literal('')),
  serviceType: z.string().max(30).default('general'),
  message: z.string().trim().max(1000).optional().or(z.literal('')),
  sourcePage: z.string().max(200),
  honeypot: z.string().max(0).optional(), // must be empty — bot trap
});

export type LeadInput = z.infer<typeof leadSchema>;

export const leadStatusEnum = z.enum(['NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST']);
export type LeadStatus = z.infer<typeof leadStatusEnum>;
