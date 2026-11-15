// WCAG 2.4.1 (bypass blocks): the first thing a keyboard user reaches, hidden until focused. It jumps past the header to the page's own content.
export default function SkipLink({ target = 'main-content' }: { target?: string }) {
  return (
    <a
      href={`#${target}`}
      onClick={(e) => { const el = document.getElementById(target); if (el) { e.preventDefault(); el.focus(); el.scrollIntoView({ block: 'start' }); } }}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-background focus:px-4 focus:py-3 focus:text-sm focus:text-foreground focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
}
