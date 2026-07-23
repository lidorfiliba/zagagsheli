'use client';

import { useState, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
  const params = useSearchParams();
  const router = useRouter();
  const callback = params.get('callbackUrl') || '/admin';
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') || '');
    const password = String(form.get('password') || '');
    setErr(null);
    startTransition(async () => {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (!res || res.error) {
        setErr('פרטי התחברות שגויים');
        return;
      }
      router.push(callback);
      router.refresh();
    });
  };

  const inputClass =
    'block w-full bg-paper border border-line px-4 py-3 text-base text-ink rounded-[2px] focus:outline focus:outline-2 focus:outline-brass focus:border-brass transition-colors';

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-ink mb-1.5">אימייל</label>
        <input id="email" name="email" type="email" autoComplete="email" required dir="ltr" className={inputClass + ' text-start'} />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-ink mb-1.5">סיסמה</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required dir="ltr" className={inputClass + ' text-start'} />
      </div>
      {err && (
        <div role="alert" className="p-3 bg-[color-mix(in_srgb,var(--color-danger)_8%,var(--color-paper))] border border-[color-mix(in_srgb,var(--color-danger)_30%,var(--color-line))] text-[var(--color-danger)] text-sm rounded-[2px]">
          {err}
        </div>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full inline-flex items-center justify-center gap-2 bg-ink text-paper px-6 py-3 rounded-[2px] font-semibold hover:opacity-95 disabled:opacity-60 transition-opacity"
      >
        {pending && <Loader2 className="w-4 h-4 animate-spin" />}
        {pending ? 'מתחבר…' : 'התחבר'}
      </button>
    </form>
  );
}
