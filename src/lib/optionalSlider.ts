// A slider that has not been touched has no answer. Every slider in the gateways starts "not set": its handle rests at the middle so there is something to
// see, but nothing is recorded until the person moves it, types a number, or presses "Set". Reports and the coach hand-off then leave out the sliders that
// were never used, instead of printing a default 50 as though it had been chosen.
//
// A slider value is the array the slider component already uses. An untouched one is a particular array that this file remembers (in a WeakMap), so no
// extra state is needed in the pages: any change makes a new array, which counts as set.

const defaults = new WeakMap<number[], number>();

/** A slider value for a slider that has not been touched. Its handle rests at `at` (the middle by default). */
export function unsetSlider(at = 50): number[] {
  const v = [at];
  defaults.set(v, at);
  return v;
}

/** Whether this slider value is one that was never touched. */
export const isUnset = (v: number[] | undefined | null): boolean => !!v && defaults.has(v);

/** The number to record: null while the slider has not been touched. */
export function sliderValue(v: number[] | undefined | null): number | null {
  if (!v || defaults.has(v)) return null;
  return typeof v[0] === 'number' ? v[0] : null;
}

/** Whether a saved value is a real answer (a number), as opposed to null, missing or not a number. */
export const isAnswered = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);

/** A saved answer back into slider form, for a page that is reopened. */
export const sliderFrom = (n: unknown, at = 50): number[] => (isAnswered(n) ? [n] : unsetSlider(at));
