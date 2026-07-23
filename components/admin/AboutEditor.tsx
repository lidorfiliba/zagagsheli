'use client';

import { useState, useTransition } from 'react';
import { marked } from 'marked';
import { Loader2, Check } from 'lucide-react';
import { updateAbout } from '~/app/actions/admin-content';

export function AboutEditor({ initialBody, initialPhoto }: { initialBody: string; initialPhoto: string }) {
  const [body, setBody] = useState(initialBody);
  const [photo, setPhoto] = useState(initialPhoto);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const dirty = body !== initialBody || photo !== initialPhoto;

  const save = () => {
    startTransition(async () => {
      await updateAbout({ bodyHe: body, ownerPhoto: photo });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    });
  };

  const html = marked.parse(body, { async: false }) as string;

  return (
    <div className="space-y-6">
      <label className="block">
        <span className="block text-xs font-semibold text-muted mb-1">נתיב לתמונת בעלים (Public URL)</span>
        <input
          value={photo}
          onChange={(e) => setPhoto(e.target.value)}
          dir="ltr"
          placeholder="/uploads/brand/photo.webp"
          className="w-full bg-paper border border-line px-3 py-2 text-sm rounded-[2px] focus:outline focus:outline-2 focus:outline-brass focus:border-brass text-start"
        />
        <span className="text-xs text-muted mt-1 block">
          העלה תמונה דרך /admin/gallery (קטגוריה כלשהי) והדבק כאן את הנתיב.
        </span>
      </label>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-xs font-semibold text-muted mb-1">תוכן (Markdown)</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={22}
            className="w-full bg-paper border border-line px-3 py-2.5 text-sm rounded-[2px] focus:outline focus:outline-2 focus:outline-brass focus:border-brass resize-y font-mono"
          />
        </label>
        <div>
          <div className="text-xs font-semibold text-muted mb-1">תצוגה מקדימה</div>
          <div
            className="bg-surface border border-line p-4 rounded-[2px] min-h-[400px] leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pr-6 [&_ul]:mb-3 [&_li]:mb-1"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-xs text-[var(--color-success)] inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> נשמר</span>}
        <button
          type="button"
          onClick={save}
          disabled={pending || !dirty}
          className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-2.5 rounded-[2px] font-semibold disabled:opacity-40"
        >
          {pending && <Loader2 className="w-4 h-4 animate-spin" />}
          שמור
        </button>
      </div>
    </div>
  );
}
