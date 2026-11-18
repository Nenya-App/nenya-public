import { PLAIN_ENGLISH, PLAIN_INTRO } from '../../lib/plainEnglish';

/** "Nenya in plain English": static text, nothing loaded or sent. Shown inside the Terms panel and on the decline page. */
export function PlainEnglish({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as 'h2' | 'h3';
  const Item = headingLevel === 2 ? 'h3' : 'h4';
  return (
    <section aria-labelledby="plain-english-title" className="space-y-4 text-left">
      <H id="plain-english-title" className="text-xl">Nenya in plain English</H>
      <p className="text-muted-foreground">{PLAIN_INTRO}</p>
      {PLAIN_ENGLISH.map((i) => {
        const T = Item as 'h3' | 'h4';
        return (
          <div key={i.heading} className="space-y-1">
            <T className="font-medium">{i.heading}</T>
            <p>{i.text}</p>
          </div>
        );
      })}
    </section>
  );
}
