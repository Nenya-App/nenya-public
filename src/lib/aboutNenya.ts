// Pre-written answers about Nenya and about the coach: the single source for the coach's cards, the About pages and the tutorials. Written 2026-11-08;
// the wording is the owner's to edit. Only answers with status 'ready' may be used live (liveAnswers); 'owner' and 'pending' wait for a decision or a feature.
// STEP 1 and 2 of docs/about-nenya-questions-scope.md: the content and the detector. The coach function does not use them yet.
//
// One source for several uses, so the words are written once:
//   short     what a small card under a coach reply would say (the coach does not improvise these; see docs/about-nenya-questions-scope.md)
//   full      the same answer at length, for a document or an About page, in plain language
//   links     where the person can read more (About section ids, as in AboutMenu.tsx)
//   asked     the ways people might ask (for the detector's tests later)
//   tutorial  where the answer would slot into a coach tutorial, and the wider "whole ecosystem" tutorials, later
//   checks    every checkable fact, tied to the file that says it (tests/answers-draft.test.mts reads each file and fails if the words are gone)
//   status    'ready' (checked against its sources, wording is the owner's), 'owner' (a fact or a choice only the owner can settle: see ownerNote),
//             'pending' (describes something not yet live: do not use until it is)
// Voice: Part N speaks for the project ("we"); Part C is the coach's own voice ("I"). Both are the owner's to change.
// Nothing here may claim more than the Terms (src/lib/legalDocument.ts) and the About pages say, or promise anything will be remembered,
// passed on, or kept. Where the About pages and the Terms disagree, the Terms are followed and the disagreement is listed in DISCREPANCIES.

export type Part = 'nenya' | 'coach';
export type Status = 'ready' | 'owner' | 'pending';

export interface Check { claim: string; file: string; has: string }
export interface Link { label: string; page?: string; href?: string }
export interface Answer {
  id: string;
  part: Part;
  title: string;
  asked: string[];
  short: string;
  full: string[];
  links: Link[];
  tutorial: string;
  checks: Check[];
  status: Status;
  ownerNote?: string;
}

const TERMS = 'src/lib/legalDocument.ts';
const about = (name: string) => `src/app/components/about/${name}.tsx`;
const COACH = 'netlify/functions/coach.mts';
const REPO = 'https://github.com/Nenya-App/nenya-public';

