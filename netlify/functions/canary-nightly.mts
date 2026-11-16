// The nightly canary's alarm clock (docs/canary-scope.md). A scheduled function may run only briefly, so all it does is knock on the background
// function that does the work (up to 15 minutes). Off unless COACH_CANARY=on. It holds no content and reads no visitor data.
import { canaryKey } from '../../src/lib/canaryBudget.ts';

export default async (): Promise<Response> => {
  const secret = process.env.COACH_TICKET_SECRET;
  if (process.env.COACH_CANARY !== 'on' || !secret || !process.env.URL) return new Response(null, { status: 204 });
  try {
    const res = await fetch(`${process.env.URL}/.netlify/functions/canary-run-background`, { method: 'POST', headers: { 'x-canary-key': canaryKey(secret) } });
    console.log(`canary-nightly: started (${res.status})`);
    return new Response(null, { status: 204 });
  } catch {
    console.error('canary-nightly: could not start');
    return new Response(null, { status: 500 });
  }
};

// Literal values on purpose: Netlify reads this block by static analysis. 23:30 UTC, half an hour before Workers AI's daily allowance resets.
export const config = {
  schedule: '30 23 * * *',
};
