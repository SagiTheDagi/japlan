import { useState } from 'react';
import type { CalendarDay, GridItem } from '../types';

interface CalendarGridProps {
  days: CalendarDay[];
  onItemDrop: (day: number, timeSlot: string, item: GridItem) => void;
  onItemRemove: (day: number, itemId: string) => void;
  gridItemRenderer: (item: GridItem, day: number) => React.ReactNode;
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
        const gridItem: GridItem = {
          id: `${item.type}-${item.id}-${Date.now()}`,
          type: item.type,
          item: item,
          timeSlot,
          position: {
            row: timeSlots.indexOf(timeSlot),
            col: day - 1,
          },
        };
        onItemDrop(day, timeSlot, gridItem);
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
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-(--card) border border-(--border) p-3 text-left font-bold">
                Time
              </th>
              {days.map((day) => (
                <th
                  key={day.day}
                  className="min-w-50 border border-(--border) p-4 bg-(--muted)/50 text-center font-bold"
                >
                  <div className="text-lg">Day {day.day}</div>
                  {day.date && (
                    <div className="text-xs text-muted-foreground font-normal mt-1">{day.date}</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((timeSlot) => (
              <tr key={timeSlot}>
                <td className="sticky left-0 z-10 bg-(--card) border border-(--border) p-3 text-sm font-semibold">
                  {timeSlot}
                </td>
                {days.map((day) => {
                  const cellItems = getItemsForCell(day.day, timeSlot);
                  const isDraggedOver =
                    draggedOverCell?.day === day.day &&
                    draggedOverCell?.timeSlot === timeSlot;

                  return (
                    <td
                      key={`${day.day}-${timeSlot}`}
                      className={`min-h-20 border border-(--border) p-3 relative ${
                        isDraggedOver
                          ? 'bg-(--primary)/10 border-(--primary) border-2 shadow-lg'
                          : 'bg-(--background) hover:bg-(--muted)/50'
                      } transition-all duration-200`}
                      onDragOver={(e) => handleDragOver(e, day.day, timeSlot)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, day.day, timeSlot)}
                    >
                      <div className="flex flex-col gap-2 min-h-15">
                        {cellItems.map((item) => (
                          <div key={item.id}>
                            {gridItemRenderer(item, day.day)}
                          </div>
                        ))}
                        {cellItems.length === 0 && (
                          <div className="text-xs text-muted-foreground text-center py-3 font-medium">
                            Drop items here
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