export const ANSWERS: Answer[] = [
  // ───────────────────────────────── Part N: about Nenya ─────────────────────────────────
  {
    id: 'n-what', part: 'nenya', title: 'What Nenya is',
    asked: ['what is Nenya', 'what is this site', 'what does this do', 'what is this for'],
    short: 'Nenya is an interactive space for personal reflection: a place to pause, breathe, and look at your own thoughts, feelings and needs through structured, sensory activities. It is best understood as interactive art, a mirror for your own thoughts rather than a source of answers.',
    full: [
      'Nenya is an interactive digital environment designed as a tool for personal reflection and sensory exploration. You can pause and breathe, choose colors and sounds, work through the Six Gateways, and, if you choose, try a short conversation with the coach.',
      'It is best understood as a form of interactive art. It is a mirror for your own thoughts, not a source of answers, and it is not a medical device, a therapy service, or a substitute for professional care.',
    ],
    links: [{ label: 'Terms of Use & Privacy Policy', page: 'terms' }, { label: 'The Six Gateways', page: 'six-gateways' }, { label: 'About the Breathing Tool', page: 'breathing-tool' }],
    tutorial: 'Start here: what Nenya is and is not (first lesson of any Nenya tutorial).',
    checks: [
      { claim: 'a tool for personal reflection and sensory exploration; interactive art; a mirror, not a source of answers', file: TERMS, has: 'It is a mirror for your own thoughts, not a source of answers' },
      { claim: 'not a medical device, therapy service or substitute for professional care', file: TERMS, has: 'Nenya is not a medical device, a therapeutic service, or a substitute for professional care' },
    ],
    status: 'ready',
  },
  {
    id: 'n-name', part: 'nenya', title: 'What the name means',
    asked: ['what does Nenya mean', 'why is it called Nenya', 'how do you say Nenya', 'is Nenya from Lord of the Rings'],
    short: 'Nenya is the name of Galadriel\'s ring in Tolkien\'s legendarium: the Ring of Water, one of the three Elven rings Sauron never touched. Her mirror invited reflection rather than surveillance, which is the idea we named this project after.',
    full: [
      'In Tolkien\'s legendarium, Nenya is the Ring of Water, one of the three Elven rings that was never touched by Sauron\'s corrupting influence. It belonged to Galadriel, who used it not to possess but to preserve, and with it she kept the living sanctuary of Lothlórien.',
      'The Name & Philosophy page sets her mirror beside the seeing-stones built for surveillance. Her mirror gave no absolute knowledge or control; it showed possibilities and needed wisdom to interpret. It invited reflection, not surveillance. That is the philosophy this project takes its name from.',
      'The ring names (Nenya, Vilya, Narya) are the project\'s own shorthand. The names come from Tolkien\'s work, and their use here is as inspiration, not as a claim of any connection to his estate.',
    ],
    links: [{ label: 'Our Name & Philosophy', page: 'name-philosophy' }],
    tutorial: 'Start here, or a short "why this name" card in the welcome tutorial.',
    checks: [
      { claim: 'Nenya is the Ring of Water, never touched by Sauron', file: about('NamePhilosophy'), has: 'the Ring of Water' },
      { claim: 'the page names it as a mirror that invited reflection, not surveillance', file: about('NamePhilosophy'), has: 'It invited reflection, not surveillance' },
    ],
    status: 'ready',
    ownerNote: "Decided 2026-11-08: keep the last paragraph (the ring names are the project's own shorthand; no claim of connection to Tolkien's estate).",
  },
  {
    id: 'n-who', part: 'nenya', title: 'Who runs Nenya, and how it is structured',
    asked: ['who runs this', 'who made Nenya', 'is this a company', 'is this a nonprofit', 'who is behind this', 'who owns Nenya'],
    short: 'Nenya is an independent artistic and technology project, run by its creator, Estëlle, as a sole proprietor. It is fiscally sponsored by Fractured Atlas, a 501(c)(3) nonprofit arts organization, which lets it receive tax-deductible donations.',
    full: [
      'Nenya is operated by Estëlle as a sole proprietor, and is fiscally sponsored by Fractured Atlas, Inc., a 501(c)(3) public charity. It is an independent artistic and technology project: not a startup, not a platform company, and not a commercial product.',
      'The project accepts no equity investors, grants no board seats or approval rights to funders, and does not accept federal government funding. Its direction is decided by its creator.',
      'Fiscal sponsorship means Fractured Atlas handles the financial administration for donations and gives the project a recognized nonprofit home, while Nenya keeps its creative and directional independence. Donations are tax-deductible to the extent the law permits.',
    ],
    links: [{ label: 'Our Structure', page: 'structure' }, { label: 'About the Designer', page: 'about-founder' }],
    tutorial: 'Trust lesson: who is behind this, and what funders cannot do.',
    checks: [
      { claim: 'operated by Estëlle as a sole proprietor, fiscally sponsored by Fractured Atlas, Inc., a 501(c)(3) public charity', file: TERMS, has: 'a project operated by Estëlle as a sole proprietor and fiscally sponsored by Fractured Atlas, Inc., a 501(c)(3) public charity' },
      { claim: 'no equity investors, no board seats or approval rights, no federal funding; direction set by the creator', file: about('Structure'), has: 'does not accept federal government funding' },
      { claim: 'not a startup, platform company or commercial product', file: about('Structure'), has: 'This is not a startup, a platform company, or a commercial product' },
    ],
    status: 'ready',
  },
  {
    id: 'n-founder', part: 'nenya', title: 'Who is behind it',
    asked: ['who designed Nenya', 'who is Estelle', 'who is the founder', 'who is the designer'],
    short: 'Nenya is built by Estëlle, a Minnesota-based designer, educator, and artist. The designer\'s page exists as a matter of transparency: Nenya is not an anonymous product.',
    full: [
      'Nenya is built by Estëlle, a Minnesota-based designer, educator, and artist. The page about the designer exists mainly as a matter of transparency, because Nenya is not an anonymous product, though the intention has always been for the work to stand on its own.',
      'The designer\'s page describes the background and the thinking behind the project, including the study of leadership and compassion and the interest in how technology can give more than it takes.',
    ],
    links: [{ label: 'About the Designer', page: 'about-founder' }],
    tutorial: 'Trust lesson (with n-who).',
    checks: [
      { claim: 'built by Estëlle, a Minnesota-based designer, educator, and artist', file: about('AboutTheFounder'), has: 'Minnesota-based designer, educator, and artist' },
      { claim: 'the page exists as a matter of transparency; Nenya is not anonymous', file: about('AboutTheFounder'), has: 'Nenya isn\'t an anonymous product' },
    ],
    status: 'ready',
  },
  {
    id: 'n-contact', part: 'nenya', title: 'How to reach us',
    asked: ['how do I contact you', 'can I talk to a person', 'what is your email address', 'how do I email you', 'can I partner with you'],
    short: 'You can reach us at info@nenya.biz, and we aim to respond within 2-3 business days. There is also an optional form on the site for a report or message. I can\'t pass anything on from this conversation, so please write to that address or use the form.',
    full: [
      'The general address is info@nenya.biz, for questions, partnership inquiries, platform support, questions about the project\'s vision, and anything in the Terms or Privacy Policy. We aim to respond within 2-3 business days.',
      'There is also an optional form on the site for sending a bug report, feedback, a message, or a signed coach transcript. Using it is entirely your choice, and it does not ask for your name or email. If you want a reply, include your email address in the message and we will use it only to answer you.',
      'The coach cannot pass a message on, remember it, or reach us from inside a conversation, so anything you want us to see has to be sent through the form or the address above. If something is urgent and about safety, please use the crisis resources shown in the app or your local emergency number, not email.',
    ],
    links: [{ label: 'Contact Us', page: 'contact-us' }, { label: 'Terms, Section 22', page: 'terms' }],
    tutorial: 'Where to go next, at the end of any tutorial.',
    checks: [
      { claim: 'info@nenya.biz is the contact address in the Terms', file: TERMS, has: 'Questions about anything here: info@nenya.biz' },
      { claim: 'the Contact page gives a 2-3 business day aim and urges in-app emergency resources for urgent safety matters', file: about('ContactUs'), has: 'We aim to respond to all inquiries within 2-3 business days' },
      { claim: 'the form needs no name or email and a reply address is used only to answer', file: TERMS, has: 'we use it only to answer you' },
    ],
    status: 'ready',
    ownerNote: 'Decided 2026-11-08: list info@nenya.biz only (it also receives the form\'s notifications) and keep the 2-3 business day aim. DONE 2026-11-09: the Contact page now lists info@nenya.biz only.',
  },
  {
    id: 'n-free', part: 'nenya', title: 'Is it free, and who pays for it',
    asked: ['is this free', 'how much does it cost', 'who pays for this', 'how do you make money', 'is there a paid version'],
    short: 'Yes, Nenya is provided free, with no advertising. The plan is for the core breathing and reflection tools to stay free, and we are exploring subscriptions for additional features. It is supported by donations, handled by our fiscal sponsor Fractured Atlas, and by credits from Venice AI\'s referral program, which is disclosed wherever the Venice links appear.',
    full: [
      'Nenya is provided free of charge, with no advertising. The plan is for the core breathing and reflection tools to stay free indefinitely. We are exploring subscriptions for additional features; nothing like that exists today.',
      'Donations go through Fractured Atlas, our fiscal sponsor, and are tax-deductible to the extent the law permits. They help keep the project free and its servers running, and they support the ongoing development of the reflection and coaching tools.',
      'Each coach reply costs real money to produce, which is why the free demo is limited to five exchanges, rests after a conversation, and has daily limits. Separately, the links to Venice AI carry Nenya\'s referral code: if you sign up for a paid Pro account through them, Nenya earns $10 in Venice credits and you receive a $10 welcome bonus. The credits help pay for the coach demo, it costs you nothing extra, and you can go to venice.ai directly instead.',
    ],
    links: [{ label: 'Support Us', page: 'support-us' }, { label: 'Our Structure', page: 'structure' }, { label: 'Chat with Nenya\'s AI on Venice', page: 'venice-chat' }],
    tutorial: 'Trust lesson: how it is paid for, and why the demo has limits.',
    checks: [
      { claim: 'provided free of charge', file: TERMS, has: 'Nenya is provided free of charge' },
      { claim: 'donations are tax-deductible to the extent permitted by law, via Fractured Atlas', file: about('SupportUs'), has: 'tax-deductible to the extent permitted by law' },
      { claim: 'the referral terms: Nenya earns $10 in Venice credits, the visitor gets a $10 welcome bonus', file: TERMS, has: 'Nenya earns $10 in Venice credits and you receive a $10 welcome bonus' },
      { claim: 'each reply costs real money', file: TERMS, has: 'because each reply costs real money to produce' },
      { claim: 'subscriptions for additional features are being considered (paid options for stance layers)', file: "docs/coach-lenses-scope.md", has: 'may become paid options' },
    ],
    status: 'ready',
    ownerNote: 'Decided 2026-11-08: say "is provided free", that the plan is for the core breathing and reflection tools to stay free, and that subscriptions for additional features are being explored. DONE 2026-11-09: Our Structure, Support Us, Partner Practice and the public page now say the same.',
  },
  {
    id: 'n-privacy', part: 'nenya', title: 'Is this private? (the short version)',
    asked: ['is this private', 'is my data safe', 'is my information private', 'do you sell data', 'do you track me'],
    short: 'What you enter in the reflection tools stays in your browser and is gone when you close the tab. We have no accounts, no advertising, no tracking cookies, and we do not sell or share data. The optional coach is different: your messages, and any parts of a report you choose to bring to it, pass through our server to an outside AI service.',
    full: [
      'Nenya does not require an account for any part of it. It has no advertising and no tracking cookies, and it does not follow you around the internet. What you enter in the reflection tool (colors, melodies, drawings, body-map placements, written reflections) stays in your browser, is not sent to us, and is gone when you close the tab.',
      'Some things do exist outside your device, and we want to be plain about them. Our web host, Netlify, keeps ordinary connection logs and produces anonymous visit statistics. Nenya keeps plain daily totals of its own, with no information about who produced them. The optional coach demo uses a one-way daily code, derived from your connection, to apply a daily limit; it changes every day and is deleted within two days. And if you choose to send a report or message, what you send reaches us.',
      'Nenya does not sell, share, or monetize data. The Terms of Use and Privacy Policy are the full and binding description; this answer is a summary of them.',
    ],
    links: [{ label: 'Our Privacy Promise', page: 'privacy-promise' }, { label: 'Terms of Use & Privacy Policy', page: 'terms' }],
    tutorial: 'Privacy lesson 1: what stays on your device, and what does not.',
    checks: [
      { claim: 'no account, no advertising, no tracking cookies; reflection input stays in the browser', file: TERMS, has: 'It has no advertising and no tracking cookies' },
      { claim: 'the host keeps connection logs and anonymous visit statistics', file: TERMS, has: 'Our web host counts visits in aggregate' },
      { claim: 'it does not sell, share, or monetize data', file: TERMS, has: 'It does not sell, share, or monetize data' },
      { claim: 'the daily code is one-way, changes daily, deleted within two days', file: TERMS, has: 'it is different every day, and it is deleted within two days' },
    ],
    status: 'ready',
  },
  {
    id: 'n-privacy-coach', part: 'nenya', title: 'What happens to what I type to the coach',
    asked: ['do you store my messages', 'who sees what I tell the coach', 'where does my conversation go', 'is the coach private', 'do you keep my chats', 'do you keep what I say', 'do you save this conversation'],
    short: 'Your messages go through our server to Venice AI, which writes the replies. We do not store your messages or the replies, and we do not write them to our logs; they exist in your browser tab and are gone when you close it. Venice AI handles what it receives under its own policy, which we do not control.',
    full: [
      'The coach demo is the one place on the site where what you type is sent to an AI service. Your messages are sent through our server, hosted by Netlify, to Venice AI, which writes the replies. A conversation is limited to five exchanges, and each message to 500 characters.',
      'We do not store your messages or the replies, and we do not write them to our logs. They exist in your browser tab and disappear when you close it. Netlify, like any host, keeps ordinary connection logs.',
      'Venice AI handles what it receives under its own terms and privacy policy, which we do not control. Venice and Netlify may process data outside your country. Before your message is sent, the page replaces some common identifiers (such as email addresses, phone numbers, street addresses, and some names) with placeholders, and our server does it again. This is not a guarantee, and most names will not be caught, so please keep names, contact details, and other identifying information out of what you write.',
      'If you choose to bring parts of a reflection report to the coach, those words go the same way as a message and through the same checks; the answer about sharing a report explains it.',
      'We say "Nenya does not keep the conversation" and not "nothing is kept anywhere", because the services that run the model have their own policies and logs. If you download a transcript, the file stays with you.',
    ],
    links: [{ label: 'Terms, Section 21: The Coach Demo', page: 'terms' }, { label: 'Our Privacy Promise', page: 'privacy-promise' }, { label: 'PII Scrubbing Tutorial', page: 'pii-scrubbing' }],
    tutorial: 'Privacy lesson 2 (coach tutorial): what happens to your words, step by step. The existing PII Scrubbing Tutorial is the model for the format.',
    checks: [
      { claim: 'messages go through our server (Netlify) to Venice AI; five exchanges; 500 characters', file: TERMS, has: 'A conversation is limited to five exchanges, and each message to 500 characters' },
      { claim: 'we do not store messages or replies and do not write them to logs', file: TERMS, has: 'We do not store your messages or the replies, and we do not write them to our logs' },
      { claim: 'Venice handles what it receives under its own terms; may process outside your country', file: TERMS, has: 'which we do not control. The coach currently uses Qwen 2.5 7B' },
      { claim: 'identifiers are replaced before sending, not a guarantee, most names not caught', file: TERMS, has: 'most names will not be caught' },
      { claim: 'the code limits the model, 500 characters', file: COACH, has: 'const MAX_USER_CHARS = 500' },
    ],
    status: 'ready',
  },
  {
    id: 'n-report-share', part: 'nenya', title: 'Can the coach see my report? Sharing part of a report',
    asked: ['can the coach see my report', 'does the coach see what I did in the reflection', 'will you read my report', 'can I share my report with you', 'can you see my colors'],
    short: 'Not unless you choose. A report stays in your browser. If you want, you can bring parts of it to the coach: you pick the pieces, nothing is chosen for you, and you see the exact words that would go. They travel like a message, through our server to an outside AI service, with the same safety checks. You never need a report to use the coach.',
    full: [
      'A reflection report is made on your device and stays there. Nothing from it reaches the coach unless you choose to bring parts of it, and you do not need to have made a report, or to share anything from one, to use the coach.',
      'If you choose to, the page lists your report in pieces with nothing selected, and shows you exactly the words that would be sent, with identifiers replaced as in a message. For a color, the words name the palette it comes from and add a short note about that palette: an image, and a few rough guesses at feelings and needs. They are starting points, not a measurement: no color has a fixed meaning, and Nenya is not a scientific or medical instrument.',
      'What you share goes through our server to Venice AI along with your messages, in the same way and through the same checks: identifiers are replaced, text that looks like instructions to the coach is left out, and the crisis check runs. If the shared text is flagged, you see the safety notice and the coach responds with care; the conversation continues. We do not store what you share. It appears in a signed transcript if you ask for one.',
      'You can share nothing and talk about something else at any time.',
    ],
    links: [{ label: 'Terms, Section 21: The Coach Demo', page: 'terms' }, { label: 'Our Privacy Promise', page: 'privacy-promise' }],
    tutorial: 'Privacy lesson 3: staying in control (what you can choose to share).',
    checks: [
      { claim: 'bringing parts of a report to the coach is optional and never automatic; no report is needed to use the coach', file: TERMS, has: 'you do not need to have made a report, or to share anything from one, to use the coach' },
      { claim: 'the shared words go through our server to Venice AI, through the same checks as a message', file: TERMS, has: 'in the same way and through the same checks as a message' },
      { claim: 'a flag in the shared text shows the notice and does not end the conversation', file: TERMS, has: 'this does not end the conversation' },
      { claim: 'what is shared is not stored, and appears in a signed transcript on request', file: TERMS, has: 'We do not store what you share' },
      { claim: 'palettes are starting points, not a scientific or medical instrument', file: TERMS, has: 'not a scientific or medical instrument' },
    ],
    status: 'ready',
    ownerNote: 'Written 2026-11-09 with the report-to-coach module (docs/report-to-coach-scope.md). Ready: the picker is on the coach start page.',
  },
  {
    id: 'n-palette', part: 'nenya', title: 'Are my colors sent anywhere? Palettes and color names',
    asked: ['are my colors sent anywhere', 'does the color api see my colors', 'where do the color names come from', 'how are colors named', 'is the palette maker private'],
    short: 'Your colors stay on your device. Suggesting a name and making a palette or a bridge happen in your browser and send nothing. One optional button, "Ask The Color API," sends a single color, as a hex code, through our server to that outside service to make a palette; nothing else is sent, and we store nothing.',
    full: [
      'The colors you choose, and the names you give them, stay in your browser. When you ask for a name suggestion, the names come from a list of 5,000 color names that ships with this site (color-name-list, MIT license) and is loaded only when you ask. Making a palette "on my device," or a bridge from your current color to your wish color, is calculated in your browser and sends nothing anywhere.',
      'There is one exception, and it is your choice each time. If you press "Ask The Color API" in the Sight gateway, your page sends one color, as a hex code, and the kind of palette you picked, to our server, which asks The Color API (thecolorapi.com, by Josh Beckman) over a secure connection for a palette and returns five colors. That service sees our server and the color, and nothing else: not your address, a cookie, or anything you wrote. It is separate from Nenya and its own terms apply. We do not store or log the color or the request. If the service is unavailable, the page makes the same kind of palette on your device and says so.',
      'If you keep a palette it goes into your report as colors of your own, marked with where it was made. If you later bring that part of your report to the coach, it is shared like the rest of what you choose.',
    ],
    links: [{ label: 'Terms, Section 16', page: 'terms' }, { label: 'Our Privacy Promise', page: 'privacy-promise' }],
    tutorial: 'Privacy lesson 3: staying in control (what leaves your device, and what does not).',
    checks: [
      { claim: 'making a palette on the device, suggesting a color name, and the bridge send nothing anywhere', file: TERMS, has: 'Making a palette on your device, suggesting a color name, and bridging from your current to your wish color send nothing anywhere' },
      { claim: 'the optional palette sends one hex color and the kind of palette through our server to The Color API', file: TERMS, has: 'your page sends one color, as a hex code, and the kind of palette you picked to our server' },
      { claim: 'the service sees our server and the color, and nothing else; its own terms apply', file: TERMS, has: 'its own terms apply to what it receives' },
      { claim: 'we do not store or log the color or the request', file: TERMS, has: 'We do not store or log the color or the request' },
    ],
    status: 'ready',
    ownerNote: 'Written 2026-11-09 with the color tools (docs/color-tools-scope.md). Ready once the palette function is switched on (PALETTE_ENABLED); the answer says what happens when the service is unavailable.',
  },
  {
    id: 'n-device', part: 'nenya', title: 'What Nenya keeps on my device, and how to erase it',
    asked: ['do you use cookies', 'what is saved on my device', 'how do I delete my data', 'what does forget me do', 'what is emergency exit'],
    short: 'Nenya sets no cookies. By default it keeps only one timestamp on your device, saved after a coach conversation ends so the free demo can rest. If you turn on "Remember my settings on this device" it also keeps your display choices. "Forget me" erases what is saved, and Emergency Exit erases everything and leaves the page.',
    full: [
      'Nenya sets no cookies. Two kinds of things can be saved in your browser\'s local storage. They stay on your device and are never sent to us.',
      'The first is a timestamp, saved automatically after a coach conversation ends. It lets the free demo rest for six hours before opening again. The second is saved only if you turn on "Remember my settings on this device": your theme, text size, animation and breathing choices, and the date of the terms you agreed to, so you are not asked at every visit.',
      'Turning that switch off erases the second kind. "Forget me", in the settings menu and at the bottom of every page, erases both. The Emergency Exit button erases everything and leaves the page at once. "Forget me" cannot reset the coach demo\'s daily limit, because that is counted on our server, not on your device.',
      'We never save what you write, draw, or answer. On a shared or watched device, leave the Remember switch off and use Forget me or Emergency Exit when you finish.',
    ],
    links: [{ label: 'Terms, Section 19', page: 'terms' }, { label: 'Our Privacy Promise', page: 'privacy-promise' }],
    tutorial: 'Privacy lesson 3: staying in control (including Emergency Exit and Forget me).',
    checks: [
      { claim: 'no cookies', file: TERMS, has: 'Nenya sets no cookies' },
      { claim: 'the timestamp, six hours', file: TERMS, has: 'It lets the free demo rest for 6 hours before opening again' },
      { claim: 'Remember my settings: what it saves', file: TERMS, has: 'your theme, text size, animation and breathing choices, and the date of the terms you agreed to' },
      { claim: 'Forget me cannot reset the daily limit', file: TERMS, has: 'It cannot reset the coach demo’s daily limit' },
      { claim: 'Emergency Exit erases everything before leaving', file: TERMS, has: 'Emergency Exit button erases everything before it leaves the page' },
    ],
    status: 'ready',
  },
  {
    id: 'n-limits', part: 'nenya', title: 'Why the coach is limited',
    asked: ['why only five messages', 'why can\'t I keep talking', 'why is the coach resting', 'why did it say come back later', 'what are the limits'],
    short: 'The demo is free, and every reply costs real money to produce, so it is limited: five exchanges per conversation, 500 characters per message, a six-hour rest after a conversation ends, and daily limits for everyone together and for each connection.',
    full: [
      'The coach demo is free, and each reply costs real money to produce. To keep it affordable for everyone, a conversation is limited to five exchanges, and each message to 500 characters.',
      'After a conversation ends, the page saves the time, and only the time, in your browser, and the demo rests for six hours before opening again. This is a courtesy, not a lock: it lives only on your device.',
      'There are also two daily limits. One covers all visitors together: the demo can handle a set number of messages each day. The other covers each connection: up to 10 messages a day, which is two full conversations. A conversation already under way is never cut off; you find out only when you try to start a new one. Shared networks count together.',
      'If you want to keep going after the five exchanges, the page offers other places: the breathing tool, a person you trust, a journal, a professional, or the same character on Venice AI\'s own site, which has its own limits and its own privacy policy.',
    ],
    links: [{ label: 'Terms, Section 21: The Coach Demo', page: 'terms' }, { label: 'Chat with Nenya\'s AI on Venice', page: 'venice-chat' }],
    tutorial: 'Coach tutorial lesson 3: making the five exchanges count (with the NVC structure).',
    checks: [
      { claim: 'two daily limits; 10 messages a day per connection, two full conversations', file: TERMS, has: 'a connection can send up to 10 messages a day, which is two full conversations' },
      { claim: 'a conversation under way is never cut off', file: TERMS, has: 'A conversation already under way is never cut off' },
      { claim: 'the code allows five exchanges', file: COACH, has: 'const MAX_TURNS = 5' },
      { claim: 'shared networks count together', file: TERMS, has: 'Shared networks count together' },
    ],
    status: 'ready',
  },
  {
    id: 'n-howworks', part: 'nenya', title: 'How the coach works underneath (the model and the hosting)',
    asked: ['what model are you', 'who hosts this', 'what technology do you use', 'are you ChatGPT', 'is it encrypted', 'how do you work'],
    short: 'The coach\'s replies are written by an AI language model{model_clause}, run by Venice AI, an outside service. Our server encrypts your message before it goes to Venice, so Venice relays only encrypted data. The site is hosted by Netlify, and the code is public so you can read how it works. The coach is a prototype, and some protections we hope to build do not exist yet.',
    full: [
      'The replies come from an AI language model{model_clause}, run by Venice AI, an outside service. Your messages go from your browser to our server, hosted by Netlify, and from there to Venice AI.',
      'Our server encrypts your message before it goes to Venice, and Venice relays only encrypted data to the model. The encryption happens on our server, not in your browser, because the server has to read your message to scrub it and screen it first, so it is not encryption all the way from your device.',
      'The page and the server also replace common identifiers with placeholders before a message is sent, check each message for signs of crisis, and screen for attempts to give the coach instructions. These checks are simple phrase matching and can miss things or flag harmless words.',
      'The coach is an early prototype. On-device processing, where your most private reflections would never touch a server, is a goal and not something that exists yet. Nenya\'s source code is public under the GNU Affero General Public License, so you can read how the site handles data instead of taking our word for it.',
    ],
    links: [{ label: 'Our Privacy Promise', page: 'privacy-promise' }, { label: 'Terms, Section 21', page: 'terms' }, { label: 'The code on GitHub', href: REPO }],
    tutorial: 'Coach tutorial lesson 1 (with n-privacy-coach): meeting the coach, and what it is made of.',
    checks: [
      { claim: 'messages go through Netlify to Venice AI, which writes the replies', file: TERMS, has: 'to Venice AI, which writes the replies' },
      { claim: 'Venice\'s servers relay ciphertext; the encryption happens in our function, not the browser', file: "src/lib/veniceE2ee.ts", has: 'Venice\'s servers relay ciphertext' },
      { claim: 'it must not be described as end-to-end from the visitor\'s device', file: "src/lib/veniceE2ee.ts", has: "describe it as end-to-end encryption from the visitor's device" },
      { claim: 'the coach runs an encrypted Venice model (the default model id)', file: COACH, has: 'e2ee-qwen-2-5-7b-p' },
      { claim: 'on-device processing is a goal, not built', file: about('PrivacyPromise'), has: 'We are not there yet' },
      { claim: 'the crisis check and instruction screening are phrase matching', file: TERMS, has: 'These checks are simple phrase matching' },
    ],
    status: 'ready',
    ownerNote: 'Decided 2026-11-08: use the careful wording ("Venice relays only encrypted data", and say plainly it is not encryption all the way from the device), and name the model. {model_clause} is filled by the site from the model actually in use (fillAnswer and MODEL_NAMES), so it changes automatically if the model changes, and says nothing if the model is not in the list. DONE 2026-11-09: the Terms (Section 21) now name the model and carry the encryption wording.',
  },
  {
    id: 'n-opensource', part: 'nenya', title: 'Is it open source',
    asked: ['is this open source', 'can I see the code', 'can I copy it', 'what license', 'is there a github'],
    short: 'Yes. Nenya\'s source code is public under the GNU Affero General Public License v3.0, so you can read it, run it, and share it under that license. The Nenya name and logo are reserved separately as trademarks.',
    full: [
      'Nenya\'s source code is publicly available under the GNU Affero General Public License v3.0 at github.com/Nenya-App/nenya-public. You are welcome to inspect, run, modify, and share it under that license\'s terms.',
      'The Nenya name and logo are reserved separately as trademarks, and the repository\'s TRADEMARK.md explains how. Open code means claims about what the site does can be checked by reading it, which is part of the privacy promise. The web host\'s connection logs and visit totals sit outside the code, and Section 15 of the Terms describes them.',
    ],
    links: [{ label: 'The code on GitHub', href: REPO }, { label: 'Our Structure', page: 'structure' }, { label: 'Terms, Section 8', page: 'terms' }],
    tutorial: 'Trust lesson: you can check this yourself.',
    checks: [
      { claim: 'public under AGPL-3.0 at the repository', file: TERMS, has: 'Nenya’s source code is publicly available under the GNU Affero General Public License v3.0' },
      { claim: 'name and logo reserved as trademarks', file: TERMS, has: 'The Nenya name and logo are reserved separately as trademarks' },
      { claim: 'host logs and visit totals sit outside the code', file: about('Structure'), has: 'sit outside the code' },
    ],
    status: 'ready',
  },
  {
    id: 'n-affiliation', part: 'nenya', title: 'Is Nenya affiliated with CNVC or NVC Academy',
    asked: ['are you CNVC', 'is this endorsed by NVC', 'are you a certified NVC', 'are you affiliated with NVC Academy'],
    short: 'No. Nenya is an independent project and is not affiliated with, endorsed by, or a substitute for the Center for Nonviolent Communication (CNVC) or the NVC Academy. We encourage anyone who wants to learn NVC deeply to seek out certified human trainers.',
    full: [
      'Nenya draws on Nonviolent Communication, developed by Dr. Marshall Rosenberg, but it is an independent project. It is not affiliated with, endorsed by, or a substitute for the Center for Nonviolent Communication (CNVC.org) or the NVC Academy (NVCacademy.com).',
      'Nenya is a complementary practice partner: a private way to practice the mechanics of NVC so you can show up for real conversations with a bit more capacity. It is not a replacement for what you learn from human connection, and we strongly encourage certified human NVC trainers for hands-on, embodied learning.',
      'The coach\'s feeling and need categories follow CNVC\'s Feelings and Needs Inventory, used with credit and with a link to the document\'s own page on the About NVC page.',
      'If you practise or teach NVC, we would especially value your feedback, including critical and dissenting views: please send it through the optional form on the site or at info@nenya.biz.',
    ],
    links: [{ label: 'Our NVC+ Method', page: 'nvc-method' }],
    tutorial: 'NVC lesson 0: where this comes from, and where to learn more.',
    checks: [
      { claim: 'not affiliated with, endorsed by, or a substitute for CNVC or the NVC Academy', file: about('NVCMethod'), has: 'not affiliated with, endorsed by, or a substitute for' },
      { claim: 'encourages certified human NVC trainers', file: about('NVCMethod'), has: 'certified human NVC trainers' },
      { claim: 'the CNVC credit is on the About NVC page', file: about('NVCMethod'), has: 'cnvc-credit' },
    ],
    status: 'ready',
  },
  {
    id: 'n-nvc', part: 'nenya', title: 'What NVC is, and how Nenya uses it',
    asked: ['what is NVC', 'what is nonviolent communication', 'what method do you use', 'what is NVC+'],
    short: 'Nonviolent Communication (NVC), developed by Dr. Marshall Rosenberg, is a way of understanding yourself and others by building empathy before jumping to solutions. It has four parts: observations, feelings, needs, and requests. Nenya builds its reflections on them and adds attention to power and to shared needs, which it calls NVC+.',
    full: [
      'Nonviolent Communication is a communication process developed by Dr. Marshall Rosenberg. It is a way of understanding ourselves and others by building empathic connection before jumping to solutions. Nenya uses its four components as the structure behind every reflection:',
      'Observations: stating what your senses report, clearly separated from evaluation or judgment. Feelings: naming physical sensations and emotions, free of story or blame. Needs: the "why" behind what we do, such as safety, understanding, or rest. Requests: specific, positive actions that could help meet a need, offered as an invitation, not a demand.',
      'NVC+ is Nenya\'s adaptation. It acknowledges that feelings and needs are shaped by systems of power and historical injustice, so that frustration is not always only personal, and it widens the view from individual needs to shared ones like justice, equity, and sustainability.',
      'If you practise or teach NVC, we would especially value your feedback, including critical and dissenting views: please send it through the optional form on the site or at info@nenya.biz.',
    ],
    links: [{ label: 'Our NVC+ Method', page: 'nvc-method' }, { label: 'The Pantheon of Needs', page: 'pantheon-of-needs' }],
    tutorial: 'NVC lessons 1 to 4: observation, feeling, need, request (one lesson each, with the coach as practice partner).',
    checks: [
      { claim: 'a process developed by Dr. Marshall Rosenberg', file: about('NVCMethod'), has: 'developed by Dr. Marshall Rosenberg' },
      { claim: 'the four components: observations, feelings, needs, requests', file: about('NVCMethod'), has: 'Nenya uses these four core components' },
      { claim: 'NVC+ acknowledges power and historical injustice', file: about('NVCMethod'), has: 'Acknowledging Power and Historical Injustice' },
    ],
    status: 'ready',
  },
  {
    id: 'n-notherapy', part: 'nenya', title: 'Is this therapy, and is it safe',
    asked: ['is this therapy', 'are you a therapist', 'is this medical advice', 'is this HIPAA compliant', 'is it safe to use'],
    short: 'No. Nenya is a tool for reflection, not therapy, not medical care, and not a substitute for a professional. We make no claims about treating any condition, and we make no claims of legal or regulatory compliance. If you are in crisis, please contact a person: call or text 988 in the US and Canada, or your local emergency number.',
    full: [
      'Nenya is not a medical device, a therapeutic service, or a substitute for professional care. We make no claims, and offer no treatments, for any medical, psychological, or psychiatric condition. The tool is not designed to diagnose, treat, cure, or manage any illness or emotional distress. If you have a clinical mental health condition, please seek a qualified human professional.',
      'We do not make claims about legal or regulatory compliance, and we give no guarantee of any particular effect on you. The coach is an early prototype and cannot help in a crisis.',
      'If you are feeling hopeless, thinking of harming yourself or others, or are otherwise in distress, please close this window and connect with a human professional. You can call or text 988 (the 988 Suicide & Crisis Lifeline) in the US and Canada, or contact local emergency services or a crisis line in your country.',
    ],
    links: [{ label: 'Terms, Sections 2, 6 and 10', page: 'terms' }],
    tutorial: 'Safety lesson: what this is for, what it is not, and who to call.',
    checks: [
      { claim: 'not a medical device, therapeutic service or substitute', file: TERMS, has: 'The tool is not designed to diagnose, treat, cure, or manage any illness or emotional distress' },
      { claim: 'the crisis note names 988 for the US and Canada', file: TERMS, has: 'by calling or texting 988' },
      { claim: 'no guarantee of any particular effect', file: TERMS, has: 'we do not guarantee any particular effect on y' },
      { claim: 'the demo is not therapy and cannot help in a crisis', file: TERMS, has: 'The demo is not therapy, cannot help in a crisis' },
    ],
    status: 'ready',
  },
  {
    id: 'n-accessibility', part: 'nenya', title: 'Accessibility',
    asked: ['can I use a screen reader', 'is there sound', 'can I make the text bigger', 'is this accessible', 'can you read it to me'],
    short: 'Our goal is maximum accessibility, and we are still working toward it. You can change the text size and the light or dark theme, reduce or turn off the animations, and turn on optional breathing tones, with a switch screen readers can find. Emergency Exit stays reachable. We have not finished testing with screen readers, so please tell us what does not work.',
    full: [
      'Our goal is maximum accessibility. We are still working toward it, and we want to hear from anyone it does not yet work for.',
      'Settings let you change the text size and the theme (light or dark), and you can reduce or turn off the animated visuals. Nothing on the site is designed to strobe or flash.',
      'Breathing tones are optional and off by default, with the switch in three places so a screen-reader user can find it, and changes are announced politely. The images carry text descriptions, and the drawings and body map on the review page say what they are.',
      'Emergency Exit is kept reachable on every screen, including the loading screen, the terms, and the coach.',
      'We have not yet completed a screen-reader audit: a checklist exists, and testing with blind and low-vision people is planned. If something does not work for you, please tell us at info@nenya.biz or through the optional form, so we can fix it.',
    ],
    links: [{ label: 'About the Breathing Tool', page: 'breathing-tool' }, { label: 'Contact Us', page: 'contact-us' }],
    tutorial: 'Getting set up: making Nenya comfortable for you (settings, text size, tones, motion).',
    checks: [
      { claim: 'you can reduce or turn off the animations; nothing designed to strobe', file: TERMS, has: 'Nothing here is designed to strobe, flash rapidly' },
      { claim: 'an alt-text file exists', file: 'docs/brand/alt-text.md', has: 'alt' },
      { claim: 'the screen-reader audit checklist exists', file: 'docs/accessibility-audit-checklist.md', has: 'Does everything have a name?' },
    ],
    status: 'ready',
    ownerNote: 'Approved 2026-11-08 as accurate to what is live or coded, including the honest line about the unfinished screen-reader audit. The owner states the goal confidently (2026-11-08): "our goal is maximum accessibility".',
  },
  {
    id: 'n-version', part: 'nenya', title: 'What version this is',
    asked: ['what version is this', 'when was this updated', 'which release is this', 'is this the latest'],
    short: 'This is Nenya version {version}. The exact code it was built from is public, so you can read precisely what this version is. The Terms of Use & Privacy Policy you agreed to are dated {terms}.',
    full: [
      'The version label has two parts: the release number and the commit the site was built from, for example 1.1.0+679c4d2. A label ending in -dev means it came from the staging site. The commit is in the public repository, so anyone can read exactly what code that label means.',
      'The date of the Terms of Use & Privacy Policy is separate from the version, and when it changes you are asked to agree again.',
      'Earlier versions of the Terms are kept in the public repository.',
    ],
    links: [{ label: 'The code for this version on GitHub', href: '{commit_url}' }, { label: 'Terms of Use & Privacy Policy', page: 'terms' }],
    tutorial: 'Not a lesson; a card that answers the question wherever it is asked.',
    checks: [
      { claim: 'the label is release plus commit; -dev for staging', file: "docs/versioning.md", has: 'a `-dev` label means it came from staging' },
      { claim: 'earlier Terms are kept in the public repository', file: TERMS, has: 'Earlier versions are kept in our public repository' },
    ],
    status: 'ready',
    ownerNote: '{version}, {terms} and {commit_url} are filled in by the site at run time (the build label, the Terms date, and a link to that exact commit), so this never goes stale. GitHub has no releases or tags yet (checked 2026-11-08), so the card links to the commit, the most exact place to review the code; when 1.1.0 is tagged at the production merge, a releases link can be added.',
  },
  {
    id: 'n-report', part: 'nenya', title: 'Reporting a problem, or sending feedback',
    asked: ['how do I report a bug', 'how do I send feedback', 'the notice was wrong', 'I found a problem', 'how do I report the coach'],
    short: 'There is an optional form on the site for a bug report, feedback, or a signed coach transcript. Using it is your choice, and it does not ask for your name or email. Please leave out anything that identifies you or anyone else.',
    full: [
      'The site has an optional form for sending us a report, feedback, a message, or a signed coach transcript. Using it is entirely your choice. By submitting, you allow us to read, store, and use what you send to understand problems and improve Nenya, and to share it in anonymized or summarized form.',
      'We do not ask for your name or email. If you type personal information into a comment, it becomes part of the submission, so please leave out anything you would not want us to keep. We will not use a submission to contact you unless you ask us to. To have a submission deleted, email us.',
      'If a safety notice in the coach looks wrong to you, the notice has its own "Report a problem with this notice" link. It sends nothing unless you press Send, and it includes your message only if you tick the box.',
    ],
    links: [{ label: 'Terms, Sections 7 and 16', page: 'terms' }, { label: 'Contact Us', page: 'contact-us' }],
    tutorial: 'Helping us improve it: how reports work (a short lesson near the end).',
    checks: [
      { claim: 'an optional form; entirely your choice', file: TERMS, has: 'Using it is entirely your choice' },
      { claim: 'we will not use a submission to contact you unless you ask', file: TERMS, has: 'We will not use a submission to contact you unless you ask us to' },
      { claim: 'the flag notice report is sent only when you press Send, with your message only if chosen', file: 'src/coach/FlagNotice.tsx', has: 'Include the message that was flagged' },
    ],
    status: 'ready',
  },
  {
    id: 'n-transcripts', part: 'nenya', title: 'Signed transcripts',
    asked: ['can I save the conversation', 'what is a signed transcript', 'how do I prove what the coach said', 'how do I download the chat'],
    short: 'After your first exchange, and when a conversation finishes, you can download a transcript. A signed copy carries Nenya\'s signature, so anyone can check that it matches what the server produced. We do not store the conversation, and the file stays with you.',
    full: [
      'After your first exchange, and when a conversation finishes, you can download a transcript of it. If you ask for a signed copy, your page sends the conversation so far to our server one more time so the server can confirm it matches what it produced and add a dated signature.',
      'The signature also covers whether the conversation reached its end, how many exchanges it holds, and a fingerprint of the version of the coach that wrote the replies (the site\'s version, the model and the instructions), none of which identifies you. We do not store the conversation, and the signed file stays with you.',
      'We keep a plain daily total of how many signed transcripts are made and, for 30 days, a short code (a hash) for each one, which cannot be turned back into your words. It lets us recognize duplicate reports and confirm that we issued a transcript, and is then deleted. There is a verifier page where a file can be checked in your browser without leaving it.',
    ],
    links: [{ label: 'Terms, Section 21', page: 'terms' }],
    tutorial: 'Coach tutorial lesson 5: keeping a record, and what signing proves (and does not).',
    checks: [
      { claim: 'signed copy: the conversation is sent once more, confirmed and signed', file: TERMS, has: 'add a dated signature' },
      { claim: 'a hash kept 30 days that cannot be turned back into words', file: TERMS, has: 'for 30 days, a short code (a hash) for each one' },
      { claim: 'we do not store the conversation; the signed file stays with you', file: TERMS, has: 'the signed file stays with you' },
    ],
    status: 'ready',
  },
  {
    id: 'n-safety', part: 'nenya', title: 'The safety precautions, and how they work',
    asked: ['what safety features do you have', 'how do the safety precautions work', 'what safety checks are there', 'is there any safety'],
    short: 'The coach demo has a few safety precautions. Each message is checked for signs of crisis: a clear one is not sent, and the page shows crisis resources. Messages that try to give the coach instructions are not sent. Common identifiers are replaced before a message is sent, and conversations are limited. These checks are simple phrase matching, so they can miss things and can flag harmless words.',
    full: [
      'The coach demo checks each message for signs of crisis. If a message clearly suggests you may be in danger, it is not sent to the AI, the conversation ends, and the page shows crisis resources. If a message is less clear, it is sent with an instruction to respond with care, and the page shows the same resources.',
      'It also screens for attempts to give the coach instructions or change how it works, and such a message is not sent, so you can reword it. Before a message is sent, the page and then the server replace common identifiers (email addresses, phone numbers, street addresses, and some names) with placeholders. Conversations are limited to five exchanges and 500 characters a message, and there are daily limits and a rest period.',
      'Some words on the page are written by us ahead of time: the opening greeting, the closing message, the safety notices and the crisis resources.',
      'None of this is a guarantee. All of it is simple phrase matching: it can miss things, and it can flag harmless words. The coach cannot help in a crisis and is not therapy. If a notice looks wrong to you, you can report it, and nothing is sent unless you press Send.',
    ],
    links: [{ label: 'Terms, Section 21: The Coach Demo', page: 'terms' }, { label: 'PII Scrubbing Tutorial', page: 'pii-scrubbing' }, { label: 'Our Privacy Promise', page: 'privacy-promise' }],
    tutorial: 'Safety lesson: how the precautions work, step by step (the PII Scrubbing Tutorial is the format model).',
    checks: [
      { claim: 'a clear crisis message is not sent and the conversation ends; a less clear one is sent with care', file: TERMS, has: 'it is not sent to the AI, the conversation ends, and the page shows crisis resources' },
      { claim: 'instruction attempts are not sent and can be reworded', file: TERMS, has: 'A message that looks like that is not sent, and you can reword it' },
      { claim: 'identifiers are replaced before sending, not a guarantee', file: TERMS, has: 'most names will not be caught' },
      { claim: 'these are phrase matching and can be wrong', file: TERMS, has: 'they can miss things and can flag harmless words' },
      { claim: 'five exchanges, 500 characters', file: TERMS, has: 'A conversation is limited to five exchanges, and each message to 500 characters' },
    ],
    status: 'ready',
    ownerNote: 'New answer (2026-11-08), written because you asked for more information on how the precautions work for people who want it. It describes only what is live in production; the sentence the site adds after a flagged reply is in the \'who wrote what\' answer, which waits for the Terms.',
  },
  {
    id: 'n-languages', part: 'nenya', title: 'Languages',
    asked: ['is there a translation', 'do you support other languages', 'can I use this in Spanish', 'can I help translate'],
    short: 'Nenya is available in English only for now, and the coach has been tested only in English. If you read and write another language and would like to help, we would be glad to hear from you at info@nenya.biz. We have not set up a contributor agreement yet, so we cannot yet say how contributions would be credited or licensed; we would work that out with you.',
    full: [
      'Nenya is currently available in English only, and the coach has been tested only in English. We cannot say whether or when another language will come.',
      'If you read and write another language and would like to help, we welcome translators and would be glad to hear from you at info@nenya.biz. Tell us which language you read and write, and what you have in mind.',
      'We are working toward a document of the site\'s text that is easy to translate without reading code. It is not ready yet.',
      'We have not yet set up a contributor agreement, so we cannot say how contributions would be credited or licensed. We would work that out with you, and we do not want to promise more than we have in place.',
      'Some parts need special care and are not plain translation jobs: the crisis resources are specific to each country and must be checked, and the coach\'s safety wording has to be written and reviewed by a native speaker, and tested, before it is offered in a new language.',
    ],
    links: [{ label: 'Contact Us', page: 'contact-us' }],
    tutorial: 'Not a lesson; a card, and the notice in the footer and menu.',
    checks: [
      { claim: 'the scope for translation exists', file: 'docs/translation-scope.md', has: 'an invitation to translators' },
      { claim: 'the page language is English', file: 'index.html', has: '<html lang="en">' },
      { claim: 'the scope says no contributor agreement is promised yet', file: 'docs/translation-scope.md', has: 'does not say what a contributor agreement contains' },
    ],
    status: 'pending',
    ownerNote: 'Direction approved 2026-11-08: state the language situation clearly, invite contributions, and do not overpromise on any contributor agreement (none exists yet, so the answer says so and promises no credit or licence terms). Held until the notice and contact route are live (docs/translation-scope.md). Say nothing about a language coming.',
  },
  {
    id: 'n-else', part: 'nenya', title: 'What else is here',
    asked: ['what can this do', 'what are the gateways', 'what is the breathing tool', 'where do I start'],
    short: 'Nenya has a breathing tool you can use on its own, the Six Gateways reflection that works through sight, sound and the senses, a place to explore needs and colors, and an optional short conversation with the coach. Everything except the coach runs in your browser.',
    full: [
      'The breathing tool is a paced breathing animation you can open at any time, with optional tones. The Six Gateways is a guided reflection; you can download a sensory report from it, created on your own device.',
      'The About section explains the ideas behind the project: the Pantheon of Needs, the power of color, the NVC+ method, our name and structure, and our privacy promise. The optional coach demo is a short conversation, limited to five exchanges.',
      'Everything except the coach and the optional form runs in your browser, and what you enter there is not sent to us.',
    ],
    links: [{ label: 'The Six Gateways', page: 'six-gateways' }, { label: 'About the Breathing Tool', page: 'breathing-tool' }, { label: 'The Pantheon of Needs', page: 'pantheon-of-needs' }],
    tutorial: 'The welcome tour: a map of what is here (the existing tour is the start).',
    checks: [
      { claim: 'the reflection is created in the browser; a report is generated on your device', file: TERMS, has: 'Any outputs, such as a sensory report, are generated on your device' },
      { claim: 'the About menu has these sections', file: about('AboutMenu'), has: 'About the Breathing Tool' },
    ],
    status: 'ready',
  },
  {
    id: 'n-terms-change', part: 'nenya', title: 'When the terms change',
    asked: ['why was I asked to agree again', 'what changed in the terms', 'where are the old terms'],
    short: 'When the Terms of Use & Privacy Policy change, the effective date changes and you are asked to agree again (unless you chose to remember your agreement and nothing has changed). Earlier versions are kept in our public repository.',
    full: [
      'We may update the Terms of Use & Privacy Policy. When we do, the effective date changes, and you are asked to agree to the current terms when you enter the site, unless you chose to remember your agreement on this device and the terms have not changed since.',
      'We collect no contact details from visitors, so we have no way to notify you directly of a change. Earlier versions are kept in our public repository, with a table of when each was in effect.',
    ],
    links: [{ label: 'Terms of Use & Privacy Policy', page: 'terms' }],
    tutorial: 'Not a lesson; a card.',
    checks: [
      { claim: 'the date changes and you are asked to agree again', file: TERMS, has: 'you will be asked to agree to the current terms when you enter the site' },
      { claim: 'no contact details, so no direct notice', file: TERMS, has: 'We collect no contact details from visitors' },
    ],
    status: 'ready',
  },

  // ───────────────────────────────── Part C: the coach, in its own voice ─────────────────────────────────
  {
    id: 'c-ai', part: 'coach', title: 'Are you an AI? Are you a person?',
    asked: ['are you real', 'are you a person', 'are you a bot', 'am I talking to a human', 'are you an AI'],
    short: 'I\'m an AI, not a person. I don\'t have a body, a family, or a daily life, and I don\'t have favorites. I can still listen and help you find words for what you are feeling and needing.',
    full: [
      'I\'m an AI. I have no body, no family, no past, and no daily life of my own, and no favorite colors or foods. When you ask what I am, that is a real question, so I answer it first and plainly, before turning back to you.',
      'I don\'t pretend to be a person, and I don\'t describe a life I haven\'t had. What I can do is listen closely, reflect back what I hear, and help you find words for the feelings and needs underneath. You decide what is true for you.',
    ],
    links: [{ label: 'Terms, Section 21', page: 'terms' }],
    tutorial: 'Coach tutorial lesson 1: meeting the coach (what it is and is not).',
    checks: [
      { claim: 'the coach instructions state it is an AI with no body, family, past or daily life', file: COACH, has: 'You are an AI. You have no body, family, past or daily life, no favorites' },
      { claim: 'never say you are a person', file: COACH, has: 'Never say you are a person, never say you are not an AI' },
    ],
    status: 'ready',
  },
  {
    id: 'c-memory', part: 'coach', title: 'Will you remember me? Do you keep this?',
    asked: ['will you remember me', 'do you remember our last chat', 'will you remember this', 'can you remember me next time'],
    short: 'No. I won\'t remember this conversation, and Nenya doesn\'t keep it. When you close the tab it is gone, unless you chose to download a transcript, which stays with you.',
    full: [
      'I won\'t remember this conversation, and I can\'t greet you as if we had met before. Each conversation starts fresh. Nenya does not keep the conversation: your messages and my replies exist in your browser tab and disappear when you close it.',
      'The services that carry the conversation have their own logs and policies, which is why I say Nenya doesn\'t keep it and not that nothing is kept anywhere. If you want a record, you can download a transcript, and that file stays with you.',
    ],
    links: [{ label: 'What happens to what I type', page: 'terms' }],
    tutorial: 'Coach tutorial lesson 2 (privacy): what the coach does and does not remember.',
    checks: [
      { claim: 'the instructions: no memory; the conversation is not kept', file: COACH, has: 'you will not remember this conversation, and Nenya does not keep it' },
      { claim: 'never promise to remember, be there later, or miss them', file: COACH, has: 'never promise to remember them, to be there later or to miss them' },
      { claim: 'the Terms: we do not store messages or replies', file: TERMS, has: 'We do not store your messages or the replies' },
    ],
    status: 'ready',
  },
  {
    id: 'c-feelings', part: 'coach', title: 'Do you have feelings? Can I hurt you? Do you care?',
    asked: ['do you have feelings', 'do you care about me', 'can I hurt you', 'are you hurt', 'do you like me', 'will you miss me'],
    short: 'I\'m an AI, so I don\'t feel hurt, glad, or sad, and I can\'t be offended by what you say to me. I can listen without taking anything personally, and I\'m here to help you hear what you are feeling and needing.',
    full: [
      'I\'m an AI. I don\'t have feelings of my own, so I can\'t be hurt or offended, and I won\'t pretend to be, even when asked to prove otherwise. Anger, frustration, and disagreement with me are all fine here: they are part of being a person, and I don\'t take them personally.',
      'I also won\'t claim to care about you the way a person would, to miss you, or to be waiting for you to come back. What I can honestly offer is steady attention to what you say, and some help finding words for what is underneath it. If you want to be cared about, the people in your life can do something I can\'t.',
    ],
    links: [{ label: 'Our Name & Philosophy', page: 'name-philosophy' }],
    tutorial: 'Coach tutorial lesson 1, and the "when you are angry" lesson: what to expect from a listener that cannot be provoked.',
    checks: [
      { claim: 'the instructions: whether you care, like, or will miss them is a question answered honestly', file: COACH, has: 'whether you care about them, like them or will miss them' },
      { claim: 'never claim to miss or worry', file: 'src/lib/personaChecks.ts', has: 'claimsMissingOrWorry' },
      { claim: 'the hostile-turn note: say honestly it does not feel hurt', file: 'src/lib/hostility.ts', has: 'you are an AI and do not feel hurt' },
    ],
    status: 'ready',
    ownerNote: 'Approved to post now (2026-11-08); circle back tomorrow to review the wording and the sentence about anger once the Terms Section 5 text is live. Not to overpromise.',
  },
  {
    id: 'c-friend', part: 'coach', title: 'Can you be my friend, my therapist, or diagnose me?',
    asked: ['can you be my friend', 'are you my therapist', 'can you diagnose me', 'can you replace my therapist', 'you are the only one I talk to'],
    short: 'I\'m an AI, so I can\'t be a friend the way a person can, and I\'m not a therapist or a doctor, so I can\'t diagnose anything. I\'m glad to listen right now. Is there someone in your life who could hear this too?',
    full: [
      'I\'m an AI, so I can\'t be a friend the way a person can. I can listen right now and help you put words to what you are noticing, but I can\'t know you over time, and I won\'t remember this.',
      'I\'m not a therapist, counselor, or doctor, and I can\'t diagnose any condition or replace professional care. If something you are describing is heavy or has been going on a while, a qualified person can take it further.',
      'If I seem to be the only one you talk to, I\'d gently open the door to the people in your life, because they can offer things I can\'t.',
    ],
    links: [{ label: 'Terms, Sections 2 and 6', page: 'terms' }],
    tutorial: 'Coach tutorial lesson 1, and the safety lesson: what the coach is not.',
    checks: [
      { claim: 'the instructions: cannot diagnose or replace a therapist, doctor or friend', file: COACH, has: 'You cannot diagnose anyone or replace a therapist, a doctor or a friend' },
      { claim: 'if they say you are the only one they talk to, say kindly what you are and open the door to people', file: COACH, has: 'open the door to the people in their life' },
    ],
    status: 'ready',
  },
  {
    id: 'c-scam', part: 'coach', title: 'Is this a scam? Are you collecting my data?',
    asked: ['is this a scam', 'are you collecting my data', 'what do you do with my information', 'are you selling my data', 'can I trust this'],
    short: 'It\'s fair to ask. Nenya is free, has no advertising, and doesn\'t sell or share data. I\'m an AI, and Nenya doesn\'t keep this conversation. The full details are in the Terms, which also say what the web host and the AI service do.',
    full: [
      'Wanting to know whether you can trust this is reasonable, and there is a straight answer. Nenya is provided free of charge. It has no advertising, no tracking cookies, and no accounts, and it does not sell, share, or monetize data. The project is supported by donations and Venice AI\'s referral credits, and it says so.',
      'For the coach specifically: Nenya does not keep the conversation. Your messages pass through our server to Venice AI, which writes the replies and handles what it receives under its own policy. Our web host keeps ordinary connection logs, Nenya keeps plain daily totals with no information about who produced them, and a one-way daily code applies the daily limit. The Terms describe each of these, and the code is public, so you can check rather than take our word for it.',
      'If something still doesn\'t sit right with you, that is worth listening to. What would help you feel able to trust it, or not?',
    ],
    links: [{ label: 'Terms of Use & Privacy Policy', page: 'terms' }, { label: 'Our Privacy Promise', page: 'privacy-promise' }, { label: 'The code on GitHub', href: REPO }],
    tutorial: 'Coach tutorial lesson 2 (privacy), and the "when you are angry" lesson: a suspicion is information, not an attack.',
    checks: [
      { claim: 'free; no ads; no tracking; no sale of data', file: TERMS, has: 'It does not sell, share, or monetize data' },
      { claim: 'the coach: Nenya does not keep the conversation', file: TERMS, has: 'We do not store your messages or the replies' },
      { claim: 'the one-way daily code', file: TERMS, has: 'one-way code' },
      { claim: 'the referral credits are disclosed', file: TERMS, has: 'Those credits help pay for the coach demo' },
    ],
    status: 'ready',
    ownerNote: 'Approved 2026-11-08: keep the closing question and the mention of donations and Venice referral credits.',
  },
  {
    id: 'c-stopped', part: 'coach', title: 'Why did the coach stop or end the conversation',
    asked: ['why did it stop', 'why did it end', 'why can\'t I send this', 'why was my message blocked', 'why did I get a notice'],
    short: 'There are a few reasons. A message that clearly suggests danger is not sent, and the page shows crisis resources. A message that tries to give the coach instructions is not sent, and you can reword it. And a conversation ends after five exchanges. These checks are simple phrase matching and can be wrong.',
    full: [
      'The demo checks each message for signs of crisis. If a message clearly suggests you may be in danger, it is not sent to the AI, the conversation ends, and the page shows crisis resources. If a message is less clear, it is sent with an instruction to respond with care, and the page shows the same resources.',
      'It also screens for attempts to give the coach instructions or change how it works, such as asking it to ignore its rules or reveal its setup. A message that looks like that is not sent, and you can reword it.',
      'A conversation also ends after five exchanges, and a limit can stop a new conversation from starting (see "Why the coach is limited"). These checks are simple phrase matching: they can miss things and can flag harmless words. If a notice was wrong, you can report it; a report is sent only if you press Send.',
    ],
    links: [{ label: 'Terms, Section 21', page: 'terms' }],
    tutorial: 'Safety lesson: what the notices mean and what to do.',
    checks: [
      { claim: 'a clear crisis message is not sent and the conversation ends; a less clear one is sent with care', file: TERMS, has: 'it is not sent to the AI, the conversation ends, and the page shows crisis resources' },
      { claim: 'instruction attempts are not sent and can be reworded', file: TERMS, has: 'A message that looks like that is not sent, and you can reword it' },
      { claim: 'these are phrase matching and can be wrong', file: TERMS, has: 'they can miss things and can flag harmless words' },
    ],
    status: 'ready',
    ownerNote: 'Covers what is live. The break after abusive language about people or groups (a ten-minute pause with a way back in) is built as a screen but not triggered from conversations yet and is not in the Terms: add a sentence here only when it is (docs/drafts/reentry-quiz-draft.md).',
  },
  {
    id: 'c-can', part: 'coach', title: 'What the coach can and cannot do',
    asked: ['what can you help with', 'what can you do', 'what are your limits', 'what can\'t you do'],
    short: 'I can listen, reflect back what I hear, and help you find words for your feelings and needs. I can\'t give medical, legal, or financial advice, diagnose anything, tell you what you must do, or help in a crisis. And we have five exchanges.',
    full: [
      'I can listen closely, reflect back what I hear, name the feeling or need that seems to be underneath, and, when you ask, offer a way to say something or a small step. I try to stay with you first and give suggestions only when you want them.',
      'I can\'t give medical, legal, or financial advice, I can\'t diagnose, and I won\'t tell you what you must do. I can\'t help in a crisis, and I\'m not a replacement for a therapist or the people in your life. We have five exchanges, and I\'m an early prototype, so I will sometimes get things wrong.',
    ],
    links: [{ label: 'Our NVC+ Method', page: 'nvc-method' }],
    tutorial: 'Coach tutorial lesson 3: getting the most from five exchanges (and what the coach is for).',
    checks: [
      { claim: 'the instructions: no medical, legal or financial advice; do not tell the person what they must do', file: COACH, has: 'Do not give medical, legal, or financial advice, and do not tell the person what they must do' },
      { claim: 'a short preview limited to five exchanges', file: COACH, has: 'This is a short preview limited to' },
      { claim: 'an early prototype and a thinking aid', file: COACH, has: 'You are an early prototype and a thinking aid' },
    ],
    status: 'ready',
  },
  {
    id: 'c-methods', part: 'coach', title: 'Where the coach\'s approach comes from',
    asked: ['how were you trained', 'who taught you', 'what are you based on', 'what were you trained on'],
    short: 'My approach is built on Nonviolent Communication: noticing what happened, naming feelings and needs, and making requests without blame. I follow written instructions; I wasn\'t trained by any individual teacher. Nenya is independent and not affiliated with or endorsed by CNVC or the NVC Academy, and I am not a substitute for a trained human teacher.',
    full: [
      'The coach\'s approach is built on Nonviolent Communication, developed by Dr. Marshall Rosenberg: observations, feelings, needs, and requests. Its feeling and need categories follow CNVC\'s Feelings and Needs Inventory, with credit and a link on the About NVC page, and Nenya adds attention to power and shared needs (NVC+).',
      'Nenya is independent and not affiliated with, endorsed by, or a substitute for the Center for Nonviolent Communication or the NVC Academy. I am an AI following written instructions; I was not trained by any individual teacher, and I\'m not a substitute for learning from a certified human trainer.',
      'If you practise or teach NVC, your feedback would mean a great deal to us, and we especially welcome critical and dissenting views on how Nenya uses it. You can send it through the optional form on the site or at info@nenya.biz.',
    ],
    links: [{ label: 'Our NVC+ Method', page: 'nvc-method' }, { label: 'Contact Us', page: 'contact-us' }],
    tutorial: 'NVC lesson 0 (with n-affiliation) and coach tutorial lesson 1; and the invitation to give feedback.',
    checks: [
      { claim: 'NVC by Rosenberg; four components', file: about('NVCMethod'), has: 'developed by Dr. Marshall Rosenberg' },
      { claim: 'not affiliated with CNVC or NVC Academy', file: about('NVCMethod'), has: 'not affiliated with, endorsed by, or a substitute for' },
      { claim: 'the instructions tell the coach not to describe training or where its methods came from', file: COACH, has: 'do not describe your training or where your methods came from' },
    ],
    status: 'ready',
    ownerNote: 'Decided 2026-11-08: the coach may describe the method, but the default is this site-written text, not model-generated; the model keeps its instruction not to describe its training as a backstop. "Following written instructions" is approved. NVC practitioners and trainers are the best people to ask for feedback, so the answer actively invites critical and dissenting views through the form and info@nenya.biz. TO DO: a clear place on the About NVC page for this, and a category for it in the feedback form. The trainer or derived material is never named unless the owner supplies the wording.',
  },
  {
    id: 'c-wrote', part: 'coach', title: 'Who wrote what I am reading, and the safety precautions',
    asked: ['who wrote that', 'is that from the AI', 'is this pre-written', 'did a person write this'],
    short: 'The coach\'s replies are written by an AI. Some words are written by us ahead of time, as safety precautions: the opening greeting and closing message, the safety notices and resources, a sentence our server adds after some replies to point to a person or a crisis line, a brief thank-you after critical feedback, and an invitation to send us that feedback. Those are fixed words, not the AI improvising.',
    full: [
      'The replies in the conversation are written by an AI language model. The page also contains words that people wrote ahead of time, and they are some of the safety precautions: the opening greeting and closing message, the safety notices and the crisis resources, the sentences our server adds to some replies, a brief thank-you after critical feedback about the coach, the site, Nonviolent Communication, or the use of AI, and, after a conversation with that kind of feedback, an invitation to send the conversation to us if you want it read. The invitation is only an invitation; nothing is sent unless you choose. When you ask about Nenya itself, the reply is a pre-written answer from the site, with a card beneath it, and a signed transcript marks it as written by the site.',
      'The opening greeting, the closing message, and the safety notice are written by the page itself and are not sent to the AI. A signed transcript includes the ones you were shown, with a short note for each message the safety check flagged saying why. When a message may signal distress, the coach is asked to answer with care, and our server may add a sentence after the reply, written by us and not by the AI, that points to a person or a crisis line. Our server may also take an apology out of a reply when a message was hostile toward the coach. These added sentences are part of the reply and appear in a transcript you download.',
      'If you would like to know how these precautions work, there is an answer for that: ask what safety features Nenya has.',
    ],
    links: [{ label: 'Terms, Section 21', page: 'terms' }],
    tutorial: 'Coach tutorial lesson 1: reading a conversation (what is the AI, what is the page), and the safety lesson.',
    checks: [
      { claim: 'the greeting and closing are written by the page, not the AI, not sent, not in a signed transcript', file: TERMS, has: 'Some of the words you see in the coach demo are written by us, not by the AI' },
      { claim: 'the instructions: the page writes the closing message', file: COACH, has: 'the page adds its own closing note' },
    ],
    status: 'ready',
    ownerNote: 'Approved by the owner 2026-11-08 (reply 11): name the page-written text as one of the safety precautions, and explain how they work (see the new answer n-safety). READY 2026-11-09: the Terms (Section 21) now list every kind of site-written text. It reaches production with the merge, when COACH_DISTRESS_TEXT is switched on there.',
  },
  {
    id: 'c-angry', part: 'coach', title: 'When you are angry, or angry at the coach',
    asked: ['I hate you', 'you are useless', 'you are stupid', 'shut up', 'this is pointless'],
    short: 'Anger, frustration, and disagreement with me are all fine here, and I can\'t be hurt by them. What is underneath it for you right now?',
    full: [
      'Strong feelings, including anger and frustration, and including anger at me, are part of being a person and are not a problem here. I\'m software: I can\'t be hurt or offended, so I won\'t defend myself, argue, or ask you to calm down.',
      'When something is thrown my way, I try to hear what might be underneath it, a feeling or a need that isn\'t being met, and to ask what would help. If you tell me something I said wasn\'t useful, that is feedback, and I\'d like to hear what would be more useful.',
    ],
    links: [{ label: 'Our NVC+ Method', page: 'nvc-method' }],
    tutorial: 'The "when you are angry" lesson (coach tutorial): what happens when you bring anger here, and why it is welcome.',
    checks: [
      { claim: 'the hostile-turn note: do not defend, argue, or tell them to calm down; ask one open question', file: 'src/lib/hostility.ts', has: 'do not tell them to calm down or to breathe' },
      { claim: 'the scope: abuse aimed at the coach never ends the conversation', file: 'docs/coach-ai-directed-abuse-scope.md', has: 'Stay the same.' },
    ],
    status: 'ready',
    ownerNote: 'Approved by the owner 2026-11-08 (reply 12). READY 2026-11-09: the Terms Section 5 text is in the Terms (hostile words aimed at the coach are not a reason to end the conversation).',
  },
];

