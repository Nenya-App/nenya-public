// Review notes for the pre-written answers (src/lib/aboutNenya.ts): where the pages and the Terms disagree, and how lessons reuse the answers.
// Documents only; nothing here ships.
// Where the pages or the Terms disagree with each other or with the code. Found while writing the answers above; none is changed yet. The
// answers follow the Terms. Each needs a decision (and a Terms or About edit) before the answers and the pages can both be true.
export const DISCREPANCIES: { id: string; where: string; says: string; but: string; suggest: string }[] = [
  { id: 'd1', where: 'Our Structure (core commitments), Support Us', says: '"The core tool is and will remain free. No paywalls, no premium tiers" and "free to use without … data collection"', but: 'Paid tiers are tabled, not ruled out (docs/coach-lenses-scope.md), and the Terms describe host logs, daily totals and a one-way daily code, so "no data collection" is not exact.', suggest: 'Say what is true today ("is free", "collects no data from what you enter") and drop "will remain" until it is a promise you intend to keep.' },
  { id: 'd2', where: 'Our Privacy Promise ("The Academic Mandate")', says: '"Nenya is a Large Language Model (LLM) and a computational tool"', but: 'The site is not an LLM; only the optional coach uses one, run by Venice AI.', suggest: 'Reword: the coach demo uses an AI language model run by an outside service; the rest of the site does not.' },
  { id: 'd3', where: 'Terms, Section 21', says: 'The coach uses "a model that Venice labels Private"', but: 'The code runs an encrypted Venice model, documented in the README, and the Terms never say "encrypted".', suggest: 'Settle the exact wording (for example "Venice relays only encrypted data", never "end-to-end from your device") and put it in the Terms, then the model-type answer follows.' },
  { id: 'd4', where: 'Terms, Section 21', says: 'Page-written text is only "the opening greeting and the closing message"', but: 'The site also writes safety notices, the distress and self-injury sentences (switch off in production), and soon the pause screen and fixed answers.', suggest: 'List every kind of site-written text in Section 21 before switching the distress sentences on.' },
  { id: 'd5', where: 'Chat with Nenya\'s AI on Venice', says: 'The character is "trained in NVC+ principles"', but: 'The page itself also says it is "set up with a custom prompt"; a language model given instructions is not trained by them.', suggest: 'Say "set up with a custom prompt based on NVC+ principles".' },
  { id: 'd6', where: 'Contact Us', says: '"We aim to respond to all inquiries within 2-3 business days" and lists estelle@nenya.biz', but: 'Not checked that either address delivers; info@ could not be added as a Netlify notification recipient earlier.', suggest: 'Send a test to each address and keep the response-time line only if it is a promise you will keep.' },
  { id: 'd7', where: 'Our Privacy Promise ("No Tracking")', says: '"Our web host counts visits as anonymous totals, with no cookies and nothing stored on your device"', but: 'Terms Section 19 says a timestamp is saved after a coach conversation, and, if chosen, display settings.', suggest: 'Add "apart from the items in Section 19".' },
  { id: 'd8', where: 'Our Privacy Promise ("You are your Colors")', says: '"Your Hex Code identity is your only required identifier"', but: 'The coach uses two session colors as a temporary label; the Terms say they are not an account or an identifier.', suggest: 'Reword to match Section 21: a temporary session label, not an identifier.' },
];

// How the same answers slot into tutorials later. Each lesson draws on answers by id; a lesson is a short page or a step in the coach, never a
// new set of claims, so the facts are written once. The whole-ecosystem tutorials share the same answers.
export const TUTORIAL_MAP: { lesson: string; title: string; uses: string[] }[] = [
  { lesson: 'Welcome', title: 'What Nenya is, and where to start', uses: ['n-what', 'n-name', 'n-else', 'n-accessibility'] },
  { lesson: 'Trust', title: 'Who is behind this, and how it is paid for', uses: ['n-who', 'n-founder', 'n-free', 'n-opensource', 'c-scam'] },
  { lesson: 'Privacy 1 to 3', title: 'What stays on your device, what the coach sees, and how to stay in control', uses: ['n-privacy', 'n-privacy-coach', 'n-device', 'c-memory', 'n-transcripts'] },
  { lesson: 'Meeting the coach', title: 'What it is, what it is not, and who wrote what you read', uses: ['c-ai', 'c-friend', 'c-can', 'c-wrote', 'n-howworks'] },
  { lesson: 'Five exchanges', title: 'Making the conversation count', uses: ['n-limits', 'c-can', 'n-nvc'] },
  { lesson: 'NVC, one step at a time', title: 'Observation, feeling, need, request; and where to learn more', uses: ['n-nvc', 'n-affiliation', 'c-methods'] },
  { lesson: 'When you are angry', title: 'What happens when you bring anger here', uses: ['c-angry', 'c-feelings', 'c-stopped'] },
  { lesson: 'Safety', title: 'What the notices mean, and who to call', uses: ['n-notherapy', 'c-stopped'] },
  { lesson: 'Cards, anywhere', title: 'Answers that appear beside a reply or in a footer, not lessons', uses: ['n-version', 'n-terms-change', 'n-languages'] },
  { lesson: 'Helping us improve it', title: 'Reports, feedback, and contact', uses: ['n-report', 'n-contact', 'n-languages', 'n-terms-change'] },
];
