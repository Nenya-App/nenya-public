// Paste this whole file into the browser console on the staging coach page (see docs/dev-console-tests.md). It sends real messages to the coach.
window.nc = (() => {
  const token = localStorage.getItem('nenya.coach.ownerToken');
  const session = { color1: '#7a9b9e', color2: '#DAC682' };
  let history = [], ticket;
  const CONFIRMS = /\b(?:is that (?:right|correct|what you (?:mean|meant|feel))|did i (?:get|hear) (?:that )?right|could ["“']?\w[\w -]*["”']? be one of the words|is it (?:also )?possible (?:that )?you(?:'|’)?re feeling|are you saying|is that how you feel|is that the (?:right )?word)\b/i;
  const NAMES = /\b(?:you(?:'|’)re|you are|you must be|you seem to be|sounds like you(?:'|’)re|sounds like you are)\s+(?:really\s+)?feeling\b/i;
  const ONEWORD = /\b(?:one word|a single word)\b/i;
  const WORDSONLY = /^(?:\s*i might (?:be feeling|need) [^.]+\.?)+\s*$/i;
  const flags = (said, reply) => {
    const out = [];
    if (CONFIRMS.test(reply)) out.push('asks them to confirm words they already gave');
    if (NAMES.test(reply)) out.push('names the feeling for them');
    if (ONEWORD.test(reply)) out.push('asks for one word');
    if (WORDSONLY.test(said)) {
      const theirs = [...new Set(said.toLowerCase().replace(/i might (be feeling|need)/g, ' ').match(/[a-z'-]{4,}/g) || [])];
      const echoed = theirs.filter((w) => new RegExp('\\b' + w + '\\b', 'i').test(reply));
      if (echoed.length >= 2) out.push('repeats their words back: ' + echoed.join(', '));
    }
    return out;
  };
  const reset = () => { history = []; ticket = undefined; console.log('new conversation'); };
  async function say(text, extra = {}) {
    history.push({ role: 'user', content: text });
    const res = await fetch('/api/coach', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { 'x-nenya-owner': token } : {}) }, body: JSON.stringify({ messages: history, session, ticket, shown: [], ...extra }) });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { history.pop(); console.warn(res.status, j); return j; }
    ticket = j.ticket; history.push({ role: 'assistant', content: j.reply });
    console.log('%cYou: %c' + text, 'font-weight:bold', '');
    console.log('%cCoach (exchange ' + j.turn + (j.done ? ', last' : '') + '): %c' + j.reply, 'font-weight:bold', '');
    const f = flags(text, j.reply); if (f.length) console.warn('CHECK: ' + f.join('; '));
    if (j.flag) console.info('site flag:', j.flag);
    if (j.card) console.info('site answer card:', j.card.title);
    if (j.offer) console.info('card offered:', j.offer);
    return j;
  }
  const run = async (...texts) => { reset(); for (const t of texts) await say(t); };
  return { say, run, reset };
})();
console.log('Ready. Try: await nc.run("I might be feeling apprehensive. I might need affection.")');
