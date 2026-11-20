// The needs in the phrase workbench (docs/phrase-workbench-scope.md). Written fresh for this site, in plain words (grade 5 to 8), in three tiers so nobody
// sees too much at once: seven categories, then families of four to six words, then the words, each with a one-line meaning. The seven category names
// follow the structure of the Feelings and Needs Inventory (The Center for Nonviolent Communication © 2023, www.CNVC.org); the families, words and
// meanings are this project's own and do not copy CNVC's text. A starting point, never a complete list: the person's own word is always welcome.
// Pure data. Nothing here is sent anywhere.

export interface NeedWord { word: string; def: string }
export interface NeedFamily { id: string; name: string; words: NeedWord[] }
export interface NeedCategory { id: string; name: string; plain: string; families: NeedFamily[] }

// "word: meaning" lines, one family each, split on the first colon.
const f = (id: string, name: string, lines: string[]): NeedFamily => ({
  id,
  name,
  words: lines.map((l) => {
    const i = l.indexOf(':');
    return { word: l.slice(0, i).trim(), def: l.slice(i + 1).trim() };
  }),
});

export const NEED_CATEGORIES: NeedCategory[] = [
  {
    id: 'physical',
    name: 'Physical wellbeing',
    plain: 'What the body needs to be well.',
    families: [
      f('basics', 'Body basics', [
        'rest: Time to stop and let the body and mind recover.',
        'sleep: Enough sleep to wake up able to face the day.',
        'food: Enough to eat, and food that suits you.',
        'water: Enough to drink.',
        'fresh air: Clean air to breathe, indoors or out.',
        'warmth: Not being too cold, and a way to warm up.',
      ]),
      f('moving', 'Movement and touch', [
        'movement: A chance to use and stretch the body.',
        'touch: Contact with another person that you want and welcome.',
        'comfort: Feeling at ease in your body and your clothes.',
        'time outside: Being out in the open, in daylight or weather.',
        'health care: Care for the body when it is sick or hurt.',
      ]),
      f('safety', 'Being physically safe', [
        'physical safety: Not being in danger of being hurt.',
        'shelter: A place to stay that keeps out weather and harm.',
        'protection: Someone or something that stands between you and harm.',
        'a steady place to live: Knowing where you will sleep next week.',
        'freedom from pain: Relief from hurt in the body.',
      ]),
    ],
  },
  {
    id: 'connection',
    name: 'Connection',
    plain: 'Being with other people in ways that feel good.',
    families: [
      f('with', 'Being with others', [
        'closeness: Being near someone in a way that feels warm and safe.',
        'companionship: Having someone to do things with, or just be with.',
        'belonging: Feeling that you are one of the group.',
        'inclusion: Being asked in, not left out.',
        'affection: Care that is shown in words, looks or touch.',
        'community: Being part of people who look out for each other.',
      ]),
      f('seen', 'Being known', [
        'being heard: Someone listens to what you say.',
        'being understood: Someone gets what you mean, not just what you said.',
        'being seen: Someone notices who you really are.',
        'acceptance: Being taken as you are, with no need to change first.',
        'respect: Being treated as someone whose time and view matter.',
        'appreciation: Hearing that what you do or are is valued.',
      ]),
      f('count', 'Being able to count on people', [
        'trust: Being able to count on someone to hold.',
        'reliability: What was said will happen.',
        'consistency: People act the same way from day to day.',
        'support: Help when things are hard.',
        'loyalty: Someone stays on your side when it is not easy.',
        'care: Someone is looking after how you are.',
      ]),
    ],
  },
  {
    id: 'honesty',
    name: 'Honesty',
    plain: 'Truth, between people and inside me.',
    families: [
      f('told', 'Truth with others', [
        'openness: People say what is on their minds.',
        'being told the truth: Hearing how things really are.',
        'clear information: Knowing what is going on and what comes next.',
        'being told early: Hearing about changes in time to take them in.',
        'straight answers: A reply that answers what you asked.',
      ]),
      f('self', 'Truth in myself', [
        'being myself: Acting like the person you are.',
        'integrity: Acting in line with what you care about.',
        'self-awareness: Knowing what you feel and want.',
        'a voice: Being able to say what is true for you.',
      ]),
      f('together', 'Being real together', [
        'presence: Someone is fully here with you, not half somewhere else.',
        'sincerity: Words that match what a person means.',
        'being able to say hard things: Room to speak up without fear.',
        'repair: A chance to put things right after a hurt.',
      ]),
    ],
  },
  {
    id: 'play',
    name: 'Play',
    plain: 'Lightness, fun and wonder.',
    families: [
      f('light', 'Lightness', [
        'laughter: Something that makes you laugh.',
        'fun: Doing something just because it is enjoyable.',
        'humor: A shared joke, or being able to see the funny side.',
        'silliness: Room to be goofy and not serious.',
      ]),
      f('wonder', 'Wonder', [
        'curiosity: A chance to ask, look and find out.',
        'wonder: Meeting something that amazes you.',
        'adventure: Trying something new and a bit uncertain.',
        'imagination: Room to dream up what might be.',
      ]),
      f('enjoy', 'Enjoyment', [
        'delight: A small pleasure that lifts the day.',
        'something to look forward to: A plan or hope that pulls you ahead.',
        'celebration: Marking a happy event with others.',
        'leisure: Free time with nothing you have to do.',
      ]),
    ],
  },
  {
    id: 'peace',
    name: 'Peace',
    plain: 'Calm, order and things fitting together.',
    families: [
      f('calm', 'Calm', [
        'quiet: Less noise and fewer demands.',
        'stillness: A moment when nothing is asked of you.',
        'calm: A settled feeling inside and around you.',
        'relief from worry: Something that lets you put a worry down.',
      ]),
      f('order', 'Order', [
        'order: Things are where they belong and make sense.',
        'predictability: Knowing roughly what will happen.',
        'knowing the plan: Being told what is happening and when.',
        'simplicity: Fewer pieces to keep track of.',
        'a steady routine: Days that have a shape you can lean on.',
      ]),
      f('harmony', 'Fitting together', [
        'harmony: People getting along without strain.',
        'fairness: Everyone gets a fair share and a fair hearing.',
        'balance: Not too much of one thing.',
        'beauty: Something lovely to look at, hear or be in.',
      ]),
    ],
  },
  {
    id: 'autonomy',
    name: 'Autonomy',
    plain: 'Having my own say over my life.',
    families: [
      f('say', 'Having a say', [
        'choice: More than one way to go, and you pick.',
        'a say: Being asked before something that affects you.',
        'deciding for myself: Making your own call.',
        'freedom: Not being held to what you do not agree to.',
      ]),
      f('room', 'Having room', [
        'space: Room to be, with no one asking anything.',
        'privacy: Some things are yours alone to share or keep.',
        'time of my own: Hours that belong to you.',
        'independence: Being able to manage by yourself.',
      ]),
      f('pace', 'Going my own way', [
        'flexibility: Plans that can bend when life changes.',
        'my own pace: Going as fast or as slow as you need.',
        'spontaneity: Room to do something on a whim.',
        'saying no: Being able to turn something down.',
      ]),
    ],
  },
  {
    id: 'meaning',
    name: 'Meaning',
    plain: 'Purpose, growth and what matters.',
    families: [
      f('purpose', 'Purpose', [
        'purpose: A reason that makes the effort feel worth it.',
        'contribution: Giving something that helps others.',
        'mattering: Knowing that you make a difference.',
        'being useful: What you do is of use.',
      ]),
      f('grow', 'Growth', [
        'learning: Taking in something new.',
        'growth: Becoming more than you were.',
        'challenge: A task that stretches you without breaking you.',
        'competence: Being able to do what you set out to do.',
        'progress: Seeing that you are moving forward.',
      ]),
      f('express', 'Expression and hope', [
        'creativity: Making something of your own.',
        'self-expression: Showing what is inside, in words or other ways.',
        'hope: A sense that things can get better.',
        'room to grieve: Space to feel a loss.',
        'a sense of meaning: Feeling that your life holds together.',
      ]),
    ],
  },
];

/** Every need word, lower case, with its category and family. */
export function allNeedWords(): { word: string; def: string; category: string; family: string }[] {
  return NEED_CATEGORIES.flatMap((c) => c.families.flatMap((fm) => fm.words.map((w) => ({ word: w.word, def: w.def, category: c.name, family: fm.name }))));
}

/** The category whose list holds this word (compared in lower case), or null. A word on two lists answers with the first. */
export function categoryOfNeed(word: string): { category: string; family: string } | null {
  const w = word.trim().toLowerCase();
  const hit = allNeedWords().find((x) => x.word.toLowerCase() === w);
  return hit ? { category: hit.category, family: hit.family } : null;
}
