import { useState } from 'react';
import type { PublicItem } from '../lib/publicCopy';

// The owner's side of two things (docs/transcript-consent-scope.md):
//  1. Reading, editing and approving the anonymized copies people allowed us to show on the "witnessed conversations" page. Nothing goes up without this.
//  2. The deletions software could not finish, which the owner does by hand and then marks done here.
// It only calls the owner-only function /api/witnessed-review; the server checks who is asking.

interface Pending { hash: string; receivedAt: string; draft: { items: PublicItem[]; replaced: number; softFlags: string[] } }
interface Waiting { hash: string; receivedAt: string; status: string; keepUntil: string | null; submissionId: string | null; todo: string[] }

const WRITER: Record<PublicItem['by'], string> = { person: 'The person', ai: 'The AI', site: 'The site (not the AI)' };

export default function WitnessedPanel({ getToken }: { getToken: () => string }) {
  const [pending, setPending] = useState<Pending[] | null>(null);
  const [waiting, setWaiting] = useState<Waiting[] | null>(null);
  const [edits, setEdits] = useState<Record<string, PublicItem[]>>({});
  const [read, setRead] = useState<Record<string, boolean>>({});
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const post = async (body: object): Promise<{ status: number; json: any }> => {
    const t = getToken();
    const res = await fetch('/api/witnessed-review', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(t ? { 'x-nenya-owner': t } : {}) }, body: JSON.stringify(body), cache: 'no-store' });
    return { status: res.status, json: await res.json().catch(() => ({})) };
  };

  const load = async () => {
    setBusy(true);
    setNote('');
    try {
      const a = await post({ action: 'list' });
      const b = await post({ action: 'deletions' });
      if (a.status === 401 || b.status === 401) return setNote('Not signed in as the owner.');
      if (a.status !== 200 || b.status !== 200) return setNote('That could not be read just now.');
      setPending(a.json.pending);
      setWaiting(b.json.waiting);
      setEdits(Object.fromEntries((a.json.pending as Pending[]).map((p) => [p.hash, p.draft.items])));
      setRead({});
    } finally {
      setBusy(false);
    }
  };

  const decide = async (hash: string, action: 'approve' | 'reject') => {
    setBusy(true);
    try {
      const r = await post(action === 'approve' ? { action, hash, items: edits[hash] } : { action, hash });
      if (r.status === 422) setNote(r.json.error === 'still-identifying' ? 'Something in that text still looks like a name, email, phone number or address. Take it out, then approve again.' : 'The text is not in a form that can be shown (every message needs text, up to 10 messages).');
      else if (r.status !== 200) setNote('That did not go through.');
      else {
        setNote(action === 'approve' ? 'Approved. It is on the public page now.' : 'Not shown. The waiting copy is deleted.');
        setPending((p) => (p ?? []).filter((x) => x.hash !== hash));
      }
    } finally {
      setBusy(false);
    }
  };

  const markDeleted = async (hash: string) => {
    setBusy(true);
    try {
      const r = await post({ action: 'mark-deleted', hash });
      if (r.status === 200) {
        setNote('Marked deleted.');
        setWaiting((w) => (w ?? []).filter((x) => x.hash !== hash));
      } else setNote('That could not be marked.');
    } finally {
      setBusy(false);
    }
  };

  const runJob = async () => {
    setBusy(true);
    try {
      const r = await post({ action: 'run-deletions' });
      if (r.status !== 200) return setNote('The deletion job could not be run just now.');
      setNote(`Ran the deletion job: ${r.json.deleted} deleted, ${r.json.manual} waiting for a hand. The Netlify token is ${r.json.tokenSet ? 'set' : 'NOT set, so nothing can be deleted automatically'}.`);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const setText = (hash: string, i: number, text: string) => setEdits((e) => ({ ...e, [hash]: e[hash].map((x, k) => (k === i ? { ...x, text } : x)) }));
  const dropItem = (hash: string, i: number) => setEdits((e) => ({ ...e, [hash]: e[hash].filter((_, k) => k !== i) }));

  return (
    <section className="space-y-6" aria-label="Witnessed conversations and deletions">
      <div className="space-y-2">
        <h2 className="text-xl">Witnessed conversations and deletions</h2>
        <p className="text-sm text-muted-foreground">
          People can allow a conversation to be shown, without their name, on a public page. The site has already removed names and contact details; you read and edit every
          one by hand before anything is shown. A conversation where the safety check stopped a message never reaches you. Deletions the software could not finish wait in the second list.
        </p>
        <button type="button" onClick={() => void load()} disabled={busy} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50">{pending ? 'Refresh' : 'Load'}</button>
        <p role="status" aria-live="polite" className="min-h-5 text-sm text-muted-foreground">{note}</p>
      </div>

      {pending && (
        <div className="space-y-4">
          <h3 className="text-lg">Waiting to be read ({pending.length})</h3>
          {pending.length === 0 && <p className="text-sm text-muted-foreground">Nothing is waiting.</p>}
          {pending.map((p) => (
            <article key={p.hash} className="space-y-3 rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground">
                Fingerprint {p.hash.slice(0, 12)} · received {new Date(p.receivedAt).toLocaleDateString()} · the site replaced {p.draft.replaced} more thing{p.draft.replaced === 1 ? '' : 's'} just now
                {p.draft.softFlags.length ? ` · softer safety flags in this conversation: ${p.draft.softFlags.join(', ')} (read it closely)` : ''}
              </p>
              {(edits[p.hash] ?? []).map((it, i) => (
                <div key={i} className="space-y-1">
                  <label className="block text-xs font-medium" htmlFor={`${p.hash}-${i}`}>{WRITER[it.by]}</label>
                  <textarea id={`${p.hash}-${i}`} className="w-full rounded-md border border-border bg-background p-2 text-sm" rows={Math.min(8, Math.max(2, Math.ceil(it.text.length / 90)))} value={it.text} onChange={(e) => setText(p.hash, i, e.target.value)} />
                  <button type="button" className="text-xs underline underline-offset-4" onClick={() => dropItem(p.hash, i)}>Leave this message out</button>
                </div>
              ))}
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1 size-4" checked={!!read[p.hash]} onChange={(e) => setRead((r) => ({ ...r, [p.hash]: e.target.checked }))} />
                <span>I read every message. Nothing in it could identify the person or anyone they mention, and it is safe for the person to have this public.</span>
              </label>
              <div className="flex gap-3">
                <button type="button" disabled={busy || !read[p.hash] || !(edits[p.hash] ?? []).length} onClick={() => void decide(p.hash, 'approve')} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50">Approve and show</button>
                <button type="button" disabled={busy} onClick={() => void decide(p.hash, 'reject')} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50">Do not show</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {waiting && (
        <div className="space-y-3">
          <h3 className="text-lg">Deletions waiting for a hand ({waiting.length})</h3>
          <button type="button" disabled={busy} onClick={() => void runJob()} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50">Run the deletion job now</button>
          {waiting.length === 0 && <p className="text-sm text-muted-foreground">Nothing is waiting.</p>}
          {waiting.map((w) => (
            <article key={w.hash} className="space-y-2 rounded-xl border border-border p-4 text-sm">
              <p className="text-xs text-muted-foreground">
                Fingerprint {w.hash.slice(0, 12)} · received {new Date(w.receivedAt).toLocaleDateString()} · {w.status === 'deletion-requested' ? 'the person asked for it to be deleted' : 'its keeping time has passed'}
                {w.submissionId ? ` · submission ${w.submissionId}` : ' · submission id not recorded'}
              </p>
              <ul className="list-disc pl-5">{w.todo.map((t) => <li key={t}>{t}</li>)}</ul>
              <button type="button" disabled={busy} onClick={() => void markDeleted(w.hash)} className="rounded-md border border-border px-3 py-1.5 hover:bg-accent disabled:opacity-50">I did these: mark deleted</button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
