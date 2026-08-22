import { ReactNode } from 'react';

interface BloomOnScrollProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
}

export function BloomOnScroll({ 
  children, 
  className = ''
}: BloomOnScrollProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

// Variant for instant bloom (for elements at top of page)
export function BloomInstant({ 
  children, 
  className = ''
}: Omit<BloomOnScrollProps, 'threshold'>) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
