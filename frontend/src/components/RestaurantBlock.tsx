import type { Restaurant } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface RestaurantBlockProps {
  restaurant: Restaurant;
  isInPalette?: boolean;
  onRemove?: () => void;
}

export default function RestaurantBlock({
  restaurant,
  isInPalette = false,
  onRemove,
}: RestaurantBlockProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'restaurant',
        ...restaurant,
      })
    );
  };

  const priceVariants = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    high: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    luxury: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  };

  return (
    <Card
      draggable={isInPalette}
      onDragStart={handleDragStart}
      className={cn(
        "cursor-move border-2 border-orange-300/50 dark:border-orange-600/50 transition-all duration-200",
        isInPalette && "hover:shadow-lg hover:scale-105 hover:border-orange-400 dark:hover:border-orange-500"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1 line-clamp-1">
              {restaurant.name}
            </h3>
            <p className="text-xs text-(--muted-foreground) mb-2 line-clamp-2">
              {restaurant.description}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300">
                {restaurant.cuisine}
              </Badge>
              <Badge className={cn("text-xs", priceVariants[restaurant.priceRange])}>
                {restaurant.priceRange}
              </Badge>
              {restaurant.dietaryOptions && restaurant.dietaryOptions.length > 0 && (
                <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
                  {restaurant.dietaryOptions.join(', ')}
                </Badge>
              )}
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
