'use client';

import { useState, useTransition } from 'react';
import { updateLeadStatus } from '~/app/actions/admin-leads';

const STATUSES: Array<{ value: 'NEW' | 'CONTACTED' | 'QUOTED' | 'WON' | 'LOST'; label: string }> = [
  { value: 'NEW', label: 'חדש' },
  { value: 'CONTACTED', label: 'נוצר קשר' },
  { value: 'QUOTED', label: 'נשלחה הצעה' },
  { value: 'WON', label: 'זכייה' },
  { value: 'LOST', label: 'הפסד' },
];

export function LeadStatusChanger({ id, currentStatus }: { id: string; currentStatus: string }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const change = (status: typeof STATUSES[number]['value']) => {
    setErr(null); setMsg(null);
    startTransition(async () => {
      const res = await updateLeadStatus({ id, status });
      if (res?.error) setErr(res.error);
      else setMsg('הסטטוס עודכן');
    });
  };

  return (
    <div className="space-y-1.5">
      {STATUSES.map((s) => (
        <button
          key={s.value}
          type="button"
          disabled={pending}
          onClick={() => change(s.value)}
          className={
            `w-full text-start px-3 py-2.5 rounded-[2px] text-sm font-semibold border transition-colors ` +
            (s.value === currentStatus
              ? 'bg-ink text-paper border-ink'
              : 'bg-paper text-ink border-line hover:border-brass')
          }
        >
          {s.label}
          {s.value === currentStatus && <span className="ms-2 text-xs opacity-70">(נוכחי)</span>}
        </button>
      ))}
      {msg && <p className="mt-2 text-xs text-[var(--color-success)]">{msg}</p>}
      {err && <p className="mt-2 text-xs text-[var(--color-danger)]">{err}</p>}
    </div>
  );
}
