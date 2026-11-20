import { useState } from 'react';
import { appendToOwnText, composeDescription } from '../../lib/describeChoices';

/**
 * The text of a description box that follows the person's choices until they write in it. `words` are the words chosen from the lists; `add` is what the Add button calls. A description saved earlier
 * counts as the person's own. `reset` hands the box back to the choices. `compose` turns the words into the text (a list by default).
 */
export function useAutoDescription(initial: string, words: string[], compose: (words: string[]) => string = composeDescription) {
  const [text, setText] = useState(initial);
  const [edited, setEdited] = useState(!!initial);
  const [added, setAdded] = useState<string[]>([]);
  const composed = compose([...words, ...added]);
  return {
    value: edited ? text : composed,
    edited,
    setValue: (v: string) => { setText(v); setEdited(true); },
    add: (w: string) => { if (edited) setText(appendToOwnText(text, w)); else setAdded((a) => [...a, w]); },
    reset: () => { setEdited(false); setAdded([]); },
  };
}
