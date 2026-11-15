import type { ReactNode } from 'react';

// "Add more detail": the extra choices of a gateway step, closed until asked for, so one main choice leads (owner, 2026-11-15).
// A native <details>, so it opens by keyboard and screen reader without extra code. When `simple` is off (the earlier pages),
// the children render as before, with nothing around them.
export function MoreDetail({ simple, label, hint, children }: { simple: boolean; label: string; hint?: string; children: ReactNode }) {
  if (!simple) return <>{children}</>;
  return (
    <details className="group rounded-lg border border-border p-3">
      <summary className="flex min-h-11 cursor-pointer items-center text-sm underline underline-offset-4">{label}</summary>
      {hint && <p className="mb-3 text-sm text-muted-foreground">{hint}</p>}
      <div className="space-y-4">{children}</div>
    </details>
  );
}
