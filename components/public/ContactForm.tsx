'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import type { Service } from '@prisma/client';
import { leadSchema, type LeadInput } from '~/lib/validation';
import { submitLead } from '~/app/actions/submit-lead';

export function ContactForm({
  services,
  sourcePage,
  initialServiceType = 'general',
}: {
  services: Pick<Service, 'slug' | 'titleHe'>[];
  sourcePage: string;
  initialServiceType?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      serviceType: initialServiceType,
      sourcePage,
      name: '',
      phone: '',
      city: '',
      message: '',
      email: '',
      honeypot: '',
    },
  });

  const onSubmit = (data: LeadInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await submitLead(data);
      if (result?.error) setServerError(result.error);
      // otherwise the server action redirected to /thank-you
    });
  };

  const inputClass =
    'block w-full bg-surface border border-line px-4 py-3 text-base text-ink rounded-[2px] placeholder:text-muted/70 focus:outline focus:outline-2 focus:outline-brass focus:outline-offset-0 focus:border-brass transition-colors';

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Honeypot — kept off-screen but present in DOM */}
      <div className="absolute -left-[9999px] top-auto w-px h-px overflow-hidden" aria-hidden="true">
        <label>
          אל תמלא שדה זה
          <input type="text" tabIndex={-1} autoComplete="off" {...register('honeypot')} />
        </label>
      </div>
      <input type="hidden" {...register('sourcePage')} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="lead-name" className="block text-sm font-semibold text-ink mb-1.5">
            שם מלא <span className="text-brass">*</span>
          </label>
          <input
            id="lead-name"
            type="text"
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'lead-name-err' : undefined}
            className={inputClass}
            {...register('name')}
          />
          {errors.name && (
            <p id="lead-name-err" className="mt-1.5 text-sm text-[var(--color-danger)]" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="lead-phone" className="block text-sm font-semibold text-ink mb-1.5">
            טלפון <span className="text-brass">*</span>
          </label>
          <input
            id="lead-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'lead-phone-err' : undefined}
            className={inputClass + ' text-start'}
            {...register('phone')}
          />
          {errors.phone && (
            <p id="lead-phone-err" className="mt-1.5 text-sm text-[var(--color-danger)]" role="alert">
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="lead-service" className="block text-sm font-semibold text-ink mb-1.5">
            סוג העבודה
          </label>
          <select
            id="lead-service"
            className={inputClass}
            {...register('serviceType')}
          >
            <option value="general">בירור כללי</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>{s.titleHe}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lead-city" className="block text-sm font-semibold text-ink mb-1.5">
            עיר
          </label>
          <input
            id="lead-city"
            type="text"
            autoComplete="address-level2"
            className={inputClass}
            {...register('city')}
          />
        </div>
      </div>

      <div>
        <label htmlFor="lead-message" className="block text-sm font-semibold text-ink mb-1.5">
          הודעה
        </label>
        <textarea
          id="lead-message"
          rows={4}
          className={inputClass + ' resize-y'}
          {...register('message')}
        />
      </div>

      {serverError && (
        <div role="alert" className="p-4 bg-[color-mix(in_srgb,var(--color-danger)_8%,var(--color-paper))] border border-[color-mix(in_srgb,var(--color-danger)_30%,var(--color-line))] text-[var(--color-danger)] text-sm rounded-[2px]">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 bg-ink text-paper w-full md:w-auto px-8 py-3.5 rounded-[2px] font-semibold text-base hover:bg-[color-mix(in_srgb,var(--color-ink)_92%,var(--color-brass))] disabled:opacity-60 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass focus-visible:outline-offset-2"
      >
        {pending && <Loader2 className="w-4 h-4 animate-spin" />}
        {pending ? 'שולח…' : 'שליחת בקשה'}
      </button>
      <p className="text-xs text-muted mt-2">
        בשליחת הטופס אתה מאשר שנחזור אליך תוך יום עסקים. פרטיך לא ישותפו עם צד שלישי.
      </p>
    </form>
  );
}
