import { useState, useCallback } from 'react';

interface UseCalendarNavigationProps {
  viewMode: 'week' | 'month';
  totalDays: number;
}

export function useCalendarNavigation({ viewMode, totalDays }: UseCalendarNavigationProps) {
  const [currentStart, setCurrentStart] = useState(0);

  const pageSize = viewMode === 'week' ? 7 : 35;

  const handlePrevious = useCallback(() => {
    setCurrentStart((prev) => {
      const newStart = prev - pageSize;
      return newStart >= 0 ? newStart : prev;
    });
  }, [pageSize]);

  const handleNext = useCallback(() => {
    setCurrentStart((prev) => {
      const newStart = prev + pageSize;
      return newStart < totalDays ? newStart : prev;
    });
  }, [pageSize, totalDays]);

  const reset = useCallback(() => {
    setCurrentStart(0);
  }, []);

  return {
    currentStart,
    handlePrevious,
    handleNext,
    reset,
    pageSize,
  };
}
