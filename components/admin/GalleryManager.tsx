'use client';

import Image from 'next/image';
import { useState, useTransition, useRef } from 'react';
import { UploadCloud, Star, StarOff, EyeOff, Eye, Trash2, Loader2, Check } from 'lucide-react';
import { uploadGalleryImages, updateGalleryItem, deleteGalleryItem } from '~/app/actions/admin-gallery';
import { cn } from '~/lib/utils';

interface CategoryVM { id: string; slug: string; nameHe: string; }

interface ItemVM {
  id: string;
  imagePath: string;
  blurData: string;
  altHe: string;
  title: string | null;
  width: number;
  height: number;
  featured: boolean;
  published: boolean;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  order: number;
}

export function GalleryManager({ categories, items }: { categories: CategoryVM[]; items: ItemVM[] }) {
  const [tab, setTab] = useState<string>('all');
  const filtered = tab === 'all' ? items : items.filter((i) => i.categorySlug === tab);

  return (
    <>
      <UploadPanel categories={categories} />

      <div className="mt-10 mb-4 flex flex-wrap gap-x-6 gap-y-1 border-b border-line">
        <TabButton label={`הכל (${items.length})`} active={tab === 'all'} onClick={() => setTab('all')} />
        {categories.map((c) => {
          const n = items.filter((i) => i.categorySlug === c.slug).length;
          return <TabButton key={c.slug} label={`${c.nameHe} (${n})`} active={tab === c.slug} onClick={() => setTab(c.slug)} />;
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-line rounded-[2px] text-muted">אין תמונות בקטגוריה זו.</div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <li key={item.id}>
              <ItemCard item={item} categories={categories} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('relative -mb-px pb-3 text-sm font-semibold transition-colors', active ? 'text-ink' : 'text-muted hover:text-ink')}
      aria-pressed={active}
    >
      {label}
      {active && <span className="absolute inset-inline-0 bottom-0 h-0.5 bg-brass" style={{ insetInline: 0 }} />}
    </button>
  );
}

function UploadPanel({ categories }: { categories: CategoryVM[] }) {
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug || '');
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: number; failed: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const upload = (files: FileList | null) => {
    if (!files || files.length === 0 || !categorySlug) return;
    const fd = new FormData();
    fd.set('categorySlug', categorySlug);
    for (const f of Array.from(files)) fd.append('files', f);
    setResult(null);
    startTransition(async () => {
      const res = await uploadGalleryImages(fd);
      setResult(res);
      if (fileRef.current) fileRef.current.value = '';
    });
  };

  return (
    <div className="bg-surface border border-line p-5 rounded-[2px]">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex-1 min-w-[200px]">
          <span className="block text-sm font-semibold text-ink mb-1.5">קטגוריה</span>
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="w-full bg-paper border border-line px-3 py-2.5 text-sm rounded-[2px] focus:outline focus:outline-2 focus:outline-brass focus:border-brass"
          >
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.nameHe}</option>)}
          </select>
        </label>
        <label className="flex-1 min-w-[200px]">
          <span className="block text-sm font-semibold text-ink mb-1.5">קבצים</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            multiple
            onChange={(e) => upload(e.currentTarget.files)}
            className="block w-full text-sm text-muted file:mr-3 file:py-2.5 file:px-4 file:rounded-[2px] file:border-0 file:font-semibold file:bg-ink file:text-paper hover:file:opacity-95 file:cursor-pointer"
          />
        </label>
      </div>
      <p className="text-xs text-muted mt-3">
        קבצים עד 15MB. סוגים: JPG, PNG, WebP, HEIC. תיאור נגישות (alt) יוגדר אוטומטית, מומלץ לערוך אחרי ההעלאה.
      </p>
      {pending && (
        <div className="mt-3 inline-flex items-center gap-2 text-sm text-ink">
          <Loader2 className="w-4 h-4 animate-spin" /> מעלה…
        </div>
      )}
      {result && (
        <div className={cn('mt-3 p-3 rounded-[2px] text-sm', result.failed === 0 ? 'bg-[color-mix(in_srgb,var(--color-success)_10%,var(--color-paper))] text-[var(--color-success)]' : 'bg-[color-mix(in_srgb,var(--color-danger)_10%,var(--color-paper))] text-[var(--color-danger)]')}>
          הועלו {result.ok} תמונות, נכשלו {result.failed}
          {result.errors.length > 0 && (
            <ul className="mt-1 list-disc pr-6">
              {result.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function ItemCard({ item, categories }: { item: ItemVM; categories: CategoryVM[] }) {
  const [alt, setAlt] = useState(item.altHe);
  const [order, setOrder] = useState(item.order);
  const [categoryId, setCategoryId] = useState(item.categoryId);
  const [featured, setFeatured] = useState(item.featured);
  const [published, setPublished] = useState(item.published);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const dirty =
    alt !== item.altHe ||
    order !== item.order ||
    categoryId !== item.categoryId;

  const save = () => {
    startTransition(async () => {
      await updateGalleryItem({ id: item.id, altHe: alt, order, categoryId });
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
    });
  };

  const toggleFeatured = () => {
    const next = !featured;
    setFeatured(next);
    startTransition(async () => { await updateGalleryItem({ id: item.id, featured: next }); });
  };
  const togglePublished = () => {
    const next = !published;
    setPublished(next);
    startTransition(async () => { await updateGalleryItem({ id: item.id, published: next }); });
  };

  const remove = () => {
    if (!confirm('למחוק את התמונה הזו? פעולה לא הפיכה.')) return;
    startTransition(async () => { await deleteGalleryItem(item.id); });
  };

  return (
    <div className={cn('bg-surface border rounded-[2px] overflow-hidden', published ? 'border-line' : 'border-dashed border-muted opacity-60')}>
      <div className="relative aspect-[4/3] bg-ink/5">
        <Image
          src={item.imagePath}
          alt={item.altHe}
          fill
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 100vw"
          placeholder="blur"
          blurDataURL={item.blurData}
          className="object-cover"
        />
        <div className="absolute top-2 inline-start-2 flex gap-1" style={{ insetInlineStart: '0.5rem' }}>
          <button
            type="button"
            onClick={toggleFeatured}
            className={cn('w-8 h-8 grid place-items-center rounded-[2px] backdrop-blur', featured ? 'bg-brass text-paper' : 'bg-ink/70 text-paper hover:bg-ink')}
            aria-pressed={featured}
            aria-label={featured ? 'הסר סימון' : 'סמן כמומלץ'}
            title={featured ? 'מומלץ (מוצג בבית)' : 'סמן כמומלץ'}
          >
            {featured ? <Star className="w-4 h-4" strokeWidth={0} fill="currentColor" /> : <StarOff className="w-4 h-4" strokeWidth={1.5} />}
          </button>
          <button
            type="button"
            onClick={togglePublished}
            className="w-8 h-8 grid place-items-center rounded-[2px] bg-ink/70 text-paper backdrop-blur hover:bg-ink"
            aria-pressed={published}
            aria-label={published ? 'הסתר' : 'פרסם'}
            title={published ? 'פורסם' : 'מוסתר'}
          >
            {published ? <Eye className="w-4 h-4" strokeWidth={1.5} /> : <EyeOff className="w-4 h-4" strokeWidth={1.5} />}
          </button>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">
            תיאור לגוגל (alt)
            <span className="text-brass" title="חשוב לדירוג בגוגל תמונות"> ✱</span>
          </label>
          <input
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            className="w-full bg-paper border border-line px-2 py-1.5 text-sm rounded-[2px]"
          />
        </div>
        <div className="flex gap-2">
          <label className="flex-1">
            <span className="block text-xs font-semibold text-muted mb-1">קטגוריה</span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-paper border border-line px-2 py-1.5 text-sm rounded-[2px]"
            >
              {categories.map((c) => <option key={c.id} value={c.id}>{c.nameHe}</option>)}
            </select>
          </label>
          <label className="w-20">
            <span className="block text-xs font-semibold text-muted mb-1">סדר</span>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="w-full bg-paper border border-line px-2 py-1.5 text-sm rounded-[2px]"
            />
          </label>
        </div>
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="inline-flex items-center gap-1 text-[var(--color-danger)] text-xs font-semibold hover:underline"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /> מחיקה
          </button>
          <button
            type="button"
            onClick={save}
            disabled={pending || !dirty}
            className="inline-flex items-center gap-1 bg-ink text-paper px-3 py-1.5 text-xs font-semibold rounded-[2px] disabled:opacity-40"
          >
            {saved && <Check className="w-3.5 h-3.5" />}
            {pending && !saved && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saved ? 'נשמר' : 'שמור'}
          </button>
        </div>
      </div>
    </div>
  );
}
