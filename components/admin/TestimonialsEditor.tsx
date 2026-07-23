'use client';

import { useState, useTransition } from 'react';
import { Loader2, Trash2, Plus, Check, Star } from 'lucide-react';
import { upsertTestimonial, deleteTestimonial } from '~/app/actions/admin-content';

interface T {
  id: string;
  name: string;
  city: string | null;
  textHe: string;
  rating: number;
  sourceUrl: string | null;
  order: number;
  published: boolean;
}

export function TestimonialsEditor({ initial }: { initial: T[] }) {
  const [items, setItems] = useState<T[]>(initial);
  const [pending, startTransition] = useTransition();

  const addBlank = () => setItems((arr) => [...arr, {
    id: `__new_${Date.now()}`, name: '', city: null, textHe: '', rating: 5,
    sourceUrl: null, order: (arr[arr.length - 1]?.order ?? 0) + 1, published: false,
  }]);

  return (
    <>
      <ul className="space-y-3 mb-6">
        {items.map((t, i) => (
          <Row
            key={t.id}
            item={t}
            onChange={(n) => setItems((arr) => arr.map((x, j) => (j === i ? n : x)))}
            onDelete={() => {
              if (!t.id.startsWith('__new_') && !confirm('למחוק?')) return;
              startTransition(async () => {
                if (!t.id.startsWith('__new_')) await deleteTestimonial(t.id);
                setItems((arr) => arr.filter((_, j) => j !== i));
              });
            }}
          />
        ))}
      </ul>
      <button type="button" onClick={addBlank} className="inline-flex items-center gap-2 border border-dashed border-line px-4 py-2.5 rounded-[2px] text-sm font-semibold text-ink hover:border-brass hover:text-brass-strong">
        <Plus className="w-4 h-4" /> הוסף המלצה
      </button>
    </>
  );
}

function Row({ item, onChange, onDelete }: { item: T; onChange: (n: T) => void; onDelete: () => void }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const inputClass = 'w-full bg-paper border border-line px-3 py-2 text-sm rounded-[2px] focus:outline focus:outline-2 focus:outline-brass focus:border-brass';

  const save = () => {
    startTransition(async () => {
      await upsertTestimonial({
        id: item.id.startsWith('__new_') ? undefined : item.id,
        name: item.name,
        city: item.city || '',
        textHe: item.textHe,
        rating: item.rating,
        sourceUrl: item.sourceUrl || '',
        order: item.order,
        published: item.published,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
    });
  };

  return (
    <li className="bg-surface border border-line rounded-[2px] p-4 space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input placeholder="שם" value={item.name} onChange={(e) => onChange({ ...item, name: e.target.value })} className={inputClass + ' font-semibold'} />
        <input placeholder="עיר" value={item.city ?? ''} onChange={(e) => onChange({ ...item, city: e.target.value || null })} className={inputClass} />
        <input placeholder="קישור למקור (URL)" dir="ltr" value={item.sourceUrl ?? ''} onChange={(e) => onChange({ ...item, sourceUrl: e.target.value || null })} className={inputClass + ' text-start'} />
      </div>
      <textarea placeholder="טקסט ההמלצה" value={item.textHe} onChange={(e) => onChange({ ...item, textHe: e.target.value })} rows={3} className={inputClass + ' resize-y'} />
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ ...item, rating: n })}
              className="p-0.5"
              aria-label={`${n} כוכבים`}
            >
              <Star className={`w-5 h-5 ${n <= item.rating ? 'fill-brass text-brass' : 'text-muted'}`} strokeWidth={n <= item.rating ? 0 : 1.5} />
            </button>
          ))}
        </div>
        <label className="text-xs inline-flex items-center gap-2">
          <span className="text-muted">סדר:</span>
          <input type="number" value={item.order} onChange={(e) => onChange({ ...item, order: Number(e.target.value) })} className="w-16 bg-paper border border-line px-2 py-1 text-sm rounded-[2px]" />
        </label>
        <label className="text-xs inline-flex items-center gap-2">
          <input type="checkbox" checked={item.published} onChange={(e) => onChange({ ...item, published: e.target.checked })} className="w-4 h-4" />
          <span className="text-ink font-semibold">מפורסם</span>
        </label>
        <div className="grow" />
        <button type="button" onClick={onDelete} className="inline-flex items-center gap-1 text-[var(--color-danger)] text-xs font-semibold hover:underline">
          <Trash2 className="w-3.5 h-3.5" /> מחק
        </button>
        <button type="button" onClick={save} disabled={pending} className="inline-flex items-center gap-1 bg-ink text-paper px-4 py-1.5 text-xs font-semibold rounded-[2px] disabled:opacity-40">
          {saved ? <Check className="w-3.5 h-3.5" /> : pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          {saved ? 'נשמר' : pending ? 'שומר' : 'שמור'}
        </button>
      </div>
    </li>
  );
}
