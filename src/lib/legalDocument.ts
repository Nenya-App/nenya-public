// Single source for the Terms of Use & Privacy Policy. The agreement
// window, the About page, and the PDF download all render from this, so
// they can never drift apart. Earlier versions are archived as markdown in
// docs/legal/archive (outside the build, so they add nothing to the site).
//
// Rewritten in full on November 14, 2026 (approved by the owner): each topic in one place, the same commitments.
// When this changes, archive the outgoing text first (docs/legal/README.md), and keep every "Section N"
// reference on the site pointing at the right section (tests/legal-sections.test.mts checks them).

export interface LegalSubsection {
  heading: string;
  paragraphs: string[];
}

export interface LegalSection {
  number: number;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  /** Paragraphs that follow the bullets. */
  after?: string[];
  /** Short headed parts, after everything above. */
  subsections?: LegalSubsection[];
}

export interface LegalPart {
  title: string;
  sections: LegalSection[];
}

export const LEGAL_TITLE = 'Terms of Use & Privacy Policy';
export const LEGAL_EFFECTIVE_DATE = 'November 15, 2026';

export const LEGAL_INTRO =
  'Welcome. Please read this before you begin. It has two parts: the Terms of Use, which cover how you may use Nenya, and the Privacy Policy, which covers what little information reaches us. They sit together because Nenya’s privacy design is also its central promise.';

export const LEGAL_CLOSING =
  'By choosing “Agree, Enter,” you confirm that you have read, understood and agree to these terms. Thank you for your presence here.';

