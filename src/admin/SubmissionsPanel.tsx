import { useState } from 'react';

// The owner's reading of reports, reflection summaries and contact messages (src/lib/submissions.ts). They are kept in the private store for 90 days and then
// deleted by a daily job; the sender can delete one sooner with their code. Here the owner reads them and can delete one at once (for example after answering,
// or on request). It only calls the owner-only function /api/submissions.

interface Item { id: string; type: string; report: string; comments: string; receivedAt: string; keepUntil: string }

const KIND: Record<string, string> = { 'error-report': 'Report', 'sensory-reflection': 'Reflection summary', 'contact-message': 'Message' };
const day = (iso: string) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export default function SubmissionsPanel({ getToken }: { getToken: () => string }) {
  const [items, setItems] = useState<Item[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const headers = (): Record<string, string> => {
    const t = getToken();
    return { 'Content-Type': 'application/json', ...(t ? { 'x-nenya-owner': t } : {}) };
  };
  const load = async () => {
    setBusy(true);
    setNote('');
    try {
      const res = await fetch('/api/submissions', { headers: headers(), cache: 'no-store' });
      if (res.status === 401) setNote('Not signed in as the owner.');
      else if (!res.ok) setNote('Could not load them. Try again in a moment.');
      else setItems(((await res.json()) as { items: Item[] }).items);
    } catch {
      setNote('Could not load them. Try again in a moment.');
    } finally {
      setBusy(false);
    }
  };
  const remove = async (id: string) => {
    setBusy(true);
    try {
      const res = await fetch('/api/submissions', { method: 'POST', headers: headers(), body: JSON.stringify({ delete: id }), cache: 'no-store' });
      if (res.ok) {
        setItems((cur) => (cur ? cur.filter((x) => x.id !== id) : cur));
        setNote('Deleted.');
      } else setNote('That did not delete. Try again.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <section aria-labelledby="submissions-title" className="space-y-3 rounded-2xl border border-border p-5">
      <h2 id="submissions-title" className="text-xl">Reports and messages</h2>
      <p className="text-sm text-muted-foreground">Kept 90 days, then deleted on their own. The sender can delete one sooner with their code. Delete one here once it is dealt with.</p>
      <button type="button" onClick={load} disabled={busy} className="min-h-11 rounded-md border border-border px-4 text-sm">
        {items ? 'Refresh' : 'Show them'}
      </button>
      {note && <p role="status" className="text-sm">{note}</p>}
      {items && items.length === 0 && <p className="text-sm text-muted-foreground">Nothing kept right now.</p>}
      {items && items.length > 0 && (
        <ul className="space-y-3">
          {items.map((x) => (
            <li key={x.id} className="space-y-2 rounded-lg border border-border p-3 text-sm">
              <p className="text-xs text-muted-foreground">
                {KIND[x.type] ?? x.type} · received {day(x.receivedAt)} · deleted on {day(x.keepUntil)}
              </p>
              <pre className="whitespace-pre-wrap break-words font-sans">{x.report}</pre>
              {x.comments && <pre className="whitespace-pre-wrap break-words font-sans text-muted-foreground">{x.comments}</pre>}
              <button type="button" onClick={() => remove(x.id)} disabled={busy} className="min-h-11 rounded-md border border-border px-3 text-xs">
                Delete now
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
