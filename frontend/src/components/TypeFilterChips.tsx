import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TypeFilterChipsProps {
  selectedType: 'all' | 'activity' | 'restaurant';
  activityCount: number;
  restaurantCount: number;
  onTypeChange: (type: 'all' | 'activity' | 'restaurant') => void;
}

export default function TypeFilterChips({
  selectedType,
  activityCount,
  restaurantCount,
  onTypeChange,
}: TypeFilterChipsProps) {
  return (
    <div className="px-4 pt-4 pb-3">
      <div className="flex gap-2">
        <Badge
          variant={selectedType === 'all' ? 'default' : 'outline'}
          className={cn(
            "cursor-pointer transition-all duration-200 px-2 py-1 text-xs font-medium",
            selectedType === 'all'
              ? "bg-(--primary) text-(--primary-foreground) shadow-sm border border-(--primary)"
              : "bg-transparent text-(--muted-foreground) border border-(--border) hover:border-(--primary)/50 hover:text-(--foreground) hover:bg-(--muted)/50"
          )}
          onClick={() => onTypeChange('all')}
        >
          All ({activityCount + restaurantCount})
        </Badge>
        <Badge
          variant={selectedType === 'activity' ? 'default' : 'outline'}
          className={cn(
            "cursor-pointer transition-all duration-200 px-2 py-1 text-xs font-medium",
            selectedType === 'activity'
              ? "bg-(--primary) text-(--primary-foreground) shadow-sm border border-(--primary)"
              : "bg-transparent text-(--muted-foreground) border border-(--border) hover:border-(--primary)/50 hover:text-(--foreground) hover:bg-(--muted)/50"
          )}
          onClick={() => onTypeChange('activity')}
        >
          Activities ({activityCount})
        </Badge>
        <Badge
          variant={selectedType === 'restaurant' ? 'default' : 'outline'}
          className={cn(
            "cursor-pointer transition-all duration-200 px-2 py-1 text-xs font-medium",
            selectedType === 'restaurant'
              ? "bg-(--primary) text-(--primary-foreground) shadow-sm border border-(--primary)"
              : "bg-transparent text-(--muted-foreground) border border-(--border) hover:border-(--primary)/50 hover:text-(--foreground) hover:bg-(--muted)/50"
          )}
          onClick={() => onTypeChange('restaurant')}
        >
          Restaurants ({restaurantCount})
        </Badge>
      </div>
    </div>
  );
}