export const LEGAL_PARTS: LegalPart[] = [
  {
    title: 'Part One: Terms of Use',
    sections: [
      {
        number: 1,
        heading: 'What Nenya is, and is not',
        paragraphs: [
          'Nenya is a free space for personal reflection and sensory exploration, best understood as interactive art: a place to pause, breathe, and look at your inner world through structured, sensory activities. It is a mirror for your own thoughts, not a source of answers.',
          'Nenya is not a medical device, a therapeutic service, or a substitute for professional care. It makes no claims about, and offers no treatment for, any medical, psychological or psychiatric condition, and it is not designed to diagnose, treat, cure or manage any illness or distress. If you live with a clinical mental health condition, please seek the support of a qualified professional.',
        ],
      },
      {
        number: 2,
        heading: 'Who may use Nenya',
        paragraphs: [
          'Nenya is for people aged 13 and older, or the minimum age in your country for using online services on your own, whichever is higher. If you are younger, please use it only with a parent or guardian. If you are under 18, please use the coach demo only with a parent’s or guardian’s consent.',
        ],
      },
      {
        number: 3,
        heading: 'Using Nenya well',
        paragraphs: [
          'By entering, you agree to use Nenya for personal reflection. You are responsible for your own well-being: if you feel unsettled or overwhelmed at any point, step away and return to your surroundings.',
          'Strong feelings, including anger and disagreement with Nenya or the coach, are welcome. The coach is software; it is not hurt by what you say, and hostile words aimed at it are not a reason for it to end your conversation.',
          'Please do not use Nenya to produce or share language that treats a person or a group as less than human (for example calling people animals, vermin or a disease, or wishing them gone), to threaten or harass anyone, or to plan harm. If a conversation goes that way, the coach may say plainly where it stands, turn back to your own feelings and needs, or decline to continue. These checks are simple phrase matching and can be wrong.',
          'In the coach demo, please also do not: use it for anything illegal; produce anything that abuses or exploits a child; infringe anyone’s rights, including their privacy or the use of their name, voice or likeness; misstate your age or pretend to be someone else; use bots, scripts or automated requests; try to get around its checks or security; resell or pass on access to it; or rely on it where a wrong reply could cause death, serious injury or significant harm. Venice AI, which runs the model behind the coach, asks the same of everyone who uses its service, through us or directly.',
          'If a message suggests you may be in distress or in danger, the coach responds with care and resources, as Sections 4 and 15 describe.',
        ],
      },
      {
        number: 4,
        heading: 'If you are in crisis',
        paragraphs: [
          'Nenya is not equipped, and its makers are not qualified, to support anyone in crisis. If you feel hopeless, are thinking of harming yourself or someone else, or are in danger, please leave this page and contact a person now: in the US and Canada, call or text 988, or call your local emergency number (911). Elsewhere, findahelpline.com lists lines in your country. The coach demo’s own safety checks are described in Section 15.',
        ],
      },
      {
        number: 5,
        heading: 'What you send us',
        paragraphs: [
          'The site has an optional form for sending a report, feedback, a message, or a signed coach transcript (accepted only if it carries Nenya’s signature). Using it is always your choice. By sending something, you allow us to read, store and use it to understand problems and improve Nenya, and to share it only in anonymized or summarized form. Please leave out names, contact details and anything else that identifies you or anyone else. We will not use a submission to contact you unless you ask us to. To have one deleted, email us (Section 21). How submissions are handled is in Section 14.',
        ],
      },
      {
        number: 6,
        heading: 'Code, name, and your own work',
        paragraphs: [
          'Nenya’s source code is public under the GNU Affero General Public License v3.0 (github.com/Nenya-App/nenya-public); you may inspect, run, modify and share it under that license. The Nenya name and logo are reserved separately as trademarks (see TRADEMARK.md in the repository). Your reflections and reports are your own.',
        ],
      },
      {
        number: 7,
        heading: 'Moving images',
        paragraphs: [
          'Nenya uses a pulsing breathing animation, slowly shifting colors and gently turning imagery. Nothing is designed to strobe or flash, but if moving light or color troubles you, you can reduce or turn off the animations at any time in Accessibility Settings, and the site follows your device’s reduced-motion setting.',
        ],
      },
      {
        number: 8,
        heading: 'No warranties',
        paragraphs: [
          'Nenya is free and provided “as is” and “as available.” To the fullest extent the law allows, we make no warranties of any kind, express or implied, including that the site will be uninterrupted, error-free, secure or fit for a particular purpose, and we do not promise any particular effect on your well-being.',
          'This includes the coach demo’s replies, which are written by an AI model run by Venice AI, not by us. They can be wrong, incomplete or offensive; they are not medical, legal, financial, tax or mental health advice; and you rely on them at your own risk. We make no promise on Venice AI’s behalf about its service.',
        ],
      },
      {
        number: 9,
        heading: 'Limitation of liability',
        paragraphs: [
          'To the fullest extent the law allows, we are not liable for indirect, incidental, special, consequential or punitive damages, or for any loss from using or being unable to use the site. Where liability cannot be excluded, our total liability to you is limited to USD $100. Nothing here limits liability that cannot lawfully be limited (in some places, for death or personal injury caused by negligence, or for fraud), or any rights you have as a consumer where you live.',
          'To the same extent, these disclaimers and limits also protect Venice AI, which provides the model behind the coach demo, for anything arising from your use of the demo.',
        ],
      },
      {
        number: 10,
        heading: 'Governing law, and changes',
        paragraphs: [
          'These terms are governed by the laws of the State of Minnesota, USA, without regard to conflict-of-law rules, and disputes go to the state or federal courts in Ramsey County, Minnesota; if you are a consumer in another country, you keep any right to bring a claim in your local courts that cannot be waived. If any part of these terms is unenforceable, the rest still applies.',
          'We may update this document. When we do, the effective date changes and you are asked to agree again when you enter (unless you chose to remember your agreement on this device and nothing has changed). Using the site after that means you accept the update. We collect no contact details, so we cannot notify you directly. Earlier versions are kept at github.com/Nenya-App/nenya-public/tree/main/docs/legal.',
        ],
      },
    ],
  },
  {
    title: 'Part Two: Privacy Policy',
    sections: [
      {
        number: 11,
        heading: 'Who we are',
        paragraphs: [
          'This policy covers nenya.biz (the “site”). Nenya is a project operated by Estëlle as a sole proprietor and fiscally sponsored by Fractured Atlas, Inc., a 501(c)(3) public charity. Contact: info@nenya.biz, for anything in this document. We do not publish a postal address; if a data protection authority or other regulator needs one, we will provide it on request.',
        ],
      },
      {
        number: 12,
        heading: 'The short version',
        paragraphs: [],
        bullets: [
          'No accounts, no advertising, no tracking cookies, nothing that follows you around the internet.',
          'What you enter in the reflection tools (colors, melodies, drawings, body-map placements, written reflections) stays in your browser, is never sent to us, and is gone when you close the tab, unless you choose “Save and return later”: then it is kept on this device, locked with your passcode, for at most 24 hours (Section 16). A PDF report is made on your own device.',
          'Our web host keeps ordinary connection logs and gives us visit totals (Section 13). We keep plain daily totals of our own, which identify no one.',
          'Things leave your device only when you choose: the report form (Section 14), a palette from The Color API (Section 14), the coach demo (Section 15), and the signed note when you agree to these Terms (Section 16).',
          'By default the only thing kept on your device between visits is one timestamp after a coach conversation. If you choose “Remember my settings on this device,” your display settings and your agreement are kept too (Section 16).',
        ],
      },
      {
        number: 13,
        heading: 'What our host sees, and visit counts',
        paragraphs: [
          'Nenya is hosted by Netlify. Like any host, Netlify logs connection details for each request, typically your IP address, browser type, the page requested and the time, for security and reliability. Nenya’s own code does not store them and reads your address in one place only: when you send a message to the coach demo, to apply its daily limit (Section 15). Netlify also tells our code which country your connection appears to be in, worked out from your address; the coach demo uses only that two-letter country code, to check that it is open where you are (Section 15), and does not store or log it. Netlify’s handling is described at netlify.com/privacy.',
          'We use Netlify’s built-in visit statistics (Web Analytics). They are built from the same server logs: nothing runs in your browser, no cookie is set, nothing is stored on your device. They show totals such as page requests, unique visitors (counted from connection addresses within a day), where visitors came from, and approximate country. We see totals, never a list of visitors, and we cannot link them to anything you enter, because that never reaches us. Netlify keeps these records under its own practices.',
          'We also keep our own plain daily totals: numbers only, with nothing about who produced them. They count how often each part of the site is opened, where visitors choose to start when the site asks (breathing, reflection or the coach), which breathing rhythm is chosen, and whether the tour is taken (only after you agree to these terms, and not at all if your browser sends the Global Privacy Control signal); and, in the coach demo, how many messages are sent, answered or refused (with a reason, such as a safety stop, a limit, a connection outside the United States, or a message too short to read), how many conversations start and finish, how many signed transcripts and reports are made or rejected, and how many times someone presses “This was a mistake” under a reply, by the kind of check it was about. We never count what you type, draw or choose, and we do not count use of Emergency Exit. These totals are stored with Netlify and kept while useful, since they identify no one.',
          'Legal basis (GDPR Art. 6(1)(f)): our legitimate interest in running and securing the site, understanding how much it is used, and keeping the free coach demo available and affordable.',
        ],
      },
      {
        number: 14,
        heading: 'Things you choose to send us',
        paragraphs: [],
        bullets: [
          'The report form (Section 5), the form for a reflection summary, and the contact form: the text of your report or message and an optional comment, kept in our own private storage with our host (not in an email inbox or a form service). We do not ask for your name or email; anything identifying that you type becomes part of the submission. If you want a reply, you may include your email address, and we use it only to answer you. Each one is kept for 90 days and then deleted automatically. When you send it you get a deletion code, shown once; with it you can delete what you sent yourself, at once, at nenya.biz/my-transcript. We keep only a scrambled copy of the code, so we cannot show it again. We are told by email only that something arrived, never what it says.',
          'A palette from The Color API (Sight gateway, only if you press “Ask The Color API”): your page sends one color, as a hex code, and the kind of palette you picked, to our server, which asks The Color API (thecolorapi.com, by Josh Beckman) over a secure connection and returns five colors. That service sees our server and the color, nothing else: not your address, not a cookie, not anything you wrote. Its own terms apply to what it receives. We do not store or log the color or the request; we keep only a count under a one-way daily code, deleted within two days, so the feature cannot be used without limit. Making a palette on your device, suggesting a color name, and bridging from your current to your wish color send nothing anywhere. A palette you keep goes into your report as your own colors, marked with where it was made.',
        ],
      },
      {
        number: 15,
        heading: 'The coach demo',
        paragraphs: [
          'The coach demo is an optional early prototype of a conversational coach, at the end of the reflection tools or at nenya.biz/coach. It is the only place on the site where what you type is sent to an AI service. It is not therapy, cannot help in a crisis, and is not for anyone under 13 or the minimum age in your country (Section 2).',
          'For now, it is open only to connections our host places in the United States or its territories, because Venice AI’s terms say its service is intended for people located there. Our host works out the country from your IP address; our code receives only the two-letter country code, uses it for this check, sends it back only to your own page so it can tell you what was decided, and neither stores nor logs it. A message from elsewhere is refused before it is read, and we count only that a visit was turned away. The location lookup can be wrong (for example through a VPN), and we cannot change it by hand.',
        ],
        subsections: [
          { heading: 'Where your words go', paragraphs: [
            'Your messages go through our server (hosted by Netlify) to Venice AI, which writes the replies. A conversation has at most five exchanges, and a message at most 500 characters. We do not store your messages or the replies and do not write them to our logs; they live in your browser tab and are gone when you close it. Venice AI handles what it receives under its own terms (https://venice.ai/legal/tos) and privacy policy (https://venice.ai/legal/privacy-policy), which we do not control. Venice AI’s terms say it does not use what it receives to train AI models and requires the model providers it works with not to either. The coach currently uses Qwen 2.5 7B, a small model, in a mode Venice labels “Private”: our server encrypts your message so that only Venice’s secure processing environment can read it, and Venice’s service relays only encrypted data. This is not encryption from your device: your message first reaches our server, which reads it in memory to remove identifiers, check for crisis and screen it, and does not store it. We may change the model; if we move to one without this protection, we will say so here first. Venice and Netlify may process data outside your country.',
          ] },
          { heading: 'Removing identifiers', paragraphs: [
            'Before a message is sent, the page replaces some common identifiers (email addresses, phone numbers, street addresses, some names) with placeholders, and our server does it again. This is not a guarantee, and most names are not caught, so please leave out names, contact details and anything else identifying.',
          ] },
          { heading: 'Your session colors', paragraphs: [
            'Two colors label the session: a random pair you can change, or your Sight gateway colors if you came from there. They are not an account, we do not store them, and they appear on any transcript you download or send.',
          ] },
          { heading: 'Bringing parts of a report', paragraphs: [
            'You may choose to bring parts of a sensory report; it is never automatic and never required. The page shows the report in pieces with nothing selected and shows the exact words that would be sent, with identifiers replaced. For a color, those words name its palette and add a short note about it (an image, and a few rough guesses at feelings and needs, written by us). The words you choose are sent and checked exactly like a message: identifiers replaced, text that looks like instructions to the coach left out, and the crisis check run. If shared text is flagged, the page shows the safety notice and resources and the coach responds with care; this does not end the conversation. We do not store what you share; it is part of a signed transcript if you ask for one. Nenya’s palettes are starting points, not a scientific or medical instrument, and no color has a fixed meaning.',
          ] },
          { heading: 'Safety checks and stops', paragraphs: [
            'Every message is checked for signs of crisis. If a message clearly suggests that you or someone else may be in danger, says that you have seriously harmed someone (for example by violence, abuse, sexual harm or trafficking), describes violence in graphic detail, or says you are attracted to children, it is not sent to the AI, the conversation ends, and the page shows emergency numbers and support lines; when the message says you have harmed someone, it also shows how to find a lawyer and a short, factual note on what reporting involves. Such a message never leaves your device: the page catches it before anything is sent, so we never receive it, and we have nothing to keep or to report to anyone. It reaches us only if you choose to send it: if you ask for a signed transcript, it passes through our server to be signed and is not stored; if you send us a report that a notice was wrong and choose to include your message, we receive it with your report (Section 14). After a stop, the page does not offer to continue on Venice AI for the rest of your visit. If a message is less clear, it is sent with an instruction to respond with care, and the page shows the same resources. These checks are simple phrase matching: they can miss things and can flag harmless words. If you think a notice was wrong, you can report it; a report is sent only if you press Send, and includes your message only if you choose.',
          ] },
          { heading: 'Other checks', paragraphs: [
            'A message that tries to give the coach instructions or change how it works (such as asking it to ignore its rules or reveal its setup) is not sent, and you can reword it. A message too short or unclear to read (a single word, a slip of the keys) is not sent and does not use a turn; your text stays in the box. That check never applies to a message that mentions distress or danger. These checks are simple and can be wrong. Under some replies a “This was a mistake” link lets you tell us a check was wrong; pressing it adds one to a daily total (Section 13) and sends nothing about your message.',
          ] },
          { heading: 'Check for automated traffic', paragraphs: [
            'Before your first message in a conversation, the page runs Cloudflare Turnstile, a check that tells people from automated traffic. Usually you will not see it; sometimes it asks you to tick a box. To do this, Cloudflare receives your IP address and signals from your browser and connection, which Cloudflare lists as the “TLS fingerprint”, the User-Agent header and the site’s key and address, under its own Turnstile privacy policy (https://www.cloudflare.com/turnstile-privacy-policy/), which we do not control. Our server receives only a single-use token, sends it to Cloudflare with our key (not your address and nothing of what you write), and learns only whether the check passed. We do not store the result and do not log it; we keep only a daily count of checks that passed or failed. Later messages in the same conversation need no check. If the check cannot load (some blockers stop it), the coach cannot start for now. Cloudflare may process this data outside your country.',
          ] },
          { heading: 'Words the site writes, not the AI', paragraphs: [
            'These are safety precautions, and this is the full list. The page writes the opening greeting (or, if you brought parts of a report, an opening built from what you shared), the closing message, and the safety notice with its resources; none of these is sent to the AI. Our server adds short sentences to a reply in some situations: a pointer to a crisis line when a message suggests distress, self-harm, hurting yourself on purpose, abuse, or a risk of hurting someone; and a brief “Thank you for telling me.” after critical feedback about the coach, the site, Nonviolent Communication or the use of AI. When the coach’s reply is about contempt for a group or a wish to harm one, our server may put a plain sentence of its own in front of it, or take out sentences that repeated that contempt or wish back to you. When a message may signal distress, it may take out sentences of the reply that told you to calm down or not to worry, spoke as if the AI could be with you, or asked about painful thoughts; if nothing else is left, a short sentence of the site’s own stands in. It may take an apology out of a reply to a message hostile toward the coach. When a reply claims something about how Nenya runs or about your data that the AI cannot know, or speaks as if the AI had a human life or were not an AI, our server asks the AI once to answer again and, if needed, replaces the reply with a short fixed sentence. When you ask about Nenya itself (who runs it, which model it uses, where your messages go), the reply is a pre-written answer from our server, checked against these terms and the About pages; it is not sent to the AI, counts as one exchange, and has a card linking to the pages that explain more. At the end of a conversation in which you were critical, the page invites you to send the conversation to us with a note, if you want to; nothing is sent unless you choose. All of these are fixed texts in our public source code, not AI output; the phrase checks behind them can be wrong in both directions.',
          ] },
          { heading: 'Transcripts', paragraphs: [
            'After your first exchange, and when a conversation finishes, you can download a transcript. If you ask for a signed copy, your page sends the conversation to our server once more, which confirms it matches what the server produced and adds a dated signature. The signature also covers whether the conversation reached its end, how many exchanges it holds, a fingerprint of the coach version that wrote the replies (the site’s version, the model and the instructions), and, if you agreed to these Terms in this visit, the note of that agreement; none of this identifies you. A signed copy includes the site’s own words you were shown, marks each pre-written answer, replaced reply, and sentence the site added or took out (for a removal, how many sentences, not what they said), and adds a short note for each message the safety check flagged saying which words matched or which step applied, so it shows what you saw and why. Our server records a site edit only if it can prove it made it. We do not record whether you opened or clicked anything the page offered. If the safety check stopped your last message, a signed copy includes that message so a mistaken stop can be shown exactly; the server runs the check again and signs only if it does stop it, and does not keep or log the message. We do not store the conversation; the signed file stays with you. For 30 days we keep a short code (a hash) for each signed transcript, which cannot be turned back into your words, to recognize duplicate reports and confirm we issued it, plus a plain daily total. If you choose to send a signed transcript to us, you see exactly what will be sent first and may add a note; our server checks the signature, refuses an unsigned or altered transcript, and passes it on without keeping or logging it, through a separate form (Section 14). Anyone can check a signed transcript at nenya.biz/verify, on their own device, with nothing uploaded.',
          ] },
          { heading: 'Limits', paragraphs: [
            'Each reply costs real money, so there are limits. When a conversation ends without a safety notice, the page saves the current time in your browser’s local storage, and only the time, so the free demo rests for 6 hours before opening again on that device. It is not an identifier, it is never sent to us, and “Forget me” or clearing this site’s data removes it; it is not meant to stop someone determined. There are also two daily limits on our server. For all visitors together, the demo handles a set number of messages each day, counted as a single running number with nothing about who sent them. For each connection, up to 10 messages a day (two full conversations); a new conversation is refused once they are used, and a conversation already under way is never cut off. A message stopped by a limit reaches our server, is not passed to Venice AI, and is not kept. Shared networks count together.',
            'To count the per-connection limit, our server reads your IP address when you send a message, mixes it (for IPv6, its network part) with the date and a secret key into a one-way code, and keeps one number under that code: how many messages the connection sent today. A conversation’s messages count against the connection that started it, so the code also travels inside the signed ticket your page holds during the conversation. Nobody without the key can turn the code back into your address, it changes every day, and it is deleted within two days. Nothing else is stored with it. If our store cannot be reached, the limit is skipped rather than blocking you. “Forget me” cannot reset it, because it is not on your device.',
          ] },
          { heading: 'Continuing on Venice', paragraphs: [
            'When the demo ends without a safety notice, the page offers a link to continue with the same character on Venice AI’s own site. After a safety stop it does not, here or on the review page, for the rest of your visit: the emergency numbers and support lines are the next step, and none of Nenya’s checks run on Venice. The page remembers the stop only in its memory, never in storage, so nothing on your device records it. Venice AI is a separate service under its own terms and privacy policy (linked above); none of the checks above run there, and nothing from the demo is carried over. Its terms differ from ours: for example, most features need an account, anyone under 18 needs a parent’s or guardian’s consent, the service is intended for people in the United States, and disputes go to binding individual arbitration with no class actions, unless you opt out by mail within 30 days. The Venice links carry Nenya’s referral code: if you sign up for a paid Pro account through them, Nenya earns $10 in Venice credits, which help pay for the demo, and you receive a $10 welcome bonus. It costs you nothing extra, and you can go to venice.ai directly instead.',
          ] },
          { heading: 'Legal basis', paragraphs: [
            'GDPR Art. 6(1)(a): your consent, given when you start the demo after reading the notice on its first screen.',
          ] },
        ],
      },
      {
        number: 16,
        heading: 'What stays on your device',
        paragraphs: [
          'Nenya sets no cookies and uses no fingerprinting. The one exception is the coach demo’s check for automated traffic (Section 15): Cloudflare’s check, not ours, reads signals from your browser and connection before your first message, and may store data for its own check inside its frame; we receive none of it. If you find a cookie from this domain that isn’t explained here, tell us.',
        ],
        bullets: [
          'Always, for your visit only: when you agree to these Terms, your browser asks our server to sign a short note: the date of these Terms, the time, and the version of the site. It contains no address and nothing about you, and our server does not keep it. Your browser holds it in session storage, which is erased when you close the tab. It is sent to us again only inside a transcript you download or a conversation you choose to send, so the file shows which Terms you had agreed to and when.',
          'By default, between visits: only the timestamp after a coach conversation (Section 15).',
          'Only if you turn on “Remember my settings on this device” (in the settings menu, or the box on the terms screen): your theme, text size, animation and breathing choices, the date of the terms you agreed to (so you are not asked each visit; if the terms change, you are asked again), and the signed note of your agreement.',
        ],
        after: [
          'These are kept in your browser’s storage, never sent to us, and we cannot read them. Turning the switch off erases what it saved. “Forget me” (in the settings menu and at the bottom of every page) erases everything saved on your device, and Emergency Exit erases everything before it leaves the page; neither can reset the coach’s server-side daily limit. We never save what you write, draw or answer, your session colors, or anything derived from them, with one exception you choose yourself: “Save and return later” keeps your finished gateways on this device, encrypted with a key made from your session ID and a passcode you pick, for at most 24 hours. Neither the ID nor the passcode is stored, and nothing is sent to us. It is erased after 24 hours, when you open it again, when you delete it, and by Forget me and Emergency Exit. A simple passcode stops a glance, not someone with time and this device; on a shared device, choose a longer one. Someone who opens the browser’s own storage tools can see that something locked is saved, but not what it says. Anyone who can use your device could see the saved items in its browser tools, so on a shared or watched device, leave the switch off and use Forget me or Emergency Exit when you finish.',
        ],
      },
      {
        number: 17,
        heading: 'What the site never does',
        paragraphs: [],
        bullets: [
          'It does not require or offer visitor accounts, create profiles, or set persistent identifiers. The session ID used by “Save and return later” is your two colors (or two random ones), shown to you, never stored with the save, and never sent to us. The only code that stands for your connection is the coach’s one-way daily code (Section 15), which changes daily and is deleted within two days; visit statistics count unique visitors by address within a day, with nothing saved on your device; the signed note of your agreement is not an identifier, is not linked to your connection, and is not stored by us.',
          'It does not send what you enter in the reflection tools to any server, except what you choose to send through the form, The Color API, or the coach demo.',
          'It does not sell, share or monetize data.',
        ],
      },
      {
        number: 18,
        heading: 'Links to other sites',
        paragraphs: [
          'Nenya loads no images, fonts, scripts or other content from other sites, with one exception: before your first coach message, the coach demo loads Cloudflare’s check for automated traffic from challenges.cloudflare.com (Section 15). Everything else is served from nenya.biz. Donation links go to Fractured Atlas’s own pages, where donations are processed under its privacy policy; we never receive your payment details. The review page and the end of the coach demo link to Venice AI’s site (not after a safety stop), with the referral code described in Section 15. Once you follow a link to another site (such as GitHub), that site’s policy applies.',
        ],
      },
      {
        number: 19,
        heading: 'Your rights, children, retention and transfers',
        paragraphs: [],
        subsections: [
          { heading: 'Children', paragraphs: [
            'Nenya does not knowingly collect personal information from anyone, including children. The form and the coach demo are not for anyone under 13, or the minimum age in your country (Section 2).',
          ] },
          { heading: 'Your rights', paragraphs: [
            'Apart from Netlify’s connection logs and visit statistics (Section 13), there is, for almost all visitors, nothing on file to access, correct or delete. If you sent us something through a form, you can delete it yourself with its deletion code, or ask what we hold, ask us to correct or delete it, or object to how it is used; if you are in the EU/EEA or UK, you can also complain to your data protection authority. Email info@nenya.biz. You can object to the visit statistics by emailing us; because they are counted at the host and tied to no account, we can switch them off for everyone but cannot remove one person. The coach’s daily codes and transcript codes cannot be traced back to you, so we cannot find yours on request; they are deleted automatically.',
          ] },
          { heading: 'Retention', paragraphs: [
            'Reports, reflection summaries and contact messages are deleted 90 days after they arrive; you can delete yours sooner with its deletion code, or email us. Messages sent before November 15, 2026 went through Netlify Forms; we are deleting those older than 90 days and will delete any other one on request. The coach’s daily codes are deleted within two days, transcript codes within 30 days. Legal basis for submissions (GDPR Art. 6(1)(a)): your consent, given by submitting.',
          ] },
          { heading: 'International transfers', paragraphs: [
            'Netlify may process the connection data, visit statistics, daily totals and codes in the United States. For data from the EU, UK or Switzerland, Netlify states that it relies on the EU-U.S. Data Privacy Framework (with its UK and Swiss extensions) and the European Commission’s Standard Contractual Clauses (netlify.com/privacy).',
          ] },
        ],
      },
      {
        number: 20,
        heading: 'Check it yourself',
        paragraphs: [
          'Nenya’s code is public under the AGPL-3.0 at github.com/Nenya-App/nenya-public, so you can see for yourself how it handles data.',
        ],
      },
      {
        number: 21,
        heading: 'Contact',
        paragraphs: [
          'Questions about anything here: info@nenya.biz.',
        ],
      },
    ],
  },
];
