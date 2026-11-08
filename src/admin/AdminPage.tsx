import { useCallback, useEffect, useMemo, useState } from 'react';
import { acceptInvite, getUser, handleAuthCallback, login, logout, requestPasswordRecovery, updateUser } from '@netlify/identity';
import { OWNER_TOKEN_KEY } from '../lib/deviceMemory';
import { downloadText } from '../lib/transcript';
import { GROUPS, label } from './labels';
import { csvFilename, totalsCsv } from './exportCsv';

// The owner's page for reading the usage totals (see docs/site-metrics-scope.md). It holds nothing but the owner's own
// token (in this browser only) and a table of plain daily totals fetched from /api/stats. It is not linked from anywhere.
// Two ways in: sign in with the owner account (Netlify Identity, role "Owner"; the sign-in form is our own, so the
// site's strict page policy needs no exceptions), or paste the owner token. The server checks both; this page only asks.

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
  // Sign-in: 'checking' while the page looks, then 'out', 'in', or a link-driven step ('invite' or 'reset').
  const [phase, setPhase] = useState<'checking' | 'out' | 'in' | 'invite' | 'reset'>('checking');
  const [who, setWho] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteToken, setInviteToken] = useState('');

  const load = useCallback(async (t: string, n: number) => {
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch(`/api/stats?days=${n}`, { headers: t ? { 'x-nenya-owner': t } : {}, cache: 'no-store' });
      if (res.status === 401) {
        setStats(null);
        setMessage(t ? 'That token was not accepted.' : 'This account is not the owner account.');
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

  const clearHash = () => {
    try {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch {
      /* the address just keeps its tail */
    }
  };

  // On arrival: handle an invite or password-reset link, then see whether someone is already signed in, then fall back
  // to a token kept in this browser.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cb = await handleAuthCallback();
        if (cancelled) return;
        if (cb?.type === 'invite' && cb.token) {
          clearHash();
          setInviteToken(cb.token);
          setPhase('invite');
          return;
        }
        if (cb?.type === 'recovery') {
          clearHash();
          setPhase('reset');
          return;
        }
        if (cb) clearHash();
      } catch {
        if (!cancelled) setMessage('That link did not work. It may have expired; ask for a new one.');
      }
      let user = null;
      try {
        user = await getUser();
      } catch {
        user = null;
      }
      if (cancelled) return;
      const t = readToken();
      if (t) setToken(t);
      if (user) {
        setWho(user.email ?? '');
        setPhase('in');
        void load(t, days);
      } else {
        setPhase('out');
        if (t) void load(t, days);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const failure = () => setMessage('That did not work. Check the details and try again.');

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setBusy(true);
    setMessage('');
    try {
      const user = await login(email.trim(), password);
      setPassword('');
      setWho(user.email ?? email.trim());
      setPhase('in');
      await load(readToken(), days);
    } catch {
      failure();
      setBusy(false);
    }
  };

  const choosePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 12) {
      setMessage('Use at least 12 characters.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const user = phase === 'invite' ? await acceptInvite(inviteToken, password) : await updateUser({ password });
      setPassword('');
      setInviteToken('');
      setWho(user.email ?? '');
      setPhase('in');
      await load(readToken(), days);
    } catch {
      failure();
      setBusy(false);
    }
  };

  const forgot = async () => {
    if (!email.trim()) {
      setMessage('Type your email address first.');
      return;
    }
    try {
      await requestPasswordRecovery(email.trim());
    } catch {
      /* the same answer either way, so the form says nothing about which addresses exist */
    }
    setMessage('If that address has an account, a reset link is on its way.');
  };

  const signOut = async () => {
    try {
      await logout();
    } catch {
      /* the page signs out regardless */
    }
    setWho('');
    setPhase('out');
    setStats(null);
    setMessage('Signed out.');
  };

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

      {phase === 'checking' && <p className="text-sm text-muted-foreground">Checking…</p>}

      {(phase === 'invite' || phase === 'reset') && (
        <form onSubmit={choosePassword} className="flex flex-wrap items-end gap-4" aria-label="Choose a password">
          <label className="space-y-1 text-sm">
            <span className="block">{phase === 'invite' ? 'Choose a password (12 or more characters)' : 'New password (12 or more characters)'}</span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-72 rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <button type="submit" disabled={busy || !password} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent disabled:opacity-50">
            Save the password and sign in
          </button>
        </form>
      )}

      {phase === 'in' && (
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span>Signed in{who ? ` as ${who}` : ''}.</span>
          <button type="button" onClick={signOut} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent">
            Sign out
          </button>
        </div>
      )}

      {phase === 'out' && (
        <form onSubmit={signIn} className="flex flex-wrap items-end gap-4" aria-label="Sign in">
          <label className="space-y-1 text-sm">
            <span className="block">Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-72 rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="block">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-72 rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <button type="submit" disabled={busy || !email.trim() || !password} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent disabled:opacity-50">
            Sign in
          </button>
          <button type="button" onClick={forgot} className="rounded-md px-4 py-2 text-sm text-muted-foreground underline underline-offset-4">
            Forgot the password
          </button>
        </form>
      )}

      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground">Use the owner token instead</summary>
        <div className="pt-4">
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
        <button type="submit" disabled={busy || !token.trim()} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent disabled:opacity-50">
          Show the numbers
        </button>
        <button type="button" onClick={forget} className="rounded-md px-4 py-2 text-sm text-muted-foreground underline underline-offset-4">
          Forget the token on this browser
        </button>
      </form>
        </div>
      </details>

      <p role="status" aria-live="polite" className="min-h-5 text-sm text-muted-foreground">
        {busy ? 'Reading the numbers…' : message}
      </p>

      {stats && (
        <section className="space-y-8" aria-label="Totals">
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <span>Read {new Date(stats.generatedAt).toLocaleString()}</span>
            <label className="flex items-center gap-2">
              Days shown
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
