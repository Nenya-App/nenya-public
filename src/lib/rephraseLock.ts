// Locking what was meant (docs/dyad-rephrase-scope.md, section 6). When the speaker sends the phrase, it carries a commitment to
// the speaker's marks and rewrite (an HMAC under a random key that stays on the speaker's device). The later reveal carries the
// key, and the hearer's device checks it. It shows that "what I meant" was fixed before the hearer marked; it is about trust
// between the two people, not secrecy, and it does not change what the mailbox can see. Built on the browser's WebCrypto only.
import { b64, unb64 } from './cellCrypto.ts';
import type { Mark } from './rephraseKinds.ts';
import type { Slider } from './rephraseProtocol.ts';

export interface MeantCore {
  marks: Mark[];
  rewrite?: string;
  sliders?: Slider[];
}
const enc = new TextEncoder();
const canonical = (m: MeantCore): Uint8Array => enc.encode(JSON.stringify({ marks: m.marks, rewrite: m.rewrite ?? null, sliders: m.sliders ?? null }));
async function mac(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const k = await globalThis.crypto.subtle.importKey('raw', key as BufferSource, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await globalThis.crypto.subtle.sign('HMAC', k, data as BufferSource));
}
export async function makeLock(m: MeantCore): Promise<{ lock: string; key: string }> {
  const key = globalThis.crypto.getRandomValues(new Uint8Array(32));
  return { lock: b64(await mac(key, canonical(m))), key: b64(key) };
}
export async function checkLock(m: MeantCore, key: string, lock: string): Promise<boolean> {
  try {
    const want = await mac(unb64(key), canonical(m));
    const got = unb64(lock);
    let d = want.length ^ got.length;
    for (let i = 0; i < want.length; i++) d |= want[i] ^ (got[i] ?? 0);
    return d === 0;
  } catch {
    return false;
  }
}
