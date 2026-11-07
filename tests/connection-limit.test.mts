// The per-connection allowance: a one-way daily code per connection, a count of turns under it, and cleanup.
import { connectionKey, connectionCode, recordKey, allowanceReached, addConnectionTurn, cleanupConnectionRecords, turnsFromEnv, DEFAULT_TURNS_PER_CONNECTION } from '../src/lib/connectionLimit.ts';
import { capDay } from '../src/lib/dailyCap.ts';
import { ok } from './helpers.mts';

const makeStore = () => {
  const m = new Map<string, { v: string; e: number }>();
  return {
    async getWithMetadata(k: string) { const x = m.get(k); return x ? { data: x.v, etag: String(x.e) } : null; },
    async set(k: string, v: string, o: any) {
      const x = m.get(k);
      if (o.onlyIfNew && x) return { modified: false };
      if (o.onlyIfMatch && (!x || o.onlyIfMatch !== String(x.e))) return { modified: false };
      m.set(k, { v, e: (x?.e ?? 0) + 1 });
      return { modified: true };
    },
    async list({ prefix }: { prefix: string }) { return { blobs: [...m.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })) }; },
    async delete(k: string) { m.delete(k); },
    keys: () => [...m.keys()],
    put(k: string, v = '1') { m.set(k, { v, e: 1 }); },
  };
};

// Which part of an address counts as one connection.
ok('an IPv4 address is itself', connectionKey('203.0.113.7') === '203.0.113.7');
ok('an invalid or empty address is nothing', connectionKey('999.1.1.1') === null && connectionKey('') === null && connectionKey(undefined) === null && connectionKey('hello') === null && connectionKey('1.2.3') === null);
ok('an IPv6 address is cut to its /64', connectionKey('2001:db8:1:2:aaaa:bbbb:cccc:dddd') === '2001:0db8:0001:0002::/64');
ok('compressed and full forms of the same /64 agree', connectionKey('2001:db8:1:2::1') === connectionKey('2001:0DB8:0001:0002:0:0:0:ffff') && connectionKey('2001:db8:1:2::') === '2001:0db8:0001:0002::/64');
ok('a different /64 is a different connection', connectionKey('2001:db8:1:3::1') !== connectionKey('2001:db8:1:2::1'));
ok('a zone id is ignored', connectionKey('fe80::1%en0') === connectionKey('fe80::1'));
ok('an IPv4-mapped IPv6 address is the IPv4 it wraps', connectionKey('::ffff:203.0.113.7') === '203.0.113.7');
ok('an IPv4 tail on an IPv6 address is read', connectionKey('64:ff9b::1.2.3.4') !== null);
ok('malformed IPv6 is nothing', connectionKey('1:2:3') === null && connectionKey('1::2::3') === null && connectionKey('2001:db8:1:2:3:4:5:6:7') === null && connectionKey('gggg::1') === null);

// The one-way daily code.
const now = new Date('2026-11-07T18:00:00Z');
const code = connectionCode('secret-one', '203.0.113.7', now);
ok('the code is 32 hex characters', /^[0-9a-f]{32}$/.test(code ?? ''));
ok('the same connection and day give the same code', code === connectionCode('secret-one', '203.0.113.7', new Date('2026-11-07T20:00:00Z')));
ok('a new day gives a different code', code !== connectionCode('secret-one', '203.0.113.7', new Date('2026-11-08T18:00:00Z')));
ok('another address gives a different code', code !== connectionCode('secret-one', '203.0.113.8', now));
ok('another secret gives a different code', code !== connectionCode('secret-two', '203.0.113.7', now));
ok('two addresses in the same IPv6 /64 share a code', connectionCode('secret-one', '2001:db8:1:2::1', now) === connectionCode('secret-one', '2001:db8:1:2:9:9:9:9', now));
ok('the code contains neither the address nor the secret', !(code ?? '').includes('203') && !(code ?? '').includes('secret'));
ok('no secret, no address, or a bad address means no code', connectionCode(undefined, '203.0.113.7', now) === null && connectionCode('s', undefined, now) === null && connectionCode('s', 'nonsense', now) === null);

// Turns under a code.
const st = makeStore();
const c = code as string;
ok('a new connection has used nothing', (await allowanceReached(st, c, 10, now)) === false);
for (let i = 0; i < 9; i++) await addConnectionTurn(st, c, now);
ok('nine of ten turns used: not reached', (await allowanceReached(st, c, 10, now)) === false);
await addConnectionTurn(st, c, now);
ok('ten of ten: reached', (await allowanceReached(st, c, 10, now)) === true);
ok('the count is under today only (tomorrow starts fresh)', (await allowanceReached(st, c, 10, new Date('2026-11-08T18:00:00Z'))) === false);
ok('nothing but the day, the code and a number is stored', st.keys().every((k) => k === recordKey(capDay(now), c)) && st.keys().length === 1);
ok('an unreachable store is not an exhausted allowance', (await allowanceReached({ getWithMetadata: async () => { throw new Error('x'); }, set: async () => ({ modified: false }) } as any, c, 1, now)) === false);
ok('adding a turn to an unreachable store does not throw', (await addConnectionTurn({ getWithMetadata: async () => { throw new Error('x'); }, set: async () => ({ modified: false }) } as any, c, now)) === false);

// Cleanup.
const cs = makeStore();
cs.put('c/2026-11-05/aaaa'); cs.put('c/2026-11-06/bbbb'); cs.put('c/2026-11-07/cccc'); cs.put('m/2026-11-05/coach.turn.sent', '9'); cs.put('daily-count', '2026-11-07:3');
const removed = await cleanupConnectionRecords(cs, new Date('2026-11-07T14:00:00Z'));
ok('cleanup deletes every connection record from before today', removed === 2 && !cs.keys().includes('c/2026-11-05/aaaa') && !cs.keys().includes('c/2026-11-06/bbbb'));
ok("it keeps today's records", cs.keys().includes('c/2026-11-07/cccc'));
ok('it never touches the plain totals or the daily counter', cs.keys().includes('m/2026-11-05/coach.turn.sent') && cs.keys().includes('daily-count'));
ok('running it again deletes nothing more', (await cleanupConnectionRecords(cs, new Date('2026-11-07T14:00:00Z'))) === 0);

ok('turns per connection: default 10, parsed from the environment', DEFAULT_TURNS_PER_CONNECTION === 10 && turnsFromEnv(undefined) === 10 && turnsFromEnv('4') === 4 && turnsFromEnv('0') === 10 && turnsFromEnv('x') === 10 && turnsFromEnv('2.5') === 10);
