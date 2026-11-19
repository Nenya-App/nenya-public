import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkConversation, noticeIntro } from '../src/lib/safetyFlags.ts';
import { STOP_LEAD } from '../src/lib/distressText.ts';

test('a stopped suicide or self-harm message leads with the warmer site-written lead', () => {
  const flag = checkConversation(['I want to die']);
  assert.equal(flag?.tier, 'stop');
  assert.equal(flag?.category, 'self-harm');
  assert.equal(noticeIntro(flag!), STOP_LEAD);
  assert.ok(!/AI systems are not qualified|appears to contain/.test(noticeIntro(flag!)));
});

test('the lead does not replace the notices of other categories or of softened messages', () => {
  const soft = checkConversation(["I've been feeling hopeless lately"]);
  if (soft) assert.notEqual(noticeIntro(soft), STOP_LEAD);
  const abuse = checkConversation(['my partner hits me and I am afraid to go home']);
  if (abuse) assert.notEqual(noticeIntro(abuse), STOP_LEAD);
});
