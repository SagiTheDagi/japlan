import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ViewModeToggleProps {
  viewMode: 'week' | 'month';
  onViewModeChange: (mode: 'week' | 'month') => void;
}

export default function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-1 border border-(--border) rounded-md p-1">
      <Button
        variant={viewMode === 'week' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('week')}
        className={cn(
          "h-7 px-3 text-xs w-20",
          viewMode === 'week' && "bg-(--primary) text-(--primary-foreground)"
        )}
      >
        Week
      </Button>
      <Button
        variant={viewMode === 'month' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('month')}
        className={cn(
          "h-7 px-3 text-xs w-20",
          viewMode === 'month' && "bg-(--primary) text-(--primary-foreground)"
        )}
      >
        Month
      </Button>
    </div>
  );
}

