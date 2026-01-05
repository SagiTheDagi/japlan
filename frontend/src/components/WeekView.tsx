import { useState } from 'react';
import type { CalendarDay, GridItem } from '../types';
import NavigationControls from './NavigationControls';
import WeekHeader from './calendar/WeekHeader';
import WeekGridRow from './calendar/WeekGridRow';

interface CalendarGridProps {
  days: CalendarDay[];
  onItemDrop: (day: number, item: GridItem) => void;
  onItemRemove: (day: number, itemId: string) => void;
  gridItemRenderer: (item: GridItem, day: number) => React.ReactNode;
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

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00',
];

export default function CalendarGrid({
  days,
  onItemDrop,
  gridItemRenderer,
  viewMode,
  currentWeekStart,
  totalDays,
  totalWeeks,
  currentWeekNumber,
  weekStartDay,
  weekEndDay,
  onPrevious,
  onNext,
}: CalendarGridProps) {
  const [draggedOverCell, setDraggedOverCell] = useState<{
    day: number;
    timeSlot: string;
  } | null>(null);

  const handleDragOver = (e: React.DragEvent, day: number, timeSlot: string) => {
    e.preventDefault();
    setDraggedOverCell({ day, timeSlot });
  };

  const handleDragLeave = () => {
    setDraggedOverCell(null);
  };

  const handleDrop = (e: React.DragEvent, day: number, timeSlot: string) => {
    e.preventDefault();
    setDraggedOverCell(null);

    const itemData = e.dataTransfer.getData('application/json');
    if (itemData) {
      try {
        const item = JSON.parse(itemData);
        // If gridItemId exists, this is moving an existing item; otherwise it's a new item
        const gridItem: GridItem = {
          id: item.gridItemId || `${item.type}-${item.id}-${Date.now()}`,
          type: item.type,
          item: item,
          timeSlot,
          position: {
            row: timeSlots.indexOf(timeSlot),
            col: day - 1,
          },
        };
        onItemDrop(day, gridItem);
      } catch (error) {
        console.error('Error parsing dropped item:', error);
      }
    }
  };

  const getItemsForCell = (day: number, timeSlot: string): GridItem[] => {
    const dayData = days.find((d) => d.day === day);
    if (!dayData) return [];
    return dayData.items.filter((item) => item.timeSlot === timeSlot);
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
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <div className="inline-block min-w-full">
        <table className="min-w-full border-collapse">
          <WeekHeader days={days} />
          <tbody>
            {timeSlots.map((timeSlot) => (
              <WeekGridRow
                key={timeSlot}
                timeSlot={timeSlot}
                days={days}
                draggedOverCell={draggedOverCell}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                getItemsForCell={getItemsForCell}
                gridItemRenderer={gridItemRenderer}
              />
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

