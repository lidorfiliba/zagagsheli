'use client';

import { useState, useTransition } from 'react';
import { Loader2, Check, ChevronDown } from 'lucide-react';
import { updateService } from '~/app/actions/admin-content';

interface ServiceVM {
  id: string;
  slug: string;
  titleHe: string;
  shortDescHe: string;
  longDescHe: string;
  seoTitle: string | null;
  seoDesc: string | null;
  order: number;
  published: boolean;
}

export function ServicesEditor({ services }: { services: ServiceVM[] }) {
  return (
    <ul className="space-y-4">
      {services.map((s) => <li key={s.id}><ServiceCard service={s} /></li>)}
    </ul>
  );
}

function ServiceCard({ service }: { service: ServiceVM }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(service);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const dirty = (['titleHe', 'shortDescHe', 'longDescHe', 'seoTitle', 'seoDesc', 'order', 'published'] as const)
    .some((k) => (state[k] ?? '') !== (service[k] ?? ''));

  const save = () => {
    startTransition(async () => {
      await updateService({
        id: state.id,
        titleHe: state.titleHe,
        shortDescHe: state.shortDescHe,
        longDescHe: state.longDescHe,
        seoTitle: state.seoTitle || '',
        seoDesc: state.seoDesc || '',
        order: state.order,
        published: state.published,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
    });
  };

  const inputClass = 'w-full bg-paper border border-line px-3 py-2 text-sm rounded-[2px] focus:outline focus:outline-2 focus:outline-brass focus:border-brass';

  return (
    <div className="bg-surface border border-line rounded-[2px]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-start hover:bg-paper transition-colors"
      >
        <div>
          <div className="font-semibold text-ink">{state.titleHe}</div>
          <div className="text-xs text-muted mt-0.5">/{service.slug} · סדר {state.order} · {state.published ? 'פורסם' : 'מוסתר'}</div>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={1.5} />
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-line pt-4 space-y-3">
          <label className="block">
            <span className="block text-xs font-semibold text-muted mb-1">כותרת</span>
            <input value={state.titleHe} onChange={(e) => setState((s) => ({ ...s, titleHe: e.target.value }))} className={inputClass} />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-muted mb-1">תיאור קצר (מוצג בכרטיס בעמוד הבית)</span>
            <textarea value={state.shortDescHe} onChange={(e) => setState((s) => ({ ...s, shortDescHe: e.target.value }))} rows={2} className={inputClass + ' resize-y'} />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-muted mb-1">תיאור מלא (בעמוד השירות)</span>
            <textarea value={state.longDescHe} onChange={(e) => setState((s) => ({ ...s, longDescHe: e.target.value }))} rows={5} className={inputClass + ' resize-y'} />
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label>
              <span className="block text-xs font-semibold text-muted mb-1">SEO — כותרת (title)</span>
              <input value={state.seoTitle ?? ''} onChange={(e) => setState((s) => ({ ...s, seoTitle: e.target.value }))} className={inputClass} />
            </label>
            <label>
              <span className="block text-xs font-semibold text-muted mb-1">SEO — תיאור (meta description)</span>
              <input value={state.seoDesc ?? ''} onChange={(e) => setState((s) => ({ ...s, seoDesc: e.target.value }))} className={inputClass} />
            </label>
            <label>
              <span className="block text-xs font-semibold text-muted mb-1">סדר תצוגה</span>
              <input type="number" value={state.order} onChange={(e) => setState((s) => ({ ...s, order: Number(e.target.value) }))} className={inputClass} />
            </label>
            <label className="flex items-end gap-2 pb-1">
              <input type="checkbox" checked={state.published} onChange={(e) => setState((s) => ({ ...s, published: e.target.checked }))} className="w-5 h-5" />
              <span className="text-sm font-semibold text-ink">מפורסם</span>
            </label>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            {saved && <span className="text-xs text-[var(--color-success)] inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> נשמר</span>}
            <button
              type="button"
              onClick={save}
              disabled={pending || !dirty}
              className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-2 text-sm font-semibold rounded-[2px] disabled:opacity-40"
            >
              {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              שמור
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
