// Draws the text of a "make your own" guide (src/lib/smithyGuide.ts) for the Smithy page. Text is placed as text, never as HTML.
// Each code block can be copied and scrolled with a keyboard. Keeps and sends nothing; the Copy button writes to the clipboard only when pressed.
import { useState } from 'react';
import { Button } from './ui/button';
import type { Block, Inline } from '../../lib/smithyGuide';

function Words({ parts }: { parts: Inline[] }) {
  return (
    <>
      {parts.map((p, i) =>
        p.t === 'code' ? (
          <code key={i} className="rounded bg-muted px-1 py-0.5 text-[0.95em] break-words">{p.s}</code>
        ) : p.t === 'bold' ? (
          <strong key={i}>{p.s}</strong>
        ) : p.t === 'link' ? (
          <a key={i} href={p.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 break-words">
            {p.s} <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : (
          <span key={i}>{p.s}</span>
        ),
      )}
    </>
  );
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [said, setSaid] = useState('');
  const copy = async () => {
    // Emptied first, so a second copy is announced again.
    setSaid('');
    try {
      await navigator.clipboard.writeText(code);
      setSaid('Copied.');
    } catch {
      setSaid('Copying is blocked here. Select the text and copy it.');
    }
  };
  const first = code.split('\n')[0] ?? '';
  const kind = ['bash', 'sh'].includes(lang) ? 'command' : 'code';
  return (
    <div className="space-y-1">
      <pre tabIndex={0} data-lang={lang} className="overflow-x-auto rounded-md border border-border bg-muted p-3 text-sm text-foreground"><code>{code}</code></pre>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={copy} className="min-h-11" aria-label={`Copy the ${kind}: ${first}`}>Copy</Button>
        <span aria-live="polite" className="text-sm text-foreground">{said}</span>
      </div>
    </div>
  );
}

export function SmithyBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-4 text-base leading-relaxed text-foreground">
      {blocks.map((b, i) => {
        if (b.k === 'h') return b.level === 2 ? <h2 key={i} className="pt-3 text-2xl"><Words parts={b.text} /></h2> : <h3 key={i} className="pt-2 text-xl"><Words parts={b.text} /></h3>;
        if (b.k === 'p') return <p key={i}><Words parts={b.text} /></p>;
        if (b.k === 'code') return <CodeBlock key={i} code={b.code} lang={b.lang} />;
        if (b.k === 'list') {
          const List = b.ordered ? 'ol' : 'ul';
          return (
            <List key={i} className={`${b.ordered ? 'list-decimal' : 'list-disc'} space-y-2 pl-6`}>
              {b.items.map((item, j) => <li key={j}><Words parts={item} /></li>)}
            </List>
          );
        }
        return (
          <div key={i} className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>{b.head.map((c, j) => <th scope="col" key={j} className="border border-border p-2"><Words parts={c} /></th>)}</tr>
              </thead>
              <tbody>
                {b.rows.map((row, j) => <tr key={j}>{row.map((c, k) => <td key={k} className="border border-border p-2 align-top"><Words parts={c} /></td>)}</tr>)}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
