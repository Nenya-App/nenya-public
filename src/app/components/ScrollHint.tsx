import { useEffect, useRef, useState } from 'react';

/**
 * Drop anywhere inside a `.scroll-container` ancestor. Renders a sticky
 * bottom gradient + bouncing chevron whenever that container has more
 * content below the fold, and hides itself once scrolled near the bottom.
 */
export function ScrollHint() {
  const [visible, setVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    let container = sentinel.parentElement;
    while (container && !String(container.className).includes('scroll-container')) {
      container = container.parentElement;
    }
    if (!container) return;

    const check = () => {
      setVisible(
        container!.scrollHeight > container!.clientHeight + 10 &&
          container!.scrollTop + container!.clientHeight < container!.scrollHeight - 30
      );
    };
    container.addEventListener('scroll', check, { passive: true });
    const resizeObserver = new ResizeObserver(check);
    resizeObserver.observe(container);
    check();
    return () => {
      container!.removeEventListener('scroll', check);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={sentinelRef} style={{ height: 0, overflow: 'hidden' }} />
      {visible && (
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            width: '100%',
            height: '64px',
            background: 'linear-gradient(to bottom, transparent, rgba(13,19,33,0.88))',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: '14px',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(232,160,32,0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: '20px', height: '20px', animation: 'scroll-bounce 2.2s ease-in-out infinite' }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      )}
    </>
  );
}
