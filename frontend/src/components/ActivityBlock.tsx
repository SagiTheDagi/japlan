import type { Activity } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ActivityBlockProps {
  activity: Activity;
  isInPalette?: boolean;
  onRemove?: () => void;
}

export default function ActivityBlock({
  activity,
  isInPalette = false,
  onRemove,
}: ActivityBlockProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'activity',
        ...activity,
      })
    );
  };

  const priceVariants = {
    free: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  };

  return (
    <Card
      draggable={isInPalette}
      onDragStart={handleDragStart}
      className={cn(
        "cursor-move border-2 border-blue-300/50 dark:border-blue-600/50 transition-all duration-200",
        isInPalette && "hover:shadow-lg hover:scale-105 hover:border-blue-400 dark:hover:border-blue-500"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1 line-clamp-1">
              {activity.name}
            </h3>
            <p className="text-xs text-(--muted-foreground) mb-2 line-clamp-2">
              {activity.description}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {activity.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {activity.duration}h
              </Badge>
              <Badge className={cn("text-xs", priceVariants[activity.priceRange])}>
                {activity.priceRange}
              </Badge>
            </div>
          </div>
          {!isInPalette && onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={onRemove}
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
