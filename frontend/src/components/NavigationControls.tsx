import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationControlsProps {
  viewMode: 'week' | 'month';
  currentWeekStart: number;
  totalDays: number;
  totalWeeks: number;
  currentWeekNumber: number;
  weekStartDay: number;
  weekEndDay: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function NavigationControls({
  viewMode,
  currentWeekStart,
  totalDays,
  totalWeeks,
  currentWeekNumber,
  weekStartDay,
  weekEndDay,
  onPrevious,
  onNext,
}: NavigationControlsProps) {
  const isPreviousDisabled = currentWeekStart === 0;
  const isNextDisabled = weekEndDay === totalDays;

  return (
    <div className="sticky top-0 z-20 bg-(--background) border-b border-(--border) px-6 py-6 flex items-center justify-center gap-6 shadow-sm">
      <Button
        variant="outline"
        size="lg"
        onClick={onPrevious}
        disabled={isPreviousDisabled}
        className="h-12 w-12"
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>
      <div className="text-3xl font-bold text-center min-w-[350px] select-none">
        {viewMode === 'week' ? (
          <>
            Week {currentWeekNumber} of {totalWeeks}
            <div className="text-lg font-normal text-(--muted-foreground) mt-2 select-none">
              Days {weekStartDay}-{weekEndDay} of {totalDays}
            </div>
          </>
        ) : (
          <>
            Days {weekStartDay}-{weekEndDay}
            <div className="text-lg font-normal text-(--muted-foreground) mt-2">
              of {totalDays} days
            </div>
          </>
        )}
      </div>
      <Button
        variant="outline"
        size="lg"
        onClick={onNext}
        disabled={isNextDisabled}
        className="h-12 w-12"
      >
        <ChevronRight className="h-8 w-8" />
      </Button>
    </div>
  );
}

