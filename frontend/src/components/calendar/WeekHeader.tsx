import type { CalendarDay } from '../../types';

interface WeekHeaderProps {
  days: CalendarDay[];
}

export default function WeekHeader({ days }: WeekHeaderProps) {
  return (
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
              <div className="text-xs text-(--muted-foreground) font-normal mt-1">{day.date}</div>
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
}
