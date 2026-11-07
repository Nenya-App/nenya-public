import { useCallback, useEffect, useMemo, useState } from 'react';
import { OWNER_TOKEN_KEY } from '../lib/deviceMemory';
import { downloadText } from '../lib/transcript';
import { GROUPS, label } from './labels';
import { csvFilename, totalsCsv } from './exportCsv';

// The owner's page for reading the usage totals (see docs/site-metrics-scope.md). It holds nothing but the owner's own
// token (in this browser only) and a table of plain daily totals fetched from /api/stats. It is not linked from anywhere.

interface Stats {
  generatedAt: string;
  days: string[];
  events: string[];
  counts: Record<string, Record<string, number>>;
  todayTurns?: number;
}

const readToken = (): string => {
  try {
    return localStorage.getItem(OWNER_TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
};

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);

  const load = useCallback(async (t: string, n: number) => {
    if (!t) return;
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch(`/api/stats?days=${n}`, { headers: { 'x-nenya-owner': t }, cache: 'no-store' });
      if (res.status === 401) {
        setStats(null);
        setMessage('That token was not accepted.');
      } else if (!res.ok) {
        setMessage('The numbers could not be read just now. Try again in a moment.');
      } else {
        setStats((await res.json()) as Stats);
      }
    } catch {
      setMessage('The numbers could not be read just now. Try again in a moment.');
    } finally {
      setBusy(false);
    }
  }, []);

  // If the owner's token is already in this browser (from testing the coach), use it at once.
  useEffect(() => {
    const t = readToken();
    if (t) {
      setToken(t);
      void load(t, days);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(() => {
    const out: Record<string, number> = {};
    if (!stats) return out;
    for (const d of stats.days) for (const [e, n] of Object.entries(stats.counts[d] ?? {})) out[e] = (out[e] ?? 0) + n;
    return out;
  }, [stats]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = token.trim();
    if (!t) return;
    try {
      localStorage.setItem(OWNER_TOKEN_KEY, t);
    } catch {
      /* the token just is not remembered */
    }
    void load(t, days);
  };

  const forget = () => {
    try {
      localStorage.removeItem(OWNER_TOKEN_KEY);
    } catch {
      /* nothing to forget */
    }
    setToken('');
    setStats(null);
    setMessage('The token was removed from this browser.');
  };

  const shown = (group: (typeof GROUPS)[number]) =>
    (stats?.events ?? []).filter((e) => group.match(e) && (showEmpty || (totals[e] ?? 0) > 0));

  return (
    <div className="fixed inset-0 overflow-y-auto overflow-x-hidden">
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 text-foreground">
      <header className="space-y-2">
        <h1 className="text-3xl">Nenya numbers</h1>
        <p className="text-sm text-muted-foreground">
          Plain daily totals, for the owner only. They hold no information about who produced them. The day turns over at
          midnight Minnesota time.
        </p>
      </header>

      <form onSubmit={submit} className="flex flex-wrap items-end gap-4" aria-label="Owner token">
        <label className="space-y-1 text-sm">
          <span className="block">Owner token</span>
          <input
            type="password"
            autoComplete="off"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-72 rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="block">Days</span>
          <select
            value={days}
            onChange={(e) => {
              const n = Number(e.target.value);
              setDays(n);
              void load(token.trim(), n);
            }}
            className="rounded-md border border-border bg-background px-3 py-2"
          >
            {[7, 14, 30, 60].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={busy || !token.trim()} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent disabled:opacity-50">
          Show the numbers
        </button>
        <button type="button" onClick={forget} className="rounded-md px-4 py-2 text-sm text-muted-foreground underline underline-offset-4">
          Forget the token on this browser
        </button>
      </form>

      <p role="status" aria-live="polite" className="min-h-5 text-sm text-muted-foreground">
        {busy ? 'Reading the numbers…' : message}
      </p>

      {stats && (
        <section className="space-y-8" aria-label="Totals">
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <span>Read {new Date(stats.generatedAt).toLocaleString()}</span>
            {stats.todayTurns !== undefined && <span>Coach turns counted today, site-wide: {stats.todayTurns}</span>}
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={showEmpty} onChange={(e) => setShowEmpty(e.target.checked)} />
              Show events with no count
            </label>
            <button
              type="button"
              onClick={() => downloadText(csvFilename(stats.days), 'text/csv', totalsCsv(stats))}
              className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-accent"
            >
              Download as a spreadsheet (.csv)
            </button>
          </div>

          {GROUPS.map((g) => {
            const rows = shown(g);
            if (rows.length === 0) return null;
            return (
              <div key={g.title} className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <caption className="pb-2 text-left text-lg">{g.title}</caption>
                  <thead>
                    <tr className="border-b border-border">
                      <th scope="col" className="sticky left-0 bg-background py-2 pr-4 text-left font-normal">
                        Event
                      </th>
                      <th scope="col" className="px-3 py-2 text-right">
                        Total
                      </th>
                      {stats.days.map((d) => (
                        <th key={d} scope="col" className="px-3 py-2 text-right font-normal text-muted-foreground">
                          {d.slice(5)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((e) => (
                      <tr key={e} className="border-b border-border/50">
                        <th scope="row" className="sticky left-0 bg-background py-2 pr-4 text-left font-normal">
                          {label(e)}
                        </th>
                        <td className="px-3 py-2 text-right tabular-nums">{totals[e] ?? 0}</td>
                        {stats.days.map((d) => (
                          <td key={d} className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                            {stats.counts[d]?.[e] ?? '·'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
          {Object.keys(totals).length === 0 && !showEmpty && <p className="text-sm text-muted-foreground">Nothing has been counted in these days.</p>}
        </section>
      )}
    </main>
    </div>
  );
}
