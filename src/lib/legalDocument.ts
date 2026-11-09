// Single source for the Terms of Use & Privacy Policy. The agreement
// window, the About page, and the PDF download all render from this, so
// they can never drift apart. Earlier versions are archived as markdown in
// docs/legal/archive (outside the build, so they add nothing to the site).

export interface LegalSection {
  number: number;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalPart {
  title: string;
  sections: LegalSection[];
}

export const LEGAL_TITLE = 'Terms of Use & Privacy Policy';
export const LEGAL_EFFECTIVE_DATE = 'November 9, 2026';

export const LEGAL_INTRO =
  'Welcome. Please read this before you begin. This document has two parts: Terms of Use, which cover how you may use Nenya, and a Privacy Policy, which covers what little information touches us at all. They sit together because Nenya’s privacy design is also its central promise.';

export const LEGAL_CLOSING =
  'By choosing “Agree, Enter,” you acknowledge that you have read, understood, and agree to these terms. Thank you for your presence here.';

export const LEGAL_PARTS: LegalPart[] = [
  {
    title: 'Part One: Terms of Use',
    sections: [
      {
        number: 1,
        heading: 'What Nenya Is',
        paragraphs: [
          'Nenya is an interactive digital environment designed as a tool for personal reflection and sensory exploration. It is best understood as a form of interactive art: a space to pause, breathe, and engage with your inner world through structured, sensory-based activities. It is a mirror for your own thoughts, not a source of answers.',
        ],
      },
      {
        number: 2,
        heading: 'What Nenya Is Not',
        paragraphs: [
          'Nenya is not a medical device, a therapeutic service, or a substitute for professional care. We make no claims, and offer no treatments, for any medical, psychological, or psychiatric condition. The tool is not designed to diagnose, treat, cure, or manage any illness or emotional distress. If you are experiencing a clinical mental health condition, please seek the support of a qualified human professional.',
        ],
      },
      {
        number: 3,
        heading: 'Who May Use Nenya',
        paragraphs: [
          'Nenya is intended for people aged 13 and older, or the minimum age required in your country to use online services on your own, whichever is higher. If you are younger, please use it only with a parent or guardian.',
        ],
      },
      {
        number: 4,
        heading: 'Your Privacy & Data',
        paragraphs: [
          'Nenya is designed around ephemerality. The reflections you create here are for your personal use, and the tool does not send your sensory choices or reflections to our servers. Any outputs, such as a sensory report, are generated on your device and belong to you. Nothing from a report is sent anywhere unless you choose to bring parts of it to the optional coach (Section 21), and then it is treated like a message you type.',
          'Three things pass through infrastructure outside your device: our web host keeps standard connection logs and produces anonymous visit statistics from them; if you choose to submit a report or message through the optional form, what you submit is sent to us; and if you choose to try the optional coach demo, what you type, and any parts of a sensory report you choose to bring to it, is sent through our server to an AI service. Part Two of this document explains each in full. A small amount of information can also stay on your device between visits, and Section 19 explains what, and how to erase it.',
        ],
      },
      {
        number: 5,
        heading: 'Your Responsibility',
        paragraphs: [
          'By choosing to enter this space, you agree to use it for its intended purpose of personal reflection. You are responsible for your own well-being. If at any point you feel unsettled or overwhelmed, we encourage you to gently disengage and return to your physical surroundings. We invite you to be a gentle steward of your own journey.',
          'Nenya is a space for reflection: for looking at your own thoughts, feelings and needs. Strong feelings, including anger, frustration, and disagreement with Nenya or the coach, are part of being a person and are welcome here. The coach is software; it is not hurt or offended by what you say to it, and hostile words aimed at the coach are not a reason for it to end your conversation.',
          'Please do not use Nenya, or the coach demo, to produce or share language that treats a person or a group of people as less than human (for example, calling people animals, vermin, or disease, or wishing them gone), to threaten or harass anyone, or to plan harm to others. This is not what the space is for.',
          'If a conversation goes in that direction, the coach may turn back to your own feelings and needs, or decline to continue. These checks are simple phrase matching and they can be wrong.',
          'If a message suggests you may be in distress or in danger, the coach responds with care and resources, as described in Section 6 and Section 21.',
        ],
      },
      {
        number: 6,
        heading: 'A Note on Crisis',
        paragraphs: [
          'This artistic tool is not equipped, and its creators are not qualified, to support individuals in crisis. If you are feeling hopeless, considering harming yourself or others, or are otherwise in distress, please close this window and immediately connect with a human professional. You can reach the 988 Suicide & Crisis Lifeline in the US and Canada by calling or texting 988, or contact local emergency services or a crisis line in your country.',
        ],
      },
      {
        number: 7,
        heading: 'Reports and Feedback You Choose to Send',
        paragraphs: [
          'The site has an optional form for sending us a report, feedback, a message, or a signed coach-demo transcript (a transcript is accepted only if it carries Nenya’s signature; see Section 21). Using it is entirely your choice. By submitting, you allow us to read, store, and use what you send to understand problems and improve Nenya, and to share it in anonymized or summarized form. Please do not include names, contact details, or other information that identifies you or anyone else. We will not use a submission to contact you unless you ask us to. To have a submission deleted, email us at the address in Section 22.',
        ],
      },
      {
        number: 8,
        heading: 'Open Source License and Trademarks',
        paragraphs: [
          'Nenya’s source code is publicly available under the GNU Affero General Public License v3.0 (https://github.com/Nenya-App/nenya-public/blob/main/LICENSE). You are welcome to inspect, run, modify, and share it under that license’s terms. The Nenya name and logo are reserved separately as trademarks; see the repository’s TRADEMARK.md for details. The personal reflections and reports you generate are your own.',
        ],
      },
      {
        number: 9,
        heading: 'A Note on Visual Content',
        paragraphs: [
          'Nenya includes dynamic visual elements: a pulsing breathing animation, slowly shifting colors, and gently rotating imagery. Nothing here is designed to strobe, flash rapidly, or otherwise trigger photosensitive seizures, but if you’re sensitive to moving light or color, you can reduce or turn off these animations any time from the menu’s Accessibility Settings.',
        ],
      },
      {
        number: 10,
        heading: 'No Warranties',
        paragraphs: [
          'Nenya is provided free of charge, “as is” and “as available.” To the fullest extent permitted by law, we make no warranties of any kind, express or implied, including that the site will be uninterrupted, error-free, secure, or suited to any particular purpose, and we do not guarantee any particular effect on your wellbeing.',
        ],
      },
      {
        number: 11,
        heading: 'Limitation of Liability',
        paragraphs: [
          'To the fullest extent permitted by law, we are not liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss arising from your use of, or inability to use, the site. Where liability cannot be excluded, our total liability to you is limited to USD $100. Nothing in these terms excludes or limits liability that cannot lawfully be excluded or limited, including in some places liability for death, personal injury caused by negligence, or fraud, and nothing here limits any rights you have as a consumer under the law where you live.',
        ],
      },
      {
        number: 12,
        heading: 'Governing Law',
        paragraphs: [
          'These terms are governed by the laws of the State of Minnesota, USA, without regard to conflict-of-law rules. Disputes will be brought in the state or federal courts located in Ramsey County, Minnesota, except that if you are a consumer in another country, you keep any right to bring a claim in your local courts that cannot be waived. If any part of these terms is found unenforceable, the rest stays in effect.',
        ],
      },
    ],
  },
  {
    title: 'Part Two: Privacy Policy',
    sections: [
      {
        number: 13,
        heading: 'Who This Covers',
        paragraphs: [
          'This policy describes how Nenya (“Nenya,” “we,” “us”) handles information when you use nenya.biz (the “site”).',
          'Operator: Nenya, a project operated by Estëlle as a sole proprietor and fiscally sponsored by Fractured Atlas, Inc., a 501(c)(3) public charity. Contact: info@nenya.biz. This is the way to reach us about anything in this document.',
          'We do not publish a postal address at this time. If a data protection authority or other regulator needs one, we will provide it on request.',
        ],
      },
      {
        number: 14,
        heading: 'The Short Version',
        paragraphs: [
          'Nenya does not require an account for any part of it, and does not currently offer accounts to visitors. It has no advertising and no tracking cookies, and it does not follow you around the internet. Our web host counts visits in aggregate, as plain totals, to show us how much the site is used (Section 15). Nenya also keeps plain daily totals of its own, and the coach demo keeps a one-way daily code to apply a daily limit (Sections 15 and 21). What you enter while using the reflection tool (colors, melodies, drawings, body-map placements, written reflections) stays in your browser and is not sent to us. It is gone when you close the tab. By default, the only thing the site keeps on your device between visits is a single timestamp saved after you finish a coach conversation, described in Section 21. If you choose “Remember my settings on this device,” it also keeps your display settings and your agreement to these terms, described in Section 19. The exceptions to the rest are the ones you choose yourself: downloading a PDF report, which is created on your own device, the optional submission form described in Section 16, and the optional coach demo described in Section 21.',
        ],
      },
      {
        number: 15,
        heading: 'Information Collected Automatically by Our Host, and Visit Statistics',
        paragraphs: [
          'Nenya is hosted by Netlify. Like any web host, Netlify logs connection details for each request, typically your IP address, browser type, the page requested, and the time. This happens at the hosting layer for security and reliability. Nenya’s own code does not store it, and reads it in one place only: when you send a message to the coach demo, our server reads your connection address once to apply the daily limit described in Section 21. Netlify’s handling is described in its privacy policy at netlify.com/privacy.',
          'We have switched on Netlify’s built-in visit statistics (Netlify calls it Web Analytics). Netlify builds them from the same server logs, so nothing extra runs in your browser, no cookie is set, and nothing is stored on your device. They show us totals such as how many times each page was requested, how many unique visitors came (counted from connection addresses within a day, not by anything saved on your device), where visitors came from, and approximate location by country. We use the dashboard to see how much Nenya is used and which parts are used, so that we can look after it and decide what to improve. We see totals, not a list of individual visitors, and we do not link the statistics to anything you enter on the site, because that never reaches us. Netlify keeps these records under its own retention practices.',
          'Nenya also keeps its own plain daily totals, to look after the site and the coach demo. They are numbers only, with no information about who produced them. They count how many times each part of the site is opened, which breathing rhythm is chosen, and whether the tour is taken (all counted only after you agree to these terms, and not at all if your browser sends the Global Privacy Control signal); and, in the coach demo, how many messages are sent, answered or refused (with a reason such as a safety notice or a limit), how many conversations start and finish, and how many signed transcripts and reports are made or rejected. We do not count anything you type, draw, or choose in the reflection tools, and we do not count use of Emergency Exit. These totals are stored with Netlify and may be kept as long as they are useful, since they identify no one.',
          'Legal basis (GDPR Art. 6(1)(f)): our legitimate interest in operating and securing the site, understanding how much it is used, and keeping the free coach demo available and affordable.',
        ],
      },
      {
        number: 16,
        heading: 'Information You Choose to Submit',
        paragraphs: [
          'The site has an optional form for sending us a bug report, a reflection report you decide to share, a general message, or a coach-demo transcript, described in Section 7. Using Nenya never requires it.',
        ],
        bullets: [
          'What you submit is the text of your report or message, plus an optional comment, delivered to us through Netlify Forms.',
          'We do not ask for your name or email. If you type personal information into a comment, report, or message, it becomes part of the submission, so please leave out anything you would not want us to keep. If you would like a reply to a message, you can include your email address in it; we use it only to answer you.',
          'Netlify may keep a copy of the submission under its own retention practices.',
        ],
      },
      {
        number: 17,
        heading: 'What the Site Does Not Do',
        paragraphs: [],
        bullets: [
          'It does not require or offer visitor accounts, and it does not create profiles or persistent identifiers for visitors. The visit statistics in Section 15 count unique visitors by connection address within a day; nothing is saved on your device for that. The only code that stands for your connection is the one-way daily code the coach demo uses for its limit (Section 21): it changes every day and is deleted within two days.',
          'It does not set cookies or use fingerprinting. Unless you turn on “Remember my settings on this device,” it does not remember your light or dark mode or anything else between visits, apart from the timestamp saved after a coach conversation ends (Section 21).',
          'It does not send what you enter in the reflection tool to any server. The only exceptions are the form in Section 16 and the optional coach demo in Section 21 (including any parts of a report you choose to bring to it), all of which you start yourself.',
          'It does not sell, share, or monetize data.',
        ],
      },
      {
        number: 18,
        heading: 'Links to Other Sites',
        paragraphs: [
          'Nenya does not load images, fonts, scripts, or other content from other sites; everything the site displays is served from nenya.biz. Our donation links take you to Fractured Atlas’s own pages, and donations are processed by Fractured Atlas under its privacy policy, not this one. We do not receive your payment details. The reflection review page and the end of the coach demo also link to Venice AI’s own site (see Section 21 for the referral code those links carry). Links to other sites (such as GitHub) work the same way: once you follow one, that site’s policy applies.',
        ],
      },
      {
        number: 19,
        heading: 'Cookies and Saved Settings',
        paragraphs: [
          'Nenya sets no cookies. If you see a cookie from this domain that isn’t explained here, tell us at info@nenya.biz.',
          'Two kinds of things can be saved in your browser’s local storage. They are not cookies, they stay on your device, and they are never sent to us. First, the timestamp described in Section 21, saved automatically after a coach conversation ends. Second, only if you turn on “Remember my settings on this device” (in the settings menu, or with the box on the terms screen): your theme, text size, animation and breathing choices, and the date of the terms you agreed to, so you are not asked each visit. If the terms change, you will be asked again. Turning the switch off erases the second kind. “Forget me” in the settings menu, or the Forget me link at the bottom of every page, erases both, and the Emergency Exit button erases everything before it leaves the page. “Forget me” erases what is saved on your device. It cannot reset the coach demo’s daily limit, because that is counted on our server (Section 21), not on your device.',
          'We never save what you write, draw, or answer, your session colors, or anything derived from them. Anyone who can use your device could see these saved items in its browser tools, so on a shared or watched device, leave the switch off and use Forget me (in the settings menu and at the bottom of every page) or Emergency Exit when you finish.',
        ],
      },
      {
        number: 20,
        heading: 'Your Rights, Children, and Transfers',
        paragraphs: [
          'Children: Nenya does not knowingly collect personal information from anyone, including children. The optional form is not intended for people under 13, or under the minimum age in your country, matching Section 3.',
          'Your rights: apart from the connection logs and visit statistics that Netlify keeps (Section 15), there is for almost all visitors nothing on file to access, correct, or delete. If you have sent us something through the form, you can ask what we hold, ask us to correct or delete it, or object to how it is used. If you are in the EU/EEA or UK, you can also complain to your local data protection authority. To exercise any of these, email info@nenya.biz. You can object to the visit statistics by emailing us; because they are counted at the host and are not tied to any account, we can switch them off for everyone but cannot remove one person from them. The daily limit code and the transcript codes described in Section 21 cannot be traced back to you, so we cannot find or delete yours on request; they are deleted automatically.',
          'Retention: there is no automatic deletion schedule for submissions yet. Email us and we will delete a submission from our inbox and ask Netlify to remove its stored copy. The daily limit codes are deleted within two days, and transcript codes within 30 days. Legal basis for submissions (GDPR Art. 6(1)(a)): your consent, given by submitting the form.',
          'International transfers: Netlify may process the connection data, visit statistics, daily totals and codes in Sections 15 and 21 in the United States. For data from the EU, UK, or Switzerland, Netlify states that it relies on the EU-U.S. Data Privacy Framework (and its UK and Swiss extensions) and on the European Commission’s Standard Contractual Clauses. See netlify.com/privacy.',
          'Open source: Nenya’s code is public under the AGPL-3.0 license at https://github.com/Nenya-App/nenya-public, so you can check for yourself how it handles data.',
        ],
      },
      {
        number: 21,
        heading: 'The Coach Demo',
        paragraphs: [
          'The coach demo is an optional, early prototype of a conversational coach. You can reach it at the end of the reflection tools or directly at nenya.biz/coach. It is the one place on the site where what you type is sent to an AI service. If you choose to use it, this is what happens:',
        ],
        bullets: [
          'Your messages are sent through our server, hosted by Netlify, to Venice AI, which writes the replies. A conversation is limited to five exchanges, and each message to 500 characters.',
          'We do not store your messages or the replies, and we do not write them to our logs. They exist in your browser tab and disappear when you close it. Netlify, like any host, keeps ordinary connection logs.',
          'Venice AI handles what it receives under its own terms and privacy policy, which we do not control. The coach currently uses Qwen 2.5 7B, a small AI model, in a mode that Venice labels “Private.” Before your message goes to Venice, our server encrypts it so that only Venice’s secure processing environment can read it, and Venice’s service relays only encrypted data. This is not encryption all the way from your device: your message first reaches our server, which reads it in memory to remove identifiers, check for crisis, and screen it (all described below), and does not store it. We may change the model. If we move to one without this protection, we will say so in this section first. Venice and Netlify may process data outside your country.',
          'You may choose to bring parts of a sensory report to the coach. This is never automatic, and you do not need to have made a report, or to share anything from one, to use the coach. If you choose to, the page shows the report in pieces with nothing selected, and shows you exactly the words that would be sent, with identifiers replaced as in a message. For a color, those words name the palette it comes from and add a short note about that palette (an image, and a few rough guesses at feelings and needs, written by us). The words you choose go through our server to Venice AI along with your messages, in the same way and through the same checks as a message: identifiers are replaced, text that looks like instructions to the coach is left out, and the crisis check runs on it. If the shared text is flagged, the page shows the safety notice and resources and the coach responds with care; this does not end the conversation. We do not store what you share. It is part of a signed transcript if you ask for one, so that the transcript shows what the coach was given. Nenya’s palettes are starting points and not a scientific or medical instrument, and no color has a fixed meaning. You can share nothing and talk about something else at any time.',
          'The demo uses two colors as a temporary session label. They start as a random pair, which you can change, or they are the two colors you chose in the Sight gateway if you came from there. They are not an account, we do not store them, and they appear on any transcript you download or send so that it names the session it came from.',
          'Before your message is sent, the page replaces some common identifiers (such as email addresses, phone numbers, street addresses, and some names) with placeholders, and our server does the same again. This is not a guarantee, and most names will not be caught, so please still leave out names, contact details, and other identifying information.',
          'The demo checks each message for signs of crisis. If a message clearly suggests you may be in danger, it is not sent to the AI, the conversation ends, and the page shows crisis resources. If a message is less clear, it is sent with an instruction to respond with care, and the page shows the same resources. These checks are simple phrase matching: they can miss things and can flag harmless words. If you think a notice was wrong, you can report it; a report is sent only if you press Send, and it includes your message only if you choose.',
          'After your first exchange, and when a conversation finishes, you can download a transcript. If you ask for a signed copy, your page sends the conversation so far to our server one more time so it can confirm it matches what the server produced and add a dated signature. If the site’s safety check stopped your last message, a signed copy includes that message so that a mistaken stop can be shown exactly: your page sends it to our server once, with the earlier exchanges, and the server runs the check again and signs only if the check does stop it. The server does not keep or log that message. The signature also covers whether the conversation reached its end, how many exchanges it holds, and a fingerprint of the version of the coach that wrote the replies (the site’s version, the model and the instructions), none of which identifies you. We do not store the conversation, and the signed file stays with you. We keep a plain daily total of how many signed transcripts are made and, for 30 days, a short code (a hash) for each one, which cannot be turned back into your words; it lets us recognize duplicate reports and confirm that we issued a transcript, and it is then deleted. If you choose to send a signed transcript to us, for example to report a problem, you see exactly what will be sent first and may add a short note of your own. Our server checks the signature before the transcript reaches us, and an unsigned or altered transcript is refused. The server sees the transcript on its way through and does not keep or log it. It reaches us through a separate form for signed transcripts, the way other submissions do (Section 16). Anyone can check a signed transcript at nenya.biz/verify, on their own device, with nothing uploaded.',
          'When a conversation ends without a safety notice, the page saves the current time in your browser’s local storage, and only the time. It lets the free demo rest for 6 hours before opening again, because each reply costs real money to produce. It is not an identifier, it is never sent to us, and we cannot read it. The “Forget me” button in the settings menu or at the bottom of every page, or clearing this site’s data in your browser, removes it. Because it is only on your device, it does not stop anyone determined to use the demo again sooner, and it is not meant to.',
          'To keep the free demo affordable, there are two daily limits. The first covers all visitors together: the demo can handle a set number of messages each day. Our server keeps a single running number for this, such as “212 messages today,” with no information about who sent them. The second covers each connection: a connection can send up to 10 messages a day, which is two full conversations, and a new conversation is refused once the 10 are used. A conversation already under way is never cut off. You find out only when you send a message. A message that a limit stops reaches our server, is not passed on to Venice AI, and is not kept, and the page tells you that the demo is full for today or that your connection has used its free conversations for today. Shared networks count together.',
          'To count the second limit, our server reads your connection’s IP address when you send a message. It mixes the address (for IPv6, its network part) with the date and a secret key to make a one-way code, and keeps one number under that code: how many messages the connection has sent today. A conversation’s messages all count against the connection that started it, so the code is also kept inside the signed ticket your page holds while the conversation lasts, even if your address changes partway through. Nobody without the key can turn the code back into your address, it is different every day, and it is deleted within two days. Nothing else is stored with it: no message text, no session colors, nothing about the conversation. If our store cannot be reached, the limit is skipped rather than blocking you. “Forget me” cannot reset it, because it is not on your device.',
          'Some of the words you see in the coach demo are written by us, not by the AI. We treat them as safety precautions, and this is the full list. The page writes the opening greeting (or, if you chose to bring parts of a report, an opening message built from what you shared: which sections it covers and which palettes your colors come from), the closing message, and the notice with crisis resources shown when a message is stopped; none of these is sent to the AI. A signed transcript includes the ones you were shown (the greeting, the closing message, any safety notice with its resources, and the invitation), rebuilt by our server from the same public source code, together with a short note for each message the safety check flagged saying which words matched or which step of the check applied, so a signed copy shows what you saw and why. Our server adds short sentences to a reply in some situations: a pointer to a crisis line when a message suggests distress, self-harm, hurting yourself on purpose, abuse, or the risk of hurting someone, and a brief “Thank you for telling me.” after critical feedback about the coach, about the site, about Nonviolent Communication, or about the use of AI. At the end of a conversation in which you said something critical like that, the page also adds an invitation: if you want the people who made Nenya to read what you thought, you can send the conversation to us with a note. It is only an invitation, and nothing is sent unless you choose. When you ask the coach a question about Nenya itself, such as who runs it, which model it uses, or where your messages go, the reply is a pre-written answer from the site instead: the message is answered by our server and is not sent to the AI, the answer was checked against these terms and the About pages, it counts as one of your exchanges, a card beneath it links to the pages that explain more, and a signed transcript marks it as written by the site. Our server may also take an apology out of a reply when a message was hostile toward the coach. These added sentences are part of the reply you see and appear in a transcript you download. They are fixed texts in our public source code, not AI output.',
          'The demo also screens each message for attempts to give the coach instructions or change how it works, such as asking it to ignore its rules or reveal its setup. A message that looks like that is not sent, and you can reword it. This is simple phrase matching and is not a guarantee.',
          'When the demo ends without a safety notice, the page offers a link to continue with the same character on Venice AI’s own site. That is a separate service: leaving Nenya, you are under Venice AI’s terms and privacy policy, and none of the checks described in this section (scrubbing, safety notices, screening, the five-exchange limit) run there. Nothing from the demo is carried over. The Venice links, including the sign-up link, carry Nenya’s referral code. Under Venice AI’s referral program, if you sign up for a paid Pro account through them, Nenya earns $10 in Venice credits and you receive a $10 welcome bonus. Those credits help pay for the coach demo. It costs you nothing extra, and you may go to venice.ai directly instead.',
          'The demo is not therapy, cannot help in a crisis, and is not intended for people under 13 or under the minimum age in your country, matching Section 3.',
          'Legal basis (GDPR Art. 6(1)(a)): your consent, given when you choose to start the demo after reading the notice on its first screen.',
        ],
      },
      {
        number: 22,
        heading: 'Changes and Contact',
        paragraphs: [
          'We may update this document. The effective date will change when we do, and you will be asked to agree to the current terms when you enter the site, unless you chose to remember your agreement on this device and the terms have not changed since. Continued use after that means you accept the update. We collect no contact details from visitors, so we have no way to notify you directly of a change. Earlier versions are kept in our public repository at https://github.com/Nenya-App/nenya-public/tree/main/docs/legal.',
          'Questions about anything here: info@nenya.biz.',
        ],
      },
    ],
  },
];
