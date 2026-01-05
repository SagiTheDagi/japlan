import { useState } from 'react';
import type { CalendarDay, GridItem } from '../types';
import NavigationControls from './NavigationControls';
import MonthDayCell from './calendar/MonthDayCell';

interface MonthViewProps {
  days: CalendarDay[];
  onItemDrop: (day: number, item: GridItem) => void;
  onItemRemove: (day: number, itemId: string) => void;
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

export default function MonthView({ 
  days, 
  onItemDrop, 
  onItemRemove,
  viewMode,
  currentWeekStart,
  totalDays,
  totalWeeks,
  currentWeekNumber,
  weekStartDay,
  weekEndDay,
  onPrevious,
  onNext,
}: MonthViewProps) {
  const [draggedOverDay, setDraggedOverDay] = useState<number | null>(null);

  const handleDragOver = (e: React.DragEvent, day: number) => {
    e.preventDefault();
    setDraggedOverDay(day);
  };

  const handleDragLeave = () => {
    setDraggedOverDay(null);
  };

  const handleDrop = (e: React.DragEvent, day: number) => {
    e.preventDefault();
    setDraggedOverDay(null);

    const itemData = e.dataTransfer.getData('application/json');
    if (itemData) {
      try {
        const item = JSON.parse(itemData);
        const gridItem: GridItem = {
          id: item.gridItemId || `${item.type}-${item.id}-${Date.now()}`,
          type: item.type,
          item: item,
          timeSlot: '12:00', // Default time slot for month view
          position: {
            row: 0,
            col: day - 1,
          },
        };
        onItemDrop(day, gridItem);
      } catch (error) {
        console.error('Error parsing dropped item:', error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <NavigationControls
        viewMode={viewMode}
        currentWeekStart={currentWeekStart}
        totalDays={totalDays}
        totalWeeks={totalWeeks}
        currentWeekNumber={currentWeekNumber}
        weekStartDay={weekStartDay}
        weekEndDay={weekEndDay}
        onPrevious={onPrevious}
        onNext={onNext}
      />
      <div className="p-2 flex-1 overflow-hidden h-full">
        <div className="grid grid-cols-7 gap-1 h-full auto-rows-fr">
        {days.map((day) => (
          <MonthDayCell
            key={day.day}
            day={day}
            isDraggedOver={draggedOverDay === day.day}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onItemRemove={onItemRemove}
          />
        ))}
        </div>
      </div>
    </div>
  );
}
