// A short label for an element a person pointed at in "Give feedback" (src/app/components/FeedbackTool.tsx): the site's own name for it (data-feedback-feature), or its
// own label or visible name. Never the value of a field or anything a person typed or wrote. Structural types, so it is tested without a browser.
import { MAX_PICKED } from './feedback.ts';

export interface PickEl {
  tagName: string;
  id?: string;
  textContent: string | null;
  parentElement: PickEl | null;
  getAttribute(name: string): string | null;
  closest(selector: string): PickEl | null;
}

const clip = (s: string, n = MAX_PICKED): string => s.replace(/\s+/g, ' ').trim().slice(0, n);

export function describePick(el: PickEl | null): string {
  if (!el) return '';
  const named = el.closest('[data-feedback-feature]');
  if (named) return clip(named.getAttribute('data-feedback-feature') ?? '');
  if (el.closest('textarea, input, select, [contenteditable=""], [contenteditable="true"]')) return 'a text field';
  let e: PickEl | null = el;
  for (let i = 0; e && i < 4; i++, e = e.parentElement) {
    const tag = e.tagName.toLowerCase();
    const role = e.getAttribute('role') || tag;
    const label = e.getAttribute('aria-label') || (tag === 'img' ? e.getAttribute('alt') : null) || e.getAttribute('title');
    if (label) return clip(`${role}: ${label}`);
    if (/^(button|a|summary|label|legend|h[1-6])$/.test(tag) || /^(button|tab|link|menuitem)$/.test(e.getAttribute('role') ?? '')) {
      const text = clip(e.textContent ?? '', 60);
      if (text) return clip(`${role}: ${text}`);
    }
  }
  const id = (el.id || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40);
  return clip(`${el.tagName.toLowerCase()}${id ? `#${id}` : ''}`);
}
