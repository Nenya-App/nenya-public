// The feelings in the phrase workbench (docs/phrase-workbench-scope.md). Written fresh for this site: two sides (when a need seems met, when it seems not
// met), then families of four to six words, each word with a one-line plain meaning (grade 5 to 8). Not CNVC's text. The first choice is the side,
// the second a family, the third a word, and none is required. The person's own word is always welcome. Pure data; nothing here is sent anywhere.

export interface FeelingWord { word: string; def: string }
export interface FeelingFamily { id: string; name: string; words: FeelingWord[] }
export interface FeelingSide { id: 'met' | 'unmet'; name: string; plain: string; families: FeelingFamily[] }

const f = (id: string, name: string, lines: string[]): FeelingFamily => ({
  id,
  name,
  words: lines.map((l) => {
    const i = l.indexOf(':');
    return { word: l.slice(0, i).trim(), def: l.slice(i + 1).trim() };
  }),
});

export const FEELING_SIDES: FeelingSide[] = [
  {
    id: 'met',
    name: 'When a need seems met',
    plain: 'Feelings that often show up when something you need is there.',
    families: [
      f('warm', 'Warm', [
        'tender: Soft and caring toward someone.',
        'fond: A steady liking for someone.',
        'close: Near to someone in heart.',
        'caring: Wanting the best for someone.',
        'moved: Touched deeply by something.',
      ]),
      f('glad', 'Glad', [
        'glad: Pleased that something happened.',
        'happy: A bright, glad feeling.',
        'cheerful: Light and in a lively mood.',
        'delighted: Very pleased, with a lift.',
        'joyful: Full of gladness.',
      ]),
      f('calm', 'Calm', [
        'calm: Settled and steady inside.',
        'at ease: Not on guard.',
        'peaceful: Quiet inside, with nothing pressing.',
        'content: Fine with how things are.',
        'relaxed: Loose in the body and the mind.',
      ]),
      f('relieved', 'Relieved', [
        'relieved: The lightness after a weight comes off.',
        'lighter: Less heavy than before.',
        'safe: Free of a threat for now.',
        'unburdened: A load has been set down.',
      ]),
      f('energy', 'Lively', [
        'energized: Full of go.',
        'eager: Wanting to start.',
        'awake: Alert and clear.',
        'excited: Buzzing about what is ahead.',
        'playful: Light and ready for fun.',
      ]),
      f('interest', 'Interested', [
        'curious: Wanting to find out.',
        'absorbed: Fully taken up by something.',
        'intrigued: Caught by something unusual.',
        'engaged: Taking part with your whole attention.',
      ]),
      f('thanks', 'Thankful', [
        'thankful: Glad for what someone gave or did.',
        'grateful: Feeling a warm debt of thanks.',
        'appreciative: Seeing the value in something.',
        'lucky: Glad about how things fell out.',
      ]),
      f('strong', 'Steady and sure', [
        'confident: Trusting that you can do it.',
        'steady: Not easy to knock off balance.',
        'proud: Pleased with what you or someone did.',
        'sure: Clear about where you stand.',
        'capable: Able to handle what comes.',
      ]),
      f('hope', 'Hopeful', [
        'hopeful: Feeling that things may go well.',
        'encouraged: Given heart to keep going.',
        'optimistic: Expecting things to turn out well.',
        'looking forward: Glad about what is coming.',
      ]),
      f('rested', 'Rested', [
        'rested: Restored by a break.',
        'refreshed: Feeling new again.',
        'recharged: Energy back after running low.',
      ]),
    ],
  },
  {
    id: 'unmet',
    name: 'When a need seems not met',
    plain: 'Feelings that often show up when something you need is missing.',
    families: [
      f('afraid', 'Afraid', [
        'scared: Afraid of something that may happen.',
        'worried: Turning a possible problem over and over.',
        'alarmed: Suddenly aware of a threat.',
        'frightened: In the grip of fear.',
        'dread: Fear about something still ahead.',
      ]),
      f('tense', 'Tense', [
        'tense: Tight in the body or the mind.',
        'anxious: Uneasy and on alert about what might happen.',
        'on edge: Ready to jump at the smallest thing.',
        'overwhelmed: Too much at once to take in.',
        'stressed: Pressed by too many demands.',
        'restless: Unable to settle.',
      ]),
      f('angry', 'Angry', [
        'angry: Hot and ready to push back.',
        'irritated: Annoyed again and again by the same thing.',
        'frustrated: Blocked from what you want.',
        'resentful: Holding on to a sense of being treated unfairly.',
        'furious: Anger at full strength.',
        'impatient: Wanting it to move faster.',
      ]),
      f('sad', 'Sad', [
        'sad: Heavy and low.',
        'down: Low in spirit.',
        'disappointed: Let down by how things turned out.',
        'discouraged: Losing heart to keep trying.',
        'hopeless: Unable to see a way forward.',
        'grieving: Aching over a loss.',
      ]),
      f('hurt', 'Hurt', [
        'hurt: A sore feeling, like pressing on a bruise.',
        'wounded: Hurt deeply.',
        'heartbroken: Hurt by loss of someone or something dear.',
        'lonely: Wanting company or closeness and not having it.',
        'left out: Hurt at being outside the group.',
      ]),
      f('tired', 'Tired', [
        'tired: Low on energy.',
        'worn out: Used up by effort.',
        'drained: Emptied of energy.',
        'exhausted: So tired that rest barely helps.',
        'heavy: Weighed down.',
      ]),
      f('confused', 'Unsure', [
        'confused: Not able to make sense of it.',
        'torn: Pulled two ways.',
        'lost: Without a sense of direction.',
        'unsure: Not certain what to think or do.',
        'puzzled: Trying to work something out.',
      ]),
      f('ashamed', 'Ashamed', [
        'embarrassed: Awkward at being seen in a poor light.',
        'ashamed: A sense of being less than you want to be.',
        'guilty: Feeling you did something that hurt someone.',
        'self-conscious: Too aware of being watched.',
      ]),
      f('apart', 'Apart', [
        'distant: Far from people, even when near.',
        'bored: Nothing holds your interest.',
        'flat: Little feeling either way.',
        'numb: Unable to feel much.',
        'withdrawn: Pulled back from others.',
      ]),
      f('uneasy', 'Uneasy', [
        'uneasy: A quiet sense that something is off.',
        'unsettled: Not able to rest in the moment.',
        'uncomfortable: Not at ease where you are.',
        'wary: Careful, because trust is low.',
        'shaky: Not steady inside.',
      ]),
      f('longing', 'Longing', [
        'longing: A pull toward something missing.',
        'envious: Wishing you had what another has.',
        'wistful: A soft sadness about what is gone.',
        'missing someone: Feeling the gap where a person was.',
      ]),
    ],
  },
];

/** Every feeling word with its side and family. */
export function allFeelingWords(): { word: string; def: string; side: 'met' | 'unmet'; family: string }[] {
  return FEELING_SIDES.flatMap((s) => s.families.flatMap((fm) => fm.words.map((w) => ({ word: w.word, def: w.def, side: s.id, family: fm.name }))));
}
