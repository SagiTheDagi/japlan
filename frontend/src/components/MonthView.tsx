import { useState } from 'react';
import type { CalendarDay, GridItem } from '../types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavigationControls from './NavigationControls';

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
          <div
            key={day.day}
            className={cn(
              "border border-(--border) rounded-lg p-2 bg-(--card) transition-all flex flex-col min-h-0 h-full",
              draggedOverDay === day.day && "bg-(--primary)/10 border-(--primary) border-2 shadow-lg"
            )}
            onDragOver={(e) => handleDragOver(e, day.day)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, day.day)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs">Day {day.day}</span>
              {day.date && (
                <span className="text-[10px] text-(--muted-foreground) font-normal">
                  {day.date}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 flex-1 w-full overflow-y-auto pr-1 custom-scrollbar">
              {day.items.length > 0 ? (
                day.items.map((item) => (
                  <Badge
                    key={item.id}
                    variant={item.type === 'activity' ? 'default' : 'secondary'}
                    className={cn(
                      "flex items-center justify-between gap-1 text-[10px] py-0.5 px-2 cursor-default w-full rounded-md!",
                      item.type === 'activity' 
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 border-blue-200/50"
                        : "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200 border-orange-200/50"
                    )}
                  >
                    <span className="truncate flex-1">
                      {item.type === 'activity' 
                        ? (item.item as any).name 
                        : (item.item as any).name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-3 w-3 hover:bg-transparent shrink-0 p-0 ml-1 opacity-60 hover:opacity-100"
                      onClick={() => onItemRemove(day.day, item.id)}
                    >
                      <X className="h-2.5 w-2.5" />
                    </Button>
                  </Badge>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                   <div className="text-[10px] text-(--muted-foreground) border border-dashed border-(--border) rounded px-2 py-1 select-none">
                    +
                   </div>
                </div>
              )}
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
