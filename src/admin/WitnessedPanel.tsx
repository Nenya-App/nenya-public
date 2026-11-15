import { useState } from 'react';
import type { PublicItem } from '../lib/publicCopy';
import { nearDuplicates, type NearPair, type OverlapMsg } from '../lib/nearDuplicates.ts';

// The owner's side of two things (docs/transcript-consent-scope.md):
//  1. Reading, editing and approving the anonymized copies people allowed us to show on the "witnessed conversations" page. Nothing goes up without this.
//  2. The deletions software could not finish, which the owner does by hand and then marks done here.
// It only calls the owner-only function /api/witnessed-review; the server checks who is asking.

interface Pending { hash: string; receivedAt: string; draft: { items: PublicItem[]; replaced: number; softFlags: string[] } }
interface Waiting { hash: string; receivedAt: string; status: string; keepUntil: string | null; todo: string[] }
interface Inbox { hash: string; receivedAt: string; readable: string; note: string; permissions: string; keepUntil: string | null; issuedRecord: string; signed: unknown; overlaps?: Overlap[]; overlapCheck?: 'failed' }
interface Overlap { hash: string; sameUpTo?: number; sameMessages?: number[] }

const short = (h: string) => h.slice(0, 12);
const overlapWords = (o: Overlap) => [o.sameUpTo ? `the same conversation up to message ${o.sameUpTo}` : '', o.sameMessages?.length ? `the same words in message${o.sameMessages.length === 1 ? '' : 's'} ${o.sameMessages.join(', ')}` : ''].filter(Boolean).join('; ');
const messagesOf = (signed: unknown): OverlapMsg[] => { const m = (signed as { transcript?: { messages?: unknown } })?.transcript?.messages; return Array.isArray(m) ? (m as OverlapMsg[]) : []; };

const WRITER: Record<PublicItem['by'], string> = { person: 'The person', ai: 'The AI', site: 'The site (not the AI)' };

