import type { CSSProperties } from 'react';
import type { MarkShape } from '../../../lib/workbenchCopy';

// How each mark looks: a line or a box, never a colour. The colour is the text's own colour, so the shape reads in both themes and for anyone who sees no colour.
export function shapeStyle(shape: MarkShape): CSSProperties {
  const line = (style: CSSProperties['textDecorationStyle'], px: number): CSSProperties => ({ textDecorationLine: 'underline', textDecorationStyle: style, textDecorationThickness: `${px}px`, textUnderlineOffset: '5px' });
  switch (shape) {
    case 'underline-solid': return line('solid', 2);
    case 'underline-dotted': return line('dotted', 3);
    case 'underline-dashed': return line('dashed', 2);
    case 'underline-double': return line('double', 3);
    case 'underline-wavy': return line('wavy', 2);
    case 'overline': return { textDecorationLine: 'overline', textDecorationStyle: 'solid', textDecorationThickness: '2px' };
    case 'box-solid': return { borderStyle: 'solid', borderColor: 'currentColor' };
    case 'box-dashed': return { borderStyle: 'dashed', borderColor: 'currentColor' };
  }
}