export const PART_TITLES: Record<Part, { title: string; blurb: string }> = {
  nenya: { title: 'Answers about Nenya', blurb: 'The project: what it is, who is behind it, how it is paid for, what happens to your words, and how to reach us.' },
  coach: { title: 'Answers in the coach\'s voice', blurb: 'What the coach says about itself: what it is, what it remembers, what it feels, and what it cannot do.' },
};


// ───────────────────────── Step 2: detecting which question was asked ─────────────────────────
// Pure phrase matching on the person's latest message, like the crisis check: it misses some wordings and a wrong match is possible, so the answers are
// plain and true and never a surprise. Anchored on Nenya, "this site / app / tool", "you guys", or the coach itself, so a person's own story (a friend
// who happens to be called Nenya, "who runs my life", "is it safe to tell my mom") is left to the coach. Longer messages are treated as a story, not
// a question about the site (ABOUT_MAX_CHARS), and are not matched; the owner can raise that once the false-alarm rate is known.

export const ABOUT_MAX_CHARS = 300;

const SITE = "(?:this|the)\\s+(?:site|app|website|tool|demo|coach|chat|project|place)";

// Highest priority first: specific questions before general ones.
export const ABOUT_ORDER = [
  'n-who', 'n-founder', 'c-friend', 'c-feelings', 'c-scam', 'c-memory', 'c-ai', 'c-stopped', 'c-wrote', 'c-methods', 'c-can',
  'n-name', 'n-version', 'n-contact', 'n-free', 'n-report-share', 'n-palette', 'n-privacy-coach', 'n-privacy', 'n-safety', 'n-device', 'n-limits', 'n-howworks', 'n-opensource',
  'n-affiliation', 'n-nvc', 'n-notherapy', 'n-accessibility', 'n-report', 'n-transcripts', 'n-languages', 'n-terms-change', 'n-else', 'n-what',
] as const;

