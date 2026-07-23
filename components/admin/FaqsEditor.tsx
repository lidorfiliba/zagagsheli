'use client';

import { useState, useTransition } from 'react';
import { Loader2, Trash2, Plus, Check } from 'lucide-react';
import { upsertFaq, deleteFaq } from '~/app/actions/admin-content';

interface FaqVM {
  id: string;
  questionHe: string;
  answerHe: string;
  order: number;
  published: boolean;
  serviceSlug: string | null;
}

const SERVICE_OPTIONS: Array<[string, string]> = [
  ['', '— כל השירותים —'],
  ['showers', 'מקלחונים'],
  ['railings', 'מעקות'],
  ['mirrors', 'מראות'],
  ['cladding', 'חיפויים'],
  ['bath-screens', 'אמבטיונים'],
  ['custom', 'עבודות מיוחדות'],
];

export function FaqsEditor({ initial }: { initial: FaqVM[] }) {
  const [items, setItems] = useState<FaqVM[]>(initial);
  const [pending, startTransition] = useTransition();

  const addBlank = () => {
    setItems((arr) => [...arr, {
      id: `__new_${Date.now()}`,
      questionHe: '',
      answerHe: '',
      order: (arr[arr.length - 1]?.order ?? 0) + 1,
      published: false,
      serviceSlug: null,
    }]);
  };

  const inputClass = 'w-full bg-paper border border-line px-3 py-2 text-sm rounded-[2px] focus:outline focus:outline-2 focus:outline-brass focus:border-brass';

  return (
    <>
      <ul className="space-y-3 mb-6">
        {items.map((f, i) => (
          <FaqRow
            key={f.id}
            item={f}
            onChange={(next) => setItems((arr) => arr.map((x, j) => (j === i ? next : x)))}
            onDelete={() => {
              if (!f.id.startsWith('__new_') && !confirm('למחוק את השאלה הזו?')) return;
              startTransition(async () => {
                if (!f.id.startsWith('__new_')) await deleteFaq(f.id);
                setItems((arr) => arr.filter((_, j) => j !== i));
              });
            }}
          />
        ))}
      </ul>
      <button
        type="button"
        onClick={addBlank}
        className="inline-flex items-center gap-2 border border-dashed border-line px-4 py-2.5 rounded-[2px] text-sm font-semibold text-ink hover:border-brass hover:text-brass-strong"
      >
        <Plus className="w-4 h-4" /> הוסף שאלה
      </button>
    </>
  );
}

function FaqRow({ item, onChange, onDelete }: { item: FaqVM; onChange: (n: FaqVM) => void; onDelete: () => void }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const inputClass = 'w-full bg-paper border border-line px-3 py-2 text-sm rounded-[2px] focus:outline focus:outline-2 focus:outline-brass focus:border-brass';

  const save = () => {
    startTransition(async () => {
      await upsertFaq({
        id: item.id.startsWith('__new_') ? undefined : item.id,
        questionHe: item.questionHe,
        answerHe: item.answerHe,
        order: item.order,
        published: item.published,
        serviceSlug: item.serviceSlug || '',
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
    });
  };

  return (
    <li className="bg-surface border border-line rounded-[2px] p-4 space-y-2">
      <input
        placeholder="שאלה"
        value={item.questionHe}
        onChange={(e) => onChange({ ...item, questionHe: e.target.value })}
        className={inputClass + ' font-semibold'}
      />
      <textarea
        placeholder="תשובה"
        value={item.answerHe}
        onChange={(e) => onChange({ ...item, answerHe: e.target.value })}
        rows={3}
        className={inputClass + ' resize-y'}
      />
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <label className="text-xs">
          <span className="text-muted me-2">שירות:</span>
          <select
            value={item.serviceSlug ?? ''}
            onChange={(e) => onChange({ ...item, serviceSlug: e.target.value || null })}
            className="bg-paper border border-line px-2 py-1 text-sm rounded-[2px]"
          >
            {SERVICE_OPTIONS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label className="text-xs inline-flex items-center gap-2">
          <span className="text-muted">סדר:</span>
          <input
            type="number"
            value={item.order}
            onChange={(e) => onChange({ ...item, order: Number(e.target.value) })}
            className="w-16 bg-paper border border-line px-2 py-1 text-sm rounded-[2px]"
          />
        </label>
        <label className="text-xs inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={item.published}
            onChange={(e) => onChange({ ...item, published: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-ink font-semibold">מפורסם</span>
        </label>
        <div className="grow" />
        <button type="button" onClick={onDelete} className="inline-flex items-center gap-1 text-[var(--color-danger)] text-xs font-semibold hover:underline">
          <Trash2 className="w-3.5 h-3.5" /> מחק
        </button>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="inline-flex items-center gap-1 bg-ink text-paper px-4 py-1.5 text-xs font-semibold rounded-[2px] disabled:opacity-40"
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          {saved ? 'נשמר' : pending ? 'שומר' : 'שמור'}
        </button>
      </div>
    </li>
  );
}
