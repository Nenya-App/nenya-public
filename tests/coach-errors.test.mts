// What the person sees when a coach turn fails: a plain sentence and a line of codes, never a bare "failed", and never
// anything they wrote.
import { describeFailure, failureDetails, failureLine } from '../src/lib/coachErrors.ts';
import { ok } from './helpers.mts';

const d = (i: Parameters<typeof describeFailure>[0]) => describeFailure(i);
ok('the model too slow', /took too long/.test(d({ status: 502, error: 'upstream', reason: 'timeout', ref: 'aabbccdd' }).message));
ok('the model service erroring', /model service had a problem/.test(d({ status: 502, error: 'upstream', reason: 'status-500' }).message));
ok('the private connection failing', /private connection/.test(d({ status: 502, error: 'upstream', reason: 'e2ee-attestation' }).message));
ok('the server not reaching the model', /could not reach the model service/.test(d({ status: 502, error: 'upstream', reason: 'network' }).message));
ok('an empty reply', /empty reply/.test(d({ status: 502, error: 'empty' }).message));
ok('a ticket that does not verify', /could not be verified/.test(d({ status: 400, error: 'ticket' }).message));
ok('the platform rate limit (no body)', d({ status: 429 }).code === 'rate-limit' && /Too many messages/.test(d({ status: 429 }).message));
ok('no connection', d({ network: true }).code === 'network' && /could not reach the site/.test(d({ network: true }).message));
ok('the coach switched off', /switched off/.test(d({ status: 503, error: 'off' }).message));
ok('an unknown code still says something', d({ status: 500, error: 'mystery' }).message === 'Something went wrong.' && d({}).code === 'unknown');
ok('every known code has a sentence of its own', ['upstream', 'empty', 'ticket', 'turns', 'off', 'config', 'origin', 'messages', 'json', 'session', 'context', 'type', 'size'].every((c) => d({ error: c }).message !== 'Something went wrong.'));
const f = { ...d({ status: 502, error: 'upstream', reason: 'status-500', ref: '3fa9c1d2' }), at: '2026-11-05T22:14:09.000Z' };
ok('the line under the message holds status, code, reason, ref and time', failureLine(f) === 'status 502 · upstream · status-500 · ref 3fa9c1d2 · 2026-11-05 22:14 UTC', failureLine(f));
const text = failureDetails(f, 3);
ok('the report has the codes, the turn and the time', /turn: 3/.test(text) && /ref: 3fa9c1d2/.test(text) && /reason: status-500/.test(text) && /2026-11-05T22:14/.test(text));
ok('the report holds no message text (there is none to hold)', !/user|assistant|said/i.test(text.replace('what the person saw', '')));
ok('missing details read "none", not "undefined"', !/undefined/.test(failureDetails(d({ network: true }), 1)));
