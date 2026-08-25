import { ExternalLink } from 'lucide-react';

// Small "learn more" affordance for the technical term in a gateway's
// subtitle (e.g. "Chromesthesia", "Noesis") -- these are real but obscure
// words, worth a one-click explainer. See docs/REFERENCE_LINKS.md for the
// sourced links and how to add or replace one.
export function GatewaySubtitleLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex align-middle ml-1 text-muted-foreground hover:text-primary"
      aria-label="Learn more about this term"
      title="Learn more"
    >
      <ExternalLink className="size-3" />
    </a>
  );
}