export default function WitnessedPanel({ getToken }: { getToken: () => string }) {
  const [pending, setPending] = useState<Pending[] | null>(null);
  const [waiting, setWaiting] = useState<Waiting[] | null>(null);
  const [inbox, setInbox] = useState<Inbox[] | null>(null);
  const [edits, setEdits] = useState<Record<string, PublicItem[]>>({});
  const [read, setRead] = useState<Record<string, boolean>>({});
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [near, setNear] = useState<NearPair[] | null>(null);

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
      const c = await post({ action: 'inbox' });
      if (a.status === 401 || b.status === 401 || c.status === 401) return setNote('Not signed in as the owner.');
      if (a.status !== 200 || b.status !== 200 || c.status !== 200) return setNote('That could not be read just now.');
      setInbox(c.json.items);
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

  const deleteReceived = async (hash: string) => {
    setBusy(true);
    try {
      const r = await post({ action: 'inbox-delete', hash });
      if (r.status === 200) {
        setNote('Deleted: every copy we held is gone. Only a marker with the fingerprint and the date remains.');
        setInbox((i) => (i ?? []).filter((x) => x.hash !== hash));
        setWaiting((w) => (w ?? []).filter((x) => x.hash !== hash));
      } else setNote('That could not be deleted just now. Try again in a moment.');
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
      setNote(`Ran the deletion job: ${r.json.deleted} deleted, ${r.json.manual} still waiting.`);
      await load();
    } finally {
      setBusy(false);
    }
  };

  // Overlaps are recorded on the later submission when it arrives; the earlier one learns of them here, from the later one's record.
  const overlapsFor = (hash: string): { other: string; words: string; later: boolean }[] => {
    const out: { other: string; words: string; later: boolean }[] = [];
    for (const t of inbox ?? []) {
      if (t.hash === hash) for (const o of t.overlaps ?? []) out.push({ other: o.hash, words: overlapWords(o), later: false });
      else for (const o of t.overlaps ?? []) if (o.hash === hash) out.push({ other: t.hash, words: overlapWords(o) + ' (numbers are in the other submission)', later: true });
    }
    return out;
  };
  const checkNear = () => setNear(nearDuplicates((inbox ?? []).map((t) => ({ hash: t.hash, messages: messagesOf(t.signed) }))));

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

      {inbox && (
        <div className="space-y-3">
          <h3 className="text-lg">Transcripts people sent ({inbox.length})</h3>
          <p className="text-sm text-muted-foreground">These hold the conversation, so they are read only here. The notification email carries just the fingerprint and the person&rsquo;s choices. Each is deleted on the day its owner chose, or sooner by you.</p>
          <p className="text-sm text-muted-foreground">
            A conversation can be signed after any exchange, so one person may send copies signed at different points. Each copy is its own submission with its own permissions and its
            own deletion. Overlaps are flagged below for your information only; nothing is merged or narrowed because of them.
          </p>
          {inbox.length === 0 && <p className="text-sm text-muted-foreground">Nothing has been sent.</p>}
          {inbox.length > 1 && (
            <div className="space-y-2 rounded-xl border border-border p-3 text-sm">
              <button type="button" onClick={checkNear} className="rounded-md border border-border px-3 py-1.5 hover:bg-accent">Look for possible near-duplicates</button>
              <p className="text-xs text-muted-foreground">Compares the person&rsquo;s own words across the transcripts listed here, in this browser, for runs of the same six words. It only flags; it may be wrong both ways.</p>
              {near && (near.length === 0
                ? <p className="text-xs" role="status">No possible near-duplicates found.</p>
                : <ul role="status" className="list-disc pl-5 text-xs">{near.map((n) => <li key={n.a + n.b}>{short(n.a)} and {short(n.b)}: {n.shared} shared run{n.shared === 1 ? '' : 's'} of words</li>)}</ul>)}
            </div>
          )}
          {inbox.map((t) => (
            <article key={t.hash} className="space-y-2 rounded-xl border border-border p-4 text-sm">
              <p className="text-xs text-muted-foreground">Fingerprint {t.hash.slice(0, 12)} · received {new Date(t.receivedAt).toLocaleDateString()} · {t.keepUntil ? `deleted on ${new Date(t.keepUntil).toLocaleDateString()}` : 'kept until the person asks'} · log: {t.issuedRecord}</p>
              <p>{t.permissions}</p>
              {t.overlapCheck === 'failed' && <p className="text-xs text-muted-foreground">The overlap check could not run when this arrived.</p>}
              {overlapsFor(t.hash).length > 0 && (
                <div className="rounded-md border border-amber-500/60 bg-amber-500/10 p-2 text-xs">
                  <p className="font-medium">Possible duplicate: shares messages with other submissions (each keeps its own permissions)</p>
                  <ul className="list-disc pl-5">{overlapsFor(t.hash).map((o) => <li key={o.other}>{short(o.other)}{o.later ? ', sent later' : ', sent earlier'}: {o.words}{(inbox ?? []).some((x) => x.hash === o.other) ? '' : ' (no longer held)'}</li>)}</ul>
                </div>
              )}
              {t.note && <p><span className="font-medium">Their note: </span>{t.note}</p>}
              <details>
                <summary className="cursor-pointer underline underline-offset-4">Read the transcript</summary>
                <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-2 text-xs">{t.readable}</pre>
              </details>
              <details>
                <summary className="cursor-pointer underline underline-offset-4">The signed file (to check at /verify)</summary>
                <textarea readOnly className="mt-2 h-32 w-full rounded-md border border-border bg-background p-2 text-xs" value={JSON.stringify(t.signed)} />
              </details>
              <button type="button" disabled={busy} onClick={() => void deleteReceived(t.hash)} className="rounded-md border border-border px-3 py-1.5 hover:bg-accent disabled:opacity-50">Delete now</button>
            </article>
          ))}
        </div>
      )}

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
              {overlapsFor(p.hash).length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Some of these messages are also in {overlapsFor(p.hash).map((o) => short(o.other)).join(', ')}, which may have been sent with different permissions. Each submission is
                  independent: this decision covers only this one. The overlap is listed under Transcripts people sent.
                </p>
              )}
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
              </p>
              <ul className="list-disc pl-5">{w.todo.map((t) => <li key={t}>{t}</li>)}</ul>
              <button type="button" disabled={busy} onClick={() => void markDeleted(w.hash)} className="rounded-md border border-border px-3 py-1.5 hover:bg-accent disabled:opacity-50">Delete the copies now</button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
