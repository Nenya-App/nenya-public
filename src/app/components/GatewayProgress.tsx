// A bar that shows where a person is in the gateways they chose: "Gateway 2 of 6". Shown in every gateway's header.
export function GatewayProgress({ index, total }: { index: number; total: number }) {
  const n = Math.max(1, Math.min(total, index + 1));
  return (
    <div className="mt-1 flex flex-col items-center gap-1">
      <div
        role="progressbar"
        aria-label="Gateway progress"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={n}
        aria-valuetext={`Gateway ${n} of ${total}`}
        className="h-1.5 w-32 overflow-hidden rounded-full bg-muted sm:w-44"
      >
        <div className="h-full rounded-full bg-nenya-accent-warm transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${(n / total) * 100}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">Gateway {n} of {total}</p>
    </div>
  );
}
