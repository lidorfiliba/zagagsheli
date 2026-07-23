'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { updateLeadNotes } from '~/app/actions/admin-leads';

export function LeadNotesEditor({ id, initialNotes }: { id: string; initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const save = () => {
    setMsg(null);
    startTransition(async () => {
      await updateLeadNotes({ id, notes });
      setMsg('נשמר');
      setTimeout(() => setMsg(null), 2000);
    });
  };

  return (
    <div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={5}
        className="w-full bg-paper border border-line px-3 py-2.5 text-sm text-ink rounded-[2px] focus:outline focus:outline-2 focus:outline-brass focus:border-brass resize-y"
        placeholder="הערות פנימיות — נראות רק לך."
      />
      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={save}
          disabled={pending || notes === initialNotes}
          className="inline-flex items-center gap-2 bg-ink text-paper px-4 py-2 text-sm font-semibold rounded-[2px] hover:opacity-95 disabled:opacity-50 transition-opacity"
        >
          {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          שמירה
        </button>
        {msg && <span className="text-xs text-[var(--color-success)]">{msg}</span>}
      </div>
    </div>
  );
}