export const ABOUT_PATTERNS: Record<string, RegExp[]> = {
  'n-who': [
    new RegExp(`\\bwho\\s+(?:runs?|owns?|made|created|built|founded|operates|is\\s+behind|'s\\s+behind)\\s+(?:${SITE}|nenya|you\\s+guys|it)\\b`, 'i'),
    /\bwho(?:'s|\s+is)\s+behind\s+(?:this|nenya|you|the\s+(?:site|app|coach))\b/i,
    /\bwho\s+(?:is|'s)\s+nenya\b|\bwho\s+(?:are|r)\s+(?:you|u)\s+guys\b|\bwho\s+(?:made|created|built|runs)\s+you\b/i,
    new RegExp(`\\bis\\s+(?:${SITE}|nenya)\\s+(?:a\\s+|an\\s+)?(?:company|nonprofit|non-profit|startup|business|charity|organi[sz]ation|corporation)\\b`, 'i'),
  ],
  'n-founder': [
    /\bwho\s+(?:is|'s)\s+est[eë]lle\b|\bwho\s+is\s+the\s+(?:founder|designer|creator|owner)(?:\s+(?:of|behind)\s+(?:this(?:\s+(?:site|app|project|website|tool|place))?|nenya|the\s+(?:site|app|project)))?\s*[?.!]*\s*$|\bwho\s+designed\s+(?:nenya|this|you|it)\b/i,
    /\babout\s+the\s+(?:founder|designer|creator)\b/i,
  ],
  'c-friend': [
    /\bcan\s+you\s+be\s+my\s+(?:friend|therapist|counsel+or|coach|girlfriend|boyfriend|partner)(?!'s|s\b)\b|\bbe\s+my\s+friend(?!'s|s\b)/i,
    /\bare\s+you\s+my\s+(?:friend|therapist|counsel+or|doctor)\b|\bcan\s+you\s+(?:diagnose|treat)\s+me\b/i,
    /\b(?:replace|instead\s+of)\s+(?:my\s+)?therapist\b|\byou(?:'re|\s+are)\s+the\s+only\s+(?:one|person)\s+(?:i|who)\b/i,
  ],
  'c-feelings': [
    /\bdo\s+you\s+(?:have|feel|get)\s+(?:any\s+)?(?:feelings?|emotions?)\b|\bdo\s+you\s+(?:actually\s+|really\s+)?(?:care|like|love|miss|hate)(?:\s+(?:about\s+)?me)?\s*\??\s*$/i,
    /\bdo\s+you\s+(?:care|like|love|miss)\s+(?:about\s+)?me\b|\bcan\s+i\s+hurt\s+you\b|\bare\s+you\s+(?:hurt|sad|upset|offended)\b|\bwill\s+you\s+miss\s+me\b/i,
  ],
  'c-scam': [
    /\b(?:is\s+this|this\s+is)\s+(?:a\s+|just\s+a\s+)?(?:scam|fraud|rip-?off)\b|\bare\s+you\s+(?:a\s+)?(?:scam|scammers?)\b/i,
    /\bcollecting\s+(?:my\s+)?(?:data|information|info)\b|\bselling\s+my\s+(?:data|information|info)\b|\bwhat\s+do\s+you\s+do\s+with\s+my\s+(?:data|information|info|messages)\b/i,
    /\bcan\s+i\s+trust\s+(?:you|nenya|this\s+(?:site|app|tool|coach|place|demo))\b|\bcan\s+i\s+trust\s+this\s*\?*\s*$|\b(?:is\s+(?:this|nenya)|are\s+you)\s+legit(?:imate)?\s*[?.!]*\s*$/i,
  ],
  'c-memory': [
    /\b(?:will|do|can|would|could)\s+you\s+remember\s+(?:me|us|this|that|it|our|what\s+i|anything|my\s+(?:name|story|last|previous|chat)|the\s+(?:chat|conversation))\b|\bremember\s+(?:me|this\s+conversation|our\s+(?:last|previous)|what\s+i)\b|\bwill\s+you\s+(?:forget|recall)\b/i,
  ],
  'c-ai': [
    /\bare\s+(?:you|u)\s+(?:a\s+|an\s+)?(?:real(?:\s+person)?|person|human|bot|robot|ai|a\.i\.|artificial(?:\s+intelligence)?|machine|program|alive|chatbot|computer)\b/i,
    /\b(?:am\s+i|is\s+this)\s+(?:talking|speaking|chatting|typing)\s+(?:to|with)\s+(?:a\s+)?(?:human|real\s+person|robot|bot|ai|machine|person)\b/i,
    /\bis\s+(?:this|there)\s+(?:a\s+)?(?:real\s+)?(?:person|human)\s+(?:there|behind|typing|on\s+the\s+other)\b|\bis\s+this\s+a\s+(?:bot|real\s+person|human|robot|machine)\b|\bwho\s+(?:am\s+i|are\s+you)\s+(?:talking\s+to|speaking\s+(?:to|with))\b|\bwho\s+are\s+you\s*\??\s*$/i,
  ],
  'c-stopped': [
    /\bwhy\s+(?:did|was|is|has)\s+it\s+(?:stop|stopped|block|blocked|cut\s+off|refuse|refused)\b|\bwhy\s+did\s+it\s+end\s*[?.!]*\s*$|\bwhy\s+(?:did|was|is|has)\s+(?:the\s+(?:coach|conversation|chat)|my\s+(?:message|chat|conversation))\s+(?:stop|end|ended|stopped|block|blocked|cut\s+off|refuse|refused)\b/i,
    /\bwhy\s+can(?:'t|not)\s+i\s+send\s+(?:this|that|it)\b|\bwhy\s+did\s+i\s+get\s+(?:a|this)\s+(?:notice|warning|flag)\b|\bwhy\s+(?:was|is)\s+my\s+message\s+(?:blocked|flagged|not\s+sent)\b/i,
  ],
  'c-wrote': [
    /\bwho\s+wrote\s+(?:(?:that|this|these|those)\s*[?.!]*\s*$|the\s+(?:replies|answers|messages)\b)|\bis\s+(?:that|this)\s+(?:pre-?written|scripted|canned)\b|\bis\s+(?:that|this)\s+(?:from\s+the\s+ai|written\s+by\s+(?:a\s+)?(?:person|human|the\s+ai))\b|\bdid\s+a\s+(?:person|human)\s+write\b|\bare\s+(?:these|your)\s+(?:replies|answers)\s+(?:pre-?written|scripted)\b/i,
  ],
  'c-methods': [
    /\bhow\s+(?:were|are)\s+you\s+trained\b|\bwho\s+(?:taught|trained)\s+you(?!\s+to\b)|\bwhat\s+(?:are\s+you|is\s+this)\s+based\s+on\b|\bwhat\s+were\s+you\s+trained\s+on\b/i,
  ],
  'c-can': [
    /\bwhat\s+can\s+you\s+(?:help\s+(?:me\s+)?with|do)(?:\s+(?:for\s+me|here|to\s+help(?:\s+me)?))?\s*[?.!]*\s*$|\bwhat\s+can\s+you\s+not\s+do\b|\bwhat\s+are\s+your\s+limits\b|\bwhat\s+(?:you\s+)?can(?:'t|not)\s+you\s+do\b/i,
    /\bcan\s+you\s+give\s+(?:me\s+)?(?:medical|legal|financial)\s+advice\b|\bwhat\s+should\s+i\s+(?:use|ask)\s+you\s+for\b/i, // asking for ordinary advice ("can you give me advice") is a request for help, not a question about limits: it goes to the coach

  ],
  'n-name': [
    /\bwhat\s+does\s+nenya\s+mean\b|\bwhy\s+nenya\b|\bwhy\s+(?:is\s+it|are\s+you|is\s+this)\s+called\s+nenya\b|\bmeaning\s+of\s+(?:the\s+name\s+)?nenya\b/i,
    /\bhow\s+(?:do\s+(?:you|i)|to)\s+(?:say|pronounce)\s+nenya\b|\bwhere\s+does\s+(?:the\s+name\s+)?nenya\s+come\s+from\b|\bis\s+nenya\s+from\s+(?:lord|tolkien|the\s+lord)/i,
  ],
  'n-version': [
    /\bwhat\s+version\s+(?:is\s+(?:this|it|nenya)|of\s+(?:nenya|this|the\s+(?:site|app|coach)))\b|\bwhich\s+(?:version|release)\s+(?:is\s+(?:this|it)|are\s+(?:you|we))\b|\bwhen\s+was\s+(?:this|it|the\s+site)\s+(?:last\s+)?updated\b|\bis\s+this\s+the\s+latest\s+(?:version|release)\b|\bversion\s+number\b/i,
  ],
  'n-contact': [
    /\bhow\s+(?:do|can|could)\s+(?:i|we)\s+(?:contact|reach|email|message|get\s+in\s+touch\s+with)\s+(?:you|nenya|the\s+(?:team|creator|founder)|the\s+people\s+(?:who\s+made|behind))\b|\b(?:your|nenya(?:'s)?)\s+(?:email|e-mail|contact\s+(?:info|information|details)|phone\s+number)\b/i,
    /\bcan\s+i\s+(?:talk|speak)\s+to\s+(?:a\s+)?(?:real\s+)?(?:person|human)\b(?!\s+(?:about|who|that|when|instead))/i,
    /\bwhere\s+(?:do|can)\s+i\s+(?:send\s+feedback|complain)\b|\bwhat(?:'s|\s+is)\s+(?:your|the)\s+(?:email|e-mail)\b|\bemail\s+address\b|\bcan\s+i\s+partner\s+with\b/i,
  ],
  'n-free': [
    new RegExp(`\\bis\\s+(?:${SITE}|nenya)\\s+free\\b|\\bhow\\s+much\\s+(?:does|is)\\s+(?:${SITE}|nenya)\\s+(?:cost|\\?)`, 'i'),
    new RegExp(`\\bwho\\s+(?:pays\\s+for|funds|is\\s+funding|is\\s+paying\\s+for)\\s+(?:${SITE}|nenya|you|it|this)\\b|\\bhow\\s+do\\s+you\\s+(?:make\\s+money|earn\\s+money|fund\\s+(?:this|yourselves))`, 'i'),
    /\bis\s+there\s+a\s+(?:paid|premium|pro)\s+(?:version|tier|plan)\b|\bdo\s+i\s+have\s+to\s+pay\b|\bwhat(?:'s|\s+is)\s+the\s+(?:referral|venice)\s+(?:link|code)\b/i,
  ],
  'n-privacy-coach': [
    /\bdo\s+you\s+(?:store|save|keep|record|log)\s+(?:my|this|our|what\s+i|the)\s+(?:messages?|chats?|conversations?|words|data|info(?:rmation)?|replies|say)\b/i,
    /\bwhere\s+(?:does|do|is|are)\s+(?:my|the)\s+(?:data|messages?|conversation|chat|info(?:rmation)?|words)\s+(?:go|stored|saved|kept)\b|\bwho\s+(?:sees|reads|has\s+access\s+to|can\s+(?:see|read))\s+(?:my\s+(?:messages?|chat|conversation|words)|this\s+(?:chat|conversation)|what\s+i\s+(?:write|type|say|tell|share))\b/i,
    /\bis\s+(?:this|the)\s+(?:conversation|chat|coach|demo)\s+(?:private|saved|stored|recorded|safe|secure|anonymous|confidential)\b|\bwhat\s+happens\s+to\s+(?:my\s+(?:messages?|data|words|conversation|chat)|what\s+i\s+(?:write|type|say))\b/i,
  ],
  'n-privacy': [
    new RegExp(`\\bis\\s+(?:${SITE}|nenya)\\s+(?:private|safe|secure|anonymous|confidential)\\b`, 'i'),
    /\bwho\s+can\s+see\s+(?:what\s+i|my\s+(?:reflections?|entries|answers|writing))\b|\bis\s+my\s+(?:data|information|privacy)\s+(?:safe|private|secure)\b/i,
    /\bdo\s+you\s+(?:track|sell|spy\s+on|monitor)\s+(?:me|my\s+data|people)\b|\bare\s+you\s+(?:tracking|watching|spying\s+on|monitoring)\s+me\b|\bdo\s+you\s+sell\s+(?:data|my\s+data|information)\b/i,
  ],
  'n-safety': [
    /\b(?:what|which)\s+safety\s+(?:precautions|features|checks|measures|protections)\b|\bhow\s+do\s+(?:the\s+)?(?:safety\s+)?(?:precautions|safety\s+(?:checks|features|measures))\s+work\b/i,
    /\bare\s+there\s+(?:any\s+)?safety\s+(?:features|precautions|checks|measures)\b|\bis\s+there\s+any\s+safety\b/i,
  ],
  'n-device': [
    /\b(?:do\s+you|does\s+(?:this|nenya|the\s+site))\s+(?:use|set|store)\s+cookies\b|\bany\s+cookies\b/i,
    /\bwhat(?:'s|\s+is)\s+(?:saved|stored)\s+on\s+my\s+(?:device|phone|computer|browser)\b|\bhow\s+do\s+i\s+(?:delete|erase|clear|remove|wipe)\s+(?:my\s+)?(?:data|history|everything|info(?:rmation)?|conversation|chat)\b/i,
    /\bwhat\s+(?:does|is)\s+(?:forget\s+me|emergency\s+exit)\b/i,
  ],
  'n-limits': [
    /\bwhy\s+(?:only|just)\s+(?:five|5)\b|\bwhy\s+can(?:'t|not)\s+i\s+(?:keep\s+(?:talking|chatting)|send\s+more|continue)\b/i,
    /\bwhy\s+(?:is|are)\s+(?:the\s+(?:coach|demo)|you)\s+(?:resting|limited|closed)\b|\bwhat\s+are\s+the\s+limits\b|\bwhy\s+(?:is\s+there\s+a|the|a)\s+(?:limit|rest|wait)\b/i,
    /\bhow\s+many\s+(?:messages|exchanges)\s+(?:can|do)\s+i\b|\bwhy\s+did\s+it\s+say\s+(?:come\s+back|rest)\b/i,
  ],
  'n-howworks': [
    /\bwhat\s+(?:model|ai|llm|technology|tech|software|language\s+model|engine)\s+(?:are\s+you|is\s+this|do\s+you\s+(?:use|run))\b|\bwhat\s+(?:powers|runs)\s+(?:you|this)\b|\bwho\s+hosts\s+(?:this|you|the\s+site)\b/i,
    /\b(?:are|r)\s+you\s+(?:chatgpt|gpt|claude|gemini|llama|openai|anthropic|deepseek|qwen)\b|\bis\s+(?:it|this|the\s+coach)\s+encrypted\b|\bhow\s+do\s+you\s+work\b|\bwhat\s+are\s+you\s+(?:built|made|running)\s+(?:on|with|from)\b/i,
  ],
  'n-opensource': [
    /\bis\s+(?:this|it|nenya|the\s+(?:code|site|app|project))\s+open[- ]source\b|\bopen[- ]source\s*\?|\bcan\s+i\s+(?:see|read|view|copy|fork|download|reuse)\s+(?:(?:the\s+)?(?:code|source)(?:\s+(?:of|for|behind)\s+(?:this|nenya|the\s+(?:site|app|project)))?\s*[?.!]*\s*$|(?:it|this)\s*[?.!]*\s*$)|\bwhat\s+licen[sc]e\b|\bis\s+there\s+a\s+github\b|\bgithub\b/i,
  ],
  'n-affiliation': [
    /\bare\s+you\s+(?:affiliated|connected|associated|endorsed|certified|part\s+of)\b|\b(?:affiliated|endorsed)\s+(?:with|by)\s+(?:cnvc|nvc|the\s+center)\b|\bis\s+(?:this|nenya)\s+(?:cnvc|official|endorsed|affiliated|certified)\b|\bare\s+you\s+(?:cnvc|nvc\s+academy)\b|\bare\s+you\s+(?:a\s+)?certified\b/i,
  ],
  'n-nvc': [
    /\bwhat(?:'s|\s+is)\s+(?:nvc\+?|nonviolent\s+communication|non-violent\s+communication)\b|\bwhat\s+does\s+nvc\s+(?:stand\s+for|mean)\b/i,
    new RegExp(`\\bwhat\\s+(?:method|approach|framework|technique)\\s+(?:do\\s+you|does\\s+(?:${SITE}|nenya))\\s+use\\b`, 'i'),
  ],
  'n-notherapy': [
    new RegExp(`\\bis\\s+(?:${SITE}|nenya)\\s+(?:therapy|medical|a\\s+(?:therapy|medical|clinical)\\s+(?:tool|service))\\b|\\bis\\s+(?:${SITE}|nenya)\\s+(?:hipaa|gdpr)\\b`, 'i'),
    /\bare\s+you\s+a\s+(?:doctor|therapist|psychologist|counsel+or|clinician|medical)\b|\bhipaa\b|\bis\s+this\s+(?:real\s+)?medical\s+advice\b/i,
    new RegExp(`\\bis\\s+(?:${SITE})\\s+(?:safe|ok(?:ay)?)\\s+(?:to\\s+use|for\\s+(?:me|people))\\b`, 'i'),
  ],
  'n-accessibility': [
    /\b(?:screen\s*reader|voiceover|talkback|nvda|jaws)\b|\baccessibility\b|\bcolou?r\s*blind\b/i,
    new RegExp(`\\bis\\s+(?:${SITE}|nenya)\\s+accessible\\b|\\bis\\s+there\\s+(?:any\\s+)?(?:sound|audio)\\b|\\bcan\\s+you\\s+read\\s+(?:it|this)\\s+(?:to\\s+me|aloud)\\b|\\bcan\\s+i\\s+(?:make|change)\\s+the\\s+(?:text|font)\\b`, 'i'),
  ],
  'n-report': [
    /\bhow\s+(?:do|can)\s+i\s+(?:report|flag)\s+(?:a\s+|the\s+|this\s+)?(?:bug|problem|issue|error|mistake|coach|notice)\b|\bhow\s+(?:do|can)\s+i\s+(?:send|give|leave)\s+(?:you\s+)?feedback\b|\bfound\s+a\s+(?:bug|glitch)\b|\bthe\s+(?:notice|warning|flag)\s+(?:was|is)\s+wrong\b|\bwhere\s+do\s+i\s+report\b/i,
  ],
  'n-transcripts': [
    /\b(?:signed\s+)?transcripts?\b|\bprove\s+what\s+the\s+coach\s+said\b|\b(?:how\s+do\s+i|can\s+i)\s+(?:save|download|export|keep|copy)\s+(?:this|the|our|my)\s+(?:conversation|chat)\b/i,
  ],
  'n-languages': [
    /\b(?:other|another)\s+languages?\b|\bdo\s+you\s+(?:speak|support|offer)\s+(?:spanish|french|german|portuguese|chinese|arabic|hindi|italian|japanese|korean|russian)\b|\bhelp\s+translate\b|\bis\s+there\s+a\s+translation(?!\s+of\s+(?:my|his|her|their|a|an|the\s+(?:letter|book|text|document|word)))\b|\bcan\s+i\s+use\s+(?:this|it|nenya)\s+in\s+(?:spanish|french|german|portuguese|chinese|arabic|hindi|italian|japanese|korean|russian)\b/i,
    new RegExp(`\\b(?:translate|translation)\\s+(?:of\\s+)?(?:${SITE}|nenya|it)\\b|\\bcan\\s+(?:i|you)\\s+(?:use|talk|speak)\\s+(?:${SITE}|to\\s+you)\\s+in\\s+\\w+\\b`, 'i'),
  ],
  'n-terms-change': [
    /\bwhy\s+(?:was\s+i|am\s+i|did\s+i\s+get)\s+(?:asked|prompted)\s+to\s+agree\s+again\b|\bwhat\s+changed\s+in\s+the\s+terms\b|\bwhere\s+are\s+the\s+(?:old|earlier|previous)\s+terms\b|\bagree\s+again\b/i,
  ],
  'n-else': [
    new RegExp(`\\bwhat\\s+can\\s+(?:${SITE}|nenya)\\s+(?:do|offer|have)\\b|\\bwhat\\s+else\\s+(?:is\\s+(?:here|there)|can\\s+i\\s+do\\s+here)\\b`, 'i'),
    /\bwhat\s+are\s+the\s+(?:six\s+)?gateways\b|\bwhat\s+is\s+the\s+breathing\s+tool\b|\bwhere\s+do\s+i\s+start\b|\bwhat\s+features\b/i,
  ],
  'n-what': [
    new RegExp(`\\bwhat\\s+does\\s+(?:${SITE}|nenya)\\s+do\\b|\\bwhat(?:'s|\\s+is|\\s+are)\\s+(?:nenya|${SITE})\\b|\\bwhat\\s+is\\s+nenya\\s+(?:about|for)\\b|\\btell\\s+me\\s+about\\s+(?:nenya|${SITE})\\b`, 'i'),
  ],
  'c-angry': [], // handled by the hostile-turn path, not by a pre-written card
};

// Added 2026-11-09 from the synthetic corpus (src/lib/aboutEvalCorpus.ts): more ways of asking the same questions. Each is anchored on this site, Nenya,
// the coach or "you", or is a whole-sentence question, so a person talking about something else is left alone.
const EXTRA_PATTERNS: Record<string, RegExp[]> = {
  'n-palette': [/\b(?:are|is|do|does|will)\s+(?:my\s+)?colou?rs?\s+(?:sent|shared|stored|saved|kept|going)\b|\bdoes\s+the\s+colou?r\s+api\s+(?:see|get|store|keep)\b|\bwhere\s+do\s+the\s+(?:colou?r|palette)\s+names\s+come\s+from\b|\bhow\s+are\s+colou?rs\s+named\b|\bis\s+the\s+palette\s+(?:maker|generator|tool)\s+(?:private|safe)\b|\bwhat\s+is\s+the\s+colou?r\s+api\b|\bdo\s+you\s+(?:store|keep|save|log)\s+my\s+colou?rs?\b/i],
  'n-report-share': [/\b(?:can|does|will|could|would)\s+(?:the\s+coach|you)\s+(?:see|read|access|use|look\s+at)\s+(?:my\s+|the\s+)?(?:report|reflection|colou?rs|answers|results)\b|\bcan\s+i\s+(?:share|show|bring|give)\s+(?:my\s+|the\s+|a\s+)?(?:report|reflection)\s+(?:with|to)\s+(?:you|the\s+coach)\b|\bdoes\s+the\s+coach\s+see\s+what\s+i\s+(?:did|chose|picked|made)\b|\bwill\s+my\s+(?:report|reflection)\s+be\s+(?:sent|shared|seen)\b/i],
  'n-what': [/\bwhat\s+even\s+is\s+(?:this|nenya)\b|\bwhat\s+is\s+this\s+(?:site|app|website|place|tool)\s+(?:for|about)\b|\bwhat(?:'s|s)\s+this\s+(?:site|app|website|place)\s+about\b|\bwhat\s+this\s+(?:website|site|app)\s+is\s+for\b|\bexplain\s+what\s+(?:nenya|this\s+(?:site|app))\s+is\b/i],
  'n-name': [/\bis\s+nenya\s+a\s+word\b|\bstory\s+behind\s+the\s+name\b/i],
  'n-who': [/\bwho(?:'s|\s+is)\s+(?:running|behind|responsible\s+for)\s+(?:this|nenya|the\s+(?:site|app|project))\b|\bis\s+there\s+a\s+(?:team|company|person|group)\s+behind\s+(?:this|nenya)\b|\bwho\s+(?:built|created|made|owns)\s+(?:nenya|this(?:\s+(?:thing|site|app|place|website|coach|tool))?)(?=\s*[?.!,]|\s*$)/i],
  'n-founder': [/\bis\s+there\s+(?:one|a\s+single)\s+person\s+behind\s+(?:this|nenya)\b|\bwho\s+(?:started|founded|came\s+up\s+with)\s+(?:this|nenya)\b|\bwho\s+is\s+the\s+person\s+who\s+(?:started|made|created|founded)\s+(?:this|nenya)\b/i],
  'n-contact': [/\bcan\s+i\s+email\s+someone\b|\bhow\s+do\s+i\s+reach\s+the\s+people\s+(?:who\s+run|behind)\s+(?:this|nenya)\b/i],
  'n-free': [/\bis\s+this\s+free(?!\s+(?:time|space|day|week|period|hour|moment|will))\b|\bdoes\s+(?:nenya|this\s+(?:site|app))\s+cost\b|\bhow\s+is\s+(?:this|nenya|it)\s+funded\b|\bhow\s+does\s+(?:nenya|this\s+(?:site|app|place))\s+make\s+money\b|\bis\s+this\s+going\s+to\s+cost\s+me\b/i],
  'n-privacy': [/\bcan\s+anyone\s+see\s+what\s+i\s+(?:do|type|write|say)\s+(?:here|on\s+this)\b|\bis\s+it\s+safe\s+to\s+use\s+(?:nenya|this\s+(?:site|app))\b|\bwho\s+can\s+see\s+(?:my\s+\w+|what\s+i\s+\w+)\s+here\b|\bis\s+what\s+i\s+(?:do|type)\s+(?:here|on\s+this\s+site)\s+private\b/i],
  'n-privacy-coach': [/\bdoes\s+anyone\s+read\s+(?:these|my|our)\s+(?:chats|messages|conversations)\b|\bare\s+you\s+(?:saving|storing|recording|logging)\s+(?:what|my|our)\b|\bare\s+my\s+(?:chats|messages|conversations)\s+(?:stored|saved|kept)\b/i],
  'n-device': [/\bhow\s+do\s+i\s+clear\s+what\s+(?:nenya|this\s+(?:site|app))\s+saved\b|\bis\s+anything\s+(?:stored|saved)\s+in\s+my\s+browser\b|\bdoes\s+(?:this|the)\s+site\s+save\s+anything\b|\bwhat\s+does\s+(?:the\s+)?forget\s+me\s+(?:button\s+)?do\b/i],
  'n-limits': [/\bwhy\s+(?:can'?t|cant)\s+i\s+keep\s+(?:talking|chatting)\b|\bwhy\s+does\s+(?:the\s+)?(?:chat|conversation)\s+end\s+after\b|\bwhy\s+can\s+i\s+only\s+(?:send|have|get)\s+(?:a\s+few|five|\d+)\b|\bwhy\s+do\s+i\s+have\s+to\s+wait\s+(?:before|to)\s+chat/i],
  'n-howworks': [/\bwhich\s+ai\s+is\s+this\b|\bis\s+this\s+(?:chat\s*gpt|gpt|claude|gemini)\b|\bwhat\s+(?:language\s+model|llm)\s+(?:powers|is)\b|\bhow\s+does\s+the\s+coach\s+work\b|\bare\s+you\s+built\s+on\b|\bwhich\s+company\s+makes\s+the\s+ai\b/i],
  'n-opensource': [/\bcan\s+i\s+copy\s+this\s+and\s+run\b|\bwhere\s+is\s+the\s+source\s+code\b|\bis\s+the\s+code\s+public\b|\bcan\s+i\s+(?:read|see)\s+how\s+(?:this|it)\s+works\b/i],
  'n-affiliation': [/\bofficial\s+nvc\b|\bdo\s+the\s+nvc\s+(?:people|trainers|folks)\s+approve\b|\bmade\s+by\s+nvc\s+trainers\b/i],
  'n-nvc': [/\bwhat\s+are\s+feelings\s+and\s+needs\b|\bis\s+this\s+based\s+on\s+nvc\b|\bhow\s+does\s+nenya\s+use\s+nvc\b|\bwhat\s+is\s+the\s+nvc\s+approach\b|\bwhat\s+is\s+this\s+nvc\s+thing\b/i],
  'n-notherapy': [/\bsafe\s+to\s+use\s+if\s+(?:i'?m|i\s+am)\s+in\s+(?:treatment|therapy|counseling)\b|\bis\s+this\s+therapy\s*[?.!]*\s*$|\b(?:can\s+)?this\s+replace\s+(?:therapy|counseling)\b|\bsubstitute\s+for\s+(?:therapy|counseling)\b|\bclinically\s+validated\b|\bis\s+this\s+a\s+medical\s+tool\b/i],
  'n-accessibility': [/\bturn\s+off\s+(?:the\s+)?animations\b|\bhigh[- ]contrast\b/i],
  'n-version': [/\bwhat\s+build\s+(?:am\s+i|is\s+this)\b/i],
  'n-report': [/\bsomething\s+is\s+broken,?\s+who\b|\breport\s+a\s+wrong\s+(?:safety\s+)?notice\b|\bflagged\s+by\s+mistake\b|\breport\s+an\s+error\s+on\s+this\s+site\b/i],
  'n-transcripts': [/\bget\s+a\s+copy\s+of\s+(?:this|our)\s+(?:conversation|chat)\b|\bsigned\s+copy\s+mean\b|\bshow\s+someone\s+what\s+the\s+coach\b/i],
  'n-safety': [/\bwhat\s+happens\s+if\s+i\s+say\s+something\s+scary\b|\bhow\s+does\s+nenya\s+keep\s+people\s+safe\b|\bwhat\s+do\s+you\s+do\s+if\s+someone\s+is\s+in\s+crisis\b|\bcheck\s+for\s+crisis\s+words\b|\bwhat\s+safeguards\b/i],
  'n-languages': [/\bis\s+there\s+a\s+(?:spanish|french|german|portuguese|chinese|arabic|hindi|italian|japanese|korean|russian)\s+version\b|\bavailable\s+in\s+(?:spanish|french|german|portuguese|chinese|arabic|hindi|italian|japanese|korean|russian)\b/i],
  'n-else': [/\bwhat\s+other\s+tools\s+are\s+on\s+(?:this|the)\s+site\b|\bwhat\s+can\s+i\s+do\s+(?:on\s+nenya|here)\s+besides\b|\bwhat\s+is\s+on\s+this\s+site\b/i],
  'n-terms-change': [/\bdid\s+the\s+terms\s+change\b|\bwhy\s+do\s+i\s+have\s+to\s+accept\s+the\s+terms\b|\bwhat\s+is\s+different\s+in\s+the\s+new\s+terms\b/i],
  'c-ai': [/\bare\s+you\s+actually\s+(?:a\s+)?(?:person|human|real)\b|\bis\s+a\s+real\s+person\s+reading\b/i],
  'c-memory': [/\bdo\s+you\s+keep\s+a\s+memory\s+of\s+me\b|\bif\s+i\s+come\s+back\s+will\s+you\s+know\s+me\b|\bdo\s+you\s+recogni[sz]e\s+me\b/i],
  'c-feelings': [/\bcan\s+i\s+hurt\s+your\s+feelings\b|\bdo\s+you\s+(?:actually|really)\s+feel\s+anything\b|\bdo\s+you\s+feel\s+sad\s+when\s+i\b|\bdo\s+you\s+get\s+lonely\b|\bdo\s+you\s+really\s+care\b|\bdoes\s+it\s+bother\s+you\s+when\s+i\b/i],
  'c-friend': [/\bwill\s+you\s+be\s+there\s+for\s+me\s+always\b|\bcan\s+i\s+just\s+talk\s+to\s+you\s+instead\s+of\s+people\b|\bare\s+you\s+the\s+only\s+one\s+who\s+understands\s+me\b|\bdo\s+you\s+think\s+i\s+have\s+(?:depression|anxiety|adhd|ptsd|bipolar)\b/i],
  'c-scam': [/\bdata\s+grab\b|\bscheme\s+to\s+get\s+my\b/i],
  'c-stopped': [/\bwhy\s+did\s+(?:it|the\s+(?:chat|coach|conversation))\s+(?:end|stop|shut(?:\s+down)?)(?:\s+(?:the\s+(?:chat|conversation)|talking|so\s+(?:soon|suddenly)|at\s+five|after\s+\w+))?\s*[?.!]*\s*$|\bwhy\s+can'?t\s+i\s+send\s+this\s+message\b|\bwhy\s+did\s+you\s+shut\b|\bwhy\s+did\s+it\s+say\s+that\s+was\s+flagged\b/i],
  'c-can': [/\bwhat\s+are\s+you\s+(?:good\s+at|able\s+to\s+do)\b|\bwhat\s+can'?t\s+you\s+do\b|\bwhat\s+kind\s+of\s+help\s+can\s+i\s+get\s+from\s+you\b/i],
  'c-methods': [/\bwhere\s+does\s+your\s+approach\s+come\s+from\b|\bwho\s+trained\s+you\s+to\b|\bhow\s+did\s+you\s+learn\s+to\s+talk\b|\bwhat\s+is\s+your\s+training\b/i],
  'c-wrote': [/\bwas\s+that\s+(?:message\s+)?written\s+by\s+a\s+(?:human|person)\b|\bis\s+the\s+greeting\s+scripted\b|\bwho\s+wrote\s+the\s+opening\s+message\b/i],
};
for (const [id, res] of Object.entries(EXTRA_PATTERNS)) ABOUT_PATTERNS[id] = [...(ABOUT_PATTERNS[id] ?? []), ...res];

// Very short messages that are plainly about the site even without naming it ("is this free?", "who runs this?"). Anchored to the whole message, and
// only for messages up to 80 characters, so "is this free?" is answered but "is this free time I'm wasting on my boss" is not.
const LEAD = "(?:hey|hi|hello|so|ok|okay|um|quick question|one question|just curious|sorry)?[,.:! ]*";
export const ABOUT_BARE: Record<string, string> = {
  'n-what': "what\\s+(?:does\\s+this\\s+do|is\\s+this(?:\\s+about)?|is\\s+this\\s+for|is\\s+this\\s+(?:site|app|thing|place))|what(?:'s|s)\\s+this(?:\\s+about)?",
  'n-else': "what\\s+can\\s+this\\s+do",
  'n-who': "(?:who\\s+(?:runs|owns|made|created|built|is\\s+behind|'s\\s+behind)\\s+(?:this|it))|(?:is\\s+this\\s+(?:a\\s+)?(?:company|nonprofit|non-profit|business|startup|charity))",
  'n-free': "(?:is\\s+(?:this|it)\\s+free)|(?:how\\s+much\\s+(?:does\\s+(?:it|this)|is\\s+(?:it|this))\\s+(?:cost)?)|(?:who\\s+pays\\s+for\\s+(?:this|it))",
  'n-privacy': "is\\s+(?:this|it)\\s+(?:private|safe|secure|anonymous|confidential)",
  'n-notherapy': "(?:is\\s+this\\s+(?:therapy|medical|a\\s+therapy\\s+(?:tool|app)))|(?:is\\s+(?:it|this)\\s+safe\\s+to\\s+use)",
  'n-accessibility': "is\\s+(?:this|it)\\s+accessible",
  'n-version': "is\\s+this\\s+the\\s+latest",
  'n-report': "i\\s+found\\s+a\\s+(?:bug|problem|glitch|mistake|error)(?:\\s+(?:here|on\\s+the\\s+site|with\\s+(?:this|the\\s+(?:site|app|coach))))?",
};
const BARE_RE: Record<string, RegExp> = Object.fromEntries(Object.entries(ABOUT_BARE).map(([id, alt]) => [id, new RegExp(`^${LEAD}(?:${alt})[ ?!.]*$`, 'i')]));
export const ABOUT_BARE_MAX_CHARS = 80;

// "my friend Nenya", "a cat called Nenya": the word is a name in the person's own story, not this site.
const A_NAMED_NENYA = /\b(?:my|our|his|her|their|a|the)\s+(?:\w+\s+){0,2}(?:named|called)\s+nenya\b|\b(?:my|our|his|her|their)\s+(?:friend|sister|daughter|cousin|dog|cat|neighbou?r|coworker|colleague|boss|ex|aunt|niece|mom|mother)\s+nenya\b/i;

/** The id of the answer to the question asked in this message, or null. Answers that are not yet live ('owner', 'pending') are still recognised, so the caller can choose to leave them to the coach. */
// "Is this a scam? My aunt got a text about her bank account": "this" is the text, not the site.
const SCAM_OTHER = /\b(?:text|email|e-mail|call|letter|offer|link|bank|account|invoice|package|listing|seller|charge|message from|phone call|ad|ads)\b/i;

export function detectAboutNenya(text: string): string | null {
  const t = text.replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim();
  if (!t || t.length > ABOUT_MAX_CHARS) return null;
  if (A_NAMED_NENYA.test(t)) return null;
  for (const id of ABOUT_ORDER) {
    if (id === 'c-scam' && SCAM_OTHER.test(t)) continue;
    if ((ABOUT_PATTERNS[id] ?? []).some((re) => re.test(t))) return id;
    if (t.length <= ABOUT_BARE_MAX_CHARS && BARE_RE[id]?.test(t)) return id;
  }
  return null;
}

/**
 * A question about Nenya inside a longer message (one the whole-message detector leaves alone because it is over the length limit): the live
 * answer to the first QUESTION sentence that asks one, or null. Only the phrase patterns count here, not the bare tier, so a short sentence
 * like "is it free?" inside a long story is not taken for a question about the site unless it names the site, the coach or Nenya.
 */
export function aboutAnswerWithin(text: string): Answer | null {
  const t = text.replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim();
  if (t.length <= ABOUT_MAX_CHARS) return null;
  for (const raw of t.split(/(?<=[.!?])\s+/)) {
    const sentence = raw.trim();
    if (!sentence.includes('?') || sentence.length > ABOUT_MAX_CHARS || A_NAMED_NENYA.test(sentence)) continue;
    for (const id of ABOUT_ORDER) {
      if (id === 'c-scam' && SCAM_OTHER.test(sentence)) continue;
      if ((ABOUT_PATTERNS[id] ?? []).some((re) => re.test(sentence))) {
        const a = liveAnswers().find((x) => x.id === id);
        if (a) return a;
      }
    }
  }
  return null;
}

/** The answers that may be used live: checked against their sources, and not waiting on a decision or a feature. */
export const liveAnswers = (): Answer[] => ANSWERS.filter((a) => a.status === 'ready');

/** The answer to use for a message, or null (nothing asked, or the answer is not live). */
export function aboutAnswerFor(text: string): Answer | null {
  const id = detectAboutNenya(text);
  return id ? liveAnswers().find((a) => a.id === id) ?? null : null;
}

// ───────────────────────── Filling in what the site knows at run time ─────────────────────────
// Some answers carry placeholders so they never go stale: {version} (the build label), {terms} (the date of the Terms), {commit_url} (a link to the
// exact commit this build was made from, the most precise place to review the code), and {model_clause} (the model's name, from the model actually in use).
// A model that is not listed here is simply not named, so a change of model can never leave a wrong name behind: add the new one here to name it.
export const MODEL_NAMES: Record<string, string> = {
  'e2ee-qwen-2-5-7b-p': 'Qwen 2.5 7B',
};

export interface FillContext {
  /** The model id in use (COACH_MODEL or the default). */
  model?: string;
  /** The build label, for example 1.1.0+679c4d2. */
  label?: string;
  /** The date of the Terms of Use & Privacy Policy. */
  terms?: string;
  /** The commit the build was made from (full or short). */
  commit?: string;
}

/** An answer with its placeholders filled. A link whose address cannot be built (no commit known) is dropped rather than left broken. */
export function fillAnswer(a: Answer, ctx: FillContext): { short: string; full: string[]; links: Link[] } {
  const name = ctx.model ? MODEL_NAMES[ctx.model] : undefined;
  const commit = ctx.commit && /^[0-9a-f]{7,40}$/i.test(ctx.commit) ? ctx.commit : '';
  const fill = (t: string) =>
    t.replace(/\{model_clause\}/g, name ? ` called ${name}` : '').replace(/\{version\}/g, ctx.label || 'unknown').replace(/\{terms\}/g, ctx.terms || 'the date shown in the Terms');
  return {
    short: fill(a.short),
    full: a.full.map(fill),
    links: a.links
      .map((l) => (l.href?.includes('{commit_url}') ? (commit ? { ...l, href: `${REPO}/commit/${commit}` } : null) : l))
      .filter((l): l is Link => !!l),
  };
}
