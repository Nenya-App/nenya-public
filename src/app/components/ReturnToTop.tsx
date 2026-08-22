import { ArrowUp } from 'lucide-react';
import { Button } from './ui/button';

interface ReturnToTopProps {
  className?: string;
  onClick?: () => void;
}

export function ReturnToTop({ className = '', onClick }: ReturnToTopProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 py-8 ${className}`}>
      <div className="h-px w-32 bg-gradient-to-r from-transparent via-border to-transparent" />
      <Button
        variant="outline"
        size="lg"
        onClick={handleClick}
        className="gap-2 group hover:border-nenya-gold/50 hover:text-nenya-gold-dark dark:hover:text-nenya-gold transition-all"
      >
        <ArrowUp className="size-4 group-hover:-translate-y-1 transition-transform" />
        Return to Top
      </Button>
    </div>
  );
}
