import { useState } from 'react';
import type { CalendarDay, GridItem } from '../types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WeeksViewProps {
  days: CalendarDay[];
  onItemDrop: (day: number, item: GridItem) => void;
  onItemRemove: (day: number, itemId: string) => void;
}

export default function WeeksView({ days, onItemDrop, onItemRemove }: WeeksViewProps) {
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
          timeSlot: '12:00', // Default time slot for weeks view
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
    <div className="p-6">
      <div className="grid grid-cols-7 gap-2 auto-rows-fr">
        {days.map((day) => (
          <div
            key={day.day}
            className={cn(
              "border border-(--border) rounded-lg p-3 bg-(--card) min-h-[200px] transition-all flex flex-col",
              draggedOverDay === day.day && "bg-(--primary)/10 border-(--primary) border-2 shadow-lg"
            )}
            onDragOver={(e) => handleDragOver(e, day.day)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, day.day)}
          >
            <div className="font-semibold text-sm mb-2">
              Day {day.day}
              {day.date && (
                <div className="text-xs text-(--muted-foreground) font-normal mt-1">
                  {day.date}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1 flex-1 w-full items-start content-start">
              {day.items.length > 0 ? (
                day.items.map((item) => (
                  <Badge
                    key={item.id}
                    variant={item.type === 'activity' ? 'default' : 'secondary'}
                    className={cn(
                      "inline-flex items-center gap-1 text-[10px] py-0 px-1 cursor-default shrink-0 h-5 leading-tight rounded-md!",
                      item.type === 'activity' 
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                        : "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300"
                    )}
                  >
                    <span className="truncate max-w-[80px]">
                      {item.type === 'activity' 
                        ? (item.item as any).name 
                        : (item.item as any).name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-3 w-3 hover:bg-transparent shrink-0 p-0"
                      onClick={() => onItemRemove(day.day, item.id)}
                    >
                      <X className="h-2.5 w-2.5" />
                    </Button>
                  </Badge>
                ))
              ) : (
                <div className="text-xs text-(--muted-foreground) text-center py-4 w-full">
                  No items
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

