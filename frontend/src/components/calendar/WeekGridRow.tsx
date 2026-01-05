import type { CalendarDay, GridItem } from '../../types';

interface WeekGridRowProps {
  timeSlot: string;
  days: CalendarDay[];
  draggedOverCell: { day: number; timeSlot: string } | null;
  onDragOver: (e: React.DragEvent, day: number, timeSlot: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, day: number, timeSlot: string) => void;
  getItemsForCell: (day: number, timeSlot: string) => GridItem[];
  gridItemRenderer: (item: GridItem, day: number) => React.ReactNode;
}

export default function WeekGridRow({
  timeSlot,
  days,
  draggedOverCell,
  onDragOver,
  onDragLeave,
  onDrop,
  getItemsForCell,
  gridItemRenderer,
}: WeekGridRowProps) {
  return (
    <tr>
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
            onDragOver={(e) => onDragOver(e, day.day, timeSlot)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, day.day, timeSlot)}
          >
            <div className="flex flex-col gap-2 min-h-15 select-none">
              {cellItems.map((item) => (
                <div key={item.id}>
                  {gridItemRenderer(item, day.day)}
                </div>
              ))}
              {cellItems.length === 0 && (
                <div className="text-xs text-(--muted-foreground) text-center py-3 font-medium">
                  Drop items here
                </div>
              )}
            </div>
          </td>
        );
      })}
    </tr>
  );
}
