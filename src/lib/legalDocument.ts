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
export const LEGAL_EFFECTIVE_DATE = 'October 26, 2026';

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
          'Nenya is designed around ephemerality. The reflections you create here are for your personal use, and the tool does not send your sensory choices or reflections to our servers. Any outputs, such as a sensory report, are generated on your device and belong to you.',
          'Two things pass through infrastructure outside your device: our web host keeps standard connection logs, and if you choose to submit a report through the optional form, what you submit is sent to us. Part Two of this document explains both in full.',
        ],
      },
      {
        number: 5,
        heading: 'Your Responsibility',
        paragraphs: [
          'By choosing to enter this space, you agree to use it for its intended purpose of personal reflection. You are responsible for your own well-being. If at any point you feel unsettled or overwhelmed, we encourage you to gently disengage and return to your physical surroundings. We invite you to be a gentle steward of your own journey.',
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
          'The site has an optional form for sending us a report, feedback, or a message. Using it is entirely your choice. By submitting, you allow us to read, store, and use what you send to understand problems and improve Nenya, and to share it in anonymized or summarized form. Please do not include names, contact details, or other information that identifies you or anyone else. We will not use a submission to contact you unless you ask us to. To have a submission deleted, email us at the address in Section 21.',
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
          'Nenya has no user accounts, no analytics, no advertising, and no tracking cookies. What you enter while using the reflection tool (colors, melodies, drawings, body-map placements, written reflections) stays in your browser and is not sent to us. It is gone when you close the tab. The exceptions are the ones you choose yourself: downloading a PDF report, which is created on your own device, and the optional submission form described in Section 16.',
        ],
      },
      {
        number: 15,
        heading: 'Information Collected Automatically by Our Host',
        paragraphs: [
          'Nenya is hosted by Netlify. Like any web host, Netlify logs connection details for each request, typically your IP address, browser type, the page requested, and the time. This happens at the hosting layer for security and reliability. Nenya’s own code does not collect, store, or read it, and we don’t run any analytics service on top of it. Netlify’s handling is described in its privacy policy at netlify.com/privacy.',
          'Legal basis (GDPR Art. 6(1)(f)): our legitimate interest in operating and securing the site.',
        ],
      },
      {
        number: 16,
        heading: 'Information You Choose to Submit',
        paragraphs: [
          'The site has an optional form for sending us a bug report, a reflection report you decide to share, or a general message, described in Section 7. Using Nenya never requires it.',
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
          'It does not create accounts, profiles, or persistent identifiers.',
          'It does not set cookies or use fingerprinting. It does not even remember your light or dark mode between visits.',
          'It does not send your reflections to any server unless you use the form in Section 16.',
          'It does not sell, share, or monetize data.',
        ],
      },
      {
        number: 18,
        heading: 'Links to Other Sites',
        paragraphs: [
          'Nenya does not load images, fonts, scripts, or other content from other sites; everything the site displays is served from nenya.biz. Our donation links take you to Fractured Atlas’s own pages, and donations are processed by Fractured Atlas under its privacy policy, not this one. We do not receive your payment details. Links to other sites (such as GitHub) work the same way: once you follow one, that site’s policy applies.',
        ],
      },
      {
        number: 19,
        heading: 'Cookies',
        paragraphs: [
          'Nenya sets none. If you see a cookie from this domain that isn’t explained here, tell us at info@nenya.biz.',
        ],
      },
      {
        number: 20,
        heading: 'Your Rights, Children, and Transfers',
        paragraphs: [
          'Children: Nenya does not knowingly collect personal information from anyone, including children. The optional form is not intended for people under 13, or under the minimum age in your country, matching Section 3.',
          'Your rights: for almost all visitors there is nothing on file to access, correct, or delete. If you have sent us something through the form, you can ask what we hold, ask us to correct or delete it, or object to how it is used. If you are in the EU/EEA or UK, you can also complain to your local data protection authority. To exercise any of these, email info@nenya.biz.',
          'Retention: there is no automatic deletion schedule for submissions yet. Email us and we will delete a submission from our inbox and ask Netlify to remove its stored copy. Legal basis for submissions (GDPR Art. 6(1)(a)): your consent, given by submitting the form.',
          'International transfers: Netlify may process the connection data in Section 15 in the United States. For data from the EU, UK, or Switzerland, Netlify states that it relies on the EU-U.S. Data Privacy Framework (and its UK and Swiss extensions) and on the European Commission’s Standard Contractual Clauses. See netlify.com/privacy.',
          'Open source: Nenya’s code is public under the AGPL-3.0 license at https://github.com/Nenya-App/nenya-public, so you can check for yourself how it handles data.',
        ],
      },
      {
        number: 21,
        heading: 'Changes and Contact',
        paragraphs: [
          'We may update this document. The effective date will change when we do, and you will be asked to agree to the current terms when you enter the site. Continued use after that means you accept the update. We collect no contact details from visitors, so we have no way to notify you directly of a change. Earlier versions are kept in our public repository at https://github.com/Nenya-App/nenya-public/tree/main/docs/legal.',
          'Questions about anything here: info@nenya.biz.',
        ],
      },
    ],
  },
];
