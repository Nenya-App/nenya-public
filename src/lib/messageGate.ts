// A message that is too short or unclear to work with is not sent on, and uses no turn: the person is asked, kindly, to say it again. This is a form check, not a safety check: it is run only when
// no safety flag applies (a crisis or distress message, however short or oddly spelled, always goes through its own checks first), and it never judges what is said, only whether there are words to
// read. It is simple and it can be wrong: it errs toward letting a message through. The same check runs on the page (so nothing is sent) and on the server (which is the one that counts).
export type FormProblem = 'short' | 'unclear';

export const SHORT_NOTICE = 'That is a little short for the coach to work with. Could you say a few more words about what is going on? This did not use up one of your turns.';
export const UNCLEAR_NOTICE = 'I could not make out words in that. It may be a typo or a slip of the keys. Could you write it again? This did not use up one of your turns.';

const VOWEL = /[aeiouyàáâäãåæèéêëìíîïòóôöõøùúûüýÿœ]/i;
// Runs of keys side by side on a keyboard row, either way: the signature of a slipped hand.
const MASH = /(?:qwer|wert|erty|rtyu|tyui|yuio|uiop|asdf|sdfg|dfgh|fghj|ghjk|hjkl|zxcv|xcvb|cvbn|vbnm|rewq|trew|ytre|uytr|iuyt|oiuy|poiu|fdsa|gfds|hgfd|jhgf|kjhg|lkjh|vcxz|bvcx|nbvc|mnbv)/i;
// Scripts written without spaces between words, or without the vowel rules used below: only the length is checked for them.
const SPACELESS = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}]/u;

function wordlike(token: string): boolean {
  const letters = token.replace(/[^\p{L}]/gu, '');
  if (!letters) return false;
  if (letters.length <= 3) return true; // "my", "hm", "ok", "I'm": short words are allowed whatever their letters
  if (/(.)\1{3,}/iu.test(letters)) return false; // aaaaaa
  if (MASH.test(letters)) return false; // asdfgh
  if (!VOWEL.test(letters)) return false; // no vowel at all
  if (/[^aeiouyàáâäãåæèéêëìíîïòóôöõøùúûüýÿœ\P{L}]{7,}/iu.test(letters)) return false; // a very long run of consonants
  return true;
}

/** null when the message has words to read; otherwise what is wrong with it. */
export function checkMessageForm(text: string): FormProblem | null {
  const t = text.trim();
  const letters = (t.match(/\p{L}/gu) ?? []).length;
  if (SPACELESS.test(t)) return letters >= 4 ? null : 'short';
  const tokens = t.split(/\s+/).filter((x) => /\p{L}/u.test(x));
  if (tokens.length < 2 || letters < 5) return 'short';
  // Gibberish is only judged in the Latin alphabet, where the rules above are meaningful: in other alphabets only the length counts.
  const latin = (t.match(/\p{Script=Latin}/gu) ?? []).length;
  if (latin < letters * 0.9) return null;
  const good = tokens.filter(wordlike).length;
  if (good < 2 || good < tokens.length / 2) return 'unclear';
  return null;
}
