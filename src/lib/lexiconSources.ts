// The outside lexicons we may build the detection list from, and what each licence lets us do (docs/lexicon-sources.md). The lexicon itself is never in this repository: it
// lives in the research folder and, once prepared, in the site's private store. This file holds only what is needed to credit and to stay inside the licence.
export interface LexiconSource {
  id: string;
  name: string;
  authors: string;
  url: string;
  licence: string;
  /** Where the licence was read, and whether it was read in this form. */
  licenceStatedIn: string;
  citation: string;
  may: {
    /** Use it in a free, nonprofit-sponsored tool (the NonCommercial question is settled by the owner and, where needed, the authors). */
    useInFreeTool: boolean;
    /** Publish or ship the list or any part of it (the repository, a download, the app). */
    distribute: boolean;
  };
  status: 'downloaded' | 'in-use' | 'planned';
  /** Pending confirmations the owner must make before the list is switched on. */
  pending: string[];
}

export const LEXICON_SOURCES: Record<string, LexiconSource> = {
  'hurtlex-en-1.2': {
    id: 'hurtlex-en-1.2', name: 'HurtLex, English, version 1.2', authors: 'Elisa Bassignana, Valerio Basile and Viviana Patti (built on Tullio De Mauro\'s Italian list)', url: 'https://github.com/valeriobasile/hurtlex',
    licence: 'CC BY-NC-SA 4.0', licenceStatedIn: 'the repository\'s root README (GitHub\'s licence detection returned none)',
    citation: 'Bassignana, Basile and Patti (2018), "Hurtlex: A Multilingual Lexicon of Words to Hurt", CLiC-it 2018. Licence: CC BY-NC-SA 4.0. https://github.com/valeriobasile/hurtlex',
    may: { useInFreeTool: true, distribute: false }, status: 'downloaded',
    pending: ['the authors and Fractured Atlas are asked (the NonCommercial reading is confirmed by the owner, 2026-11-10; the emails are drafted)', 'the conservative level only, with our own cue words and exceptions, reviewed by a person'],
  },
};

/** What must be true before a source's list is switched on. Empty means nothing is pending. */
export const pendingFor = (id: string): string[] => LEXICON_SOURCES[id]?.pending ?? ['unknown source'];
