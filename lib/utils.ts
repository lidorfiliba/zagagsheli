import clsx, { type ClassValue } from 'clsx';

/**
 * Tailwind class combiner. Wraps clsx; add tailwind-merge later if class
 * collisions become a real problem (they rarely do with our design system).
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
