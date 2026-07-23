'use client';

import { useEffect, useState } from 'react';
import {
  Accessibility, Type, Contrast, Palette, Link2, MousePointer2, PauseCircle,
  RotateCcw, X,
} from 'lucide-react';

const STORAGE_KEY = 'zs-a11y-prefs-v1';

interface Prefs {
  fontScale: 0 | 1 | 2 | 3;   // 0 = 100 %, 1 = 110 %, 2 = 125 %, 3 = 140 %
  highContrast: boolean;
  invertContrast: boolean;
  grayscale: boolean;
  highlightLinks: boolean;
  bigCursor: boolean;
  pauseMotion: boolean;
}

const DEFAULT: Prefs = {
  fontScale: 0,
  highContrast: false,
  invertContrast: false,
  grayscale: false,
  highlightLinks: false,
  bigCursor: false,
  pauseMotion: false,
};

function applyPrefs(p: Prefs) {
  const html = document.documentElement;
  const set = (name: string, on: boolean) => html.classList.toggle(name, on);
  html.classList.remove('a11y-font-md', 'a11y-font-lg', 'a11y-font-xl');
  if (p.fontScale === 1) html.classList.add('a11y-font-md');
  if (p.fontScale === 2) html.classList.add('a11y-font-lg');
  if (p.fontScale === 3) html.classList.add('a11y-font-xl');
  set('a11y-contrast-high', p.highContrast);
  set('a11y-contrast-invert', p.invertContrast);
  set('a11y-grayscale', p.grayscale);
  set('a11y-highlight-links', p.highlightLinks);
  set('a11y-big-cursor', p.bigCursor);
  set('a11y-pause-motion', p.pauseMotion);
}

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = { ...DEFAULT, ...JSON.parse(raw) } as Prefs;
        setPrefs(parsed);
        applyPrefs(parsed);
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch { /* ignore */ }
    applyPrefs(prefs);
  }, [prefs, hydrated]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const patch = <K extends keyof Prefs>(k: K, v: Prefs[K]) => setPrefs((s) => ({ ...s, [k]: v }));
  const reset = () => setPrefs(DEFAULT);
  const anyOn = JSON.stringify(prefs) !== JSON.stringify(DEFAULT);

  return (
    <>
      {/* Floating trigger — bottom-inline-start (RIGHT in RTL), opposite side from WhatsApp */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="פתח תפריט נגישות"
        aria-expanded={open}
        aria-controls="a11y-panel"
        className={
          `fixed z-50 inline-flex items-center justify-center ` +
          `w-14 h-14 md:w-16 md:h-16 rounded-full bg-brass text-white ` +
          `shadow-[0_6px_20px_-4px_rgba(0,0,0,0.25)] ` +
          `transition-all duration-200 hover:scale-[1.06] focus-visible:scale-[1.06] ` +
          `focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass focus-visible:outline-offset-2`
        }
        style={{
          bottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
          insetInlineStart: 'max(1rem, env(safe-area-inset-left, 1rem))',
        }}
      >
        <Accessibility className="w-7 h-7 md:w-8 md:h-8" strokeWidth={1.5} aria-hidden="true" />
        {anyOn && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[var(--color-danger)] border-2 border-paper" aria-label="הגדרות נגישות פעילות" />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="a11y-title"
          id="a11y-panel"
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-ink/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-surface md:m-4 md:rounded-[2px] border-t md:border border-line p-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 id="a11y-title" className="text-xl font-bold text-ink">כלי נגישות</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="סגור" className="p-2 -m-2 rounded hover:bg-line">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <p className="text-sm text-muted mb-5">
              הגדרותיך נשמרות במכשיר זה בלבד.
            </p>

            {/* Font size */}
            <fieldset className="mb-5">
              <legend className="flex items-center gap-2 text-sm font-semibold text-ink mb-2">
                <Type className="w-4 h-4" strokeWidth={1.5} /> גודל טקסט
              </legend>
              <div className="grid grid-cols-4 gap-2">
                {(['רגיל', 'גדול', 'גדול+', 'ענק'] as const).map((label, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => patch('fontScale', i as Prefs['fontScale'])}
                    aria-pressed={prefs.fontScale === i}
                    className={
                      `border p-2.5 text-sm font-medium rounded-[2px] transition-colors ` +
                      (prefs.fontScale === i
                        ? 'bg-ink text-paper border-ink'
                        : 'bg-paper text-ink border-line hover:border-brass')
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Toggles */}
            <fieldset className="space-y-2 mb-6">
              <Toggle icon={<Contrast className="w-4 h-4" strokeWidth={1.5} />} label="ניגודיות גבוהה" checked={prefs.highContrast} onChange={(v) => patch('highContrast', v)} />
              <Toggle icon={<Contrast className="w-4 h-4" strokeWidth={1.5} />} label="ניגודיות הפוכה (רקע כהה)" checked={prefs.invertContrast} onChange={(v) => patch('invertContrast', v)} />
              <Toggle icon={<Palette className="w-4 h-4" strokeWidth={1.5} />} label="גווני אפור" checked={prefs.grayscale} onChange={(v) => patch('grayscale', v)} />
              <Toggle icon={<Link2 className="w-4 h-4" strokeWidth={1.5} />} label="הדגשת קישורים" checked={prefs.highlightLinks} onChange={(v) => patch('highlightLinks', v)} />
              <Toggle icon={<MousePointer2 className="w-4 h-4" strokeWidth={1.5} />} label="סמן גדול" checked={prefs.bigCursor} onChange={(v) => patch('bigCursor', v)} />
              <Toggle icon={<PauseCircle className="w-4 h-4" strokeWidth={1.5} />} label="עצור אנימציות" checked={prefs.pauseMotion} onChange={(v) => patch('pauseMotion', v)} />
            </fieldset>

            <button
              type="button"
              onClick={reset}
              disabled={!anyOn}
              className="w-full flex items-center justify-center gap-2 border border-line px-4 py-3 rounded-[2px] font-semibold text-ink hover:border-brass transition-colors disabled:opacity-40"
            >
              <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
              איפוס להגדרות ברירת מחדל
            </button>

            <p className="mt-4 text-xs text-muted text-center">
              לפרטים נוספים או לפניה בנושא נגישות: <a href="/accessibility" className="text-ink font-semibold underline decoration-brass underline-offset-4">הצהרת הנגישות המלאה</a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function Toggle({ icon, label, checked, onChange }: { icon: React.ReactNode; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between p-3 border border-line rounded-[2px] cursor-pointer hover:border-brass transition-colors">
      <span className="flex items-center gap-2 text-sm font-medium text-ink">{icon} {label}</span>
      <span className="relative inline-flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="w-10 h-6 bg-line rounded-full peer-checked:bg-brass transition-colors" />
        <span className="absolute inline-start-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4 rtl:peer-checked:-translate-x-4" />
      </span>
    </label>
  );
}
