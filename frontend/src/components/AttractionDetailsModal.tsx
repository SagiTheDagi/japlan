import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Wallet, Utensils } from 'lucide-react';
import type { Activity, Restaurant, BlockItem } from '../types';

interface AttractionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: BlockItem | null;
}

export default function AttractionDetailsModal({
  isOpen,
  onClose,
  item,
}: AttractionDetailsModalProps) {
  if (!item) return null;

  const isActivity = (item: BlockItem): item is Activity => {
    return 'category' in item;
  };

  const isRestaurant = (item: BlockItem): item is Restaurant => {
    return 'cuisine' in item;
  };

  const priceVariants = {
    free: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    luxury: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-4 pr-8">
            {item.imageUrl && (
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="w-16 h-16 rounded-md object-cover border select-none"
              />
            )}
            <div>
              <DialogTitle className="text-xl mb-1">{item.name}</DialogTitle>
              {isActivity(item) && (
                <Badge variant="secondary" className="inline-flex items-center gap-1.5 px-2 py-0 text-sm font-normal text-(--muted-foreground)">
                  <MapPin className="h-4 w-4" />
                  {item.category}
                </Badge>
              )}
              {isRestaurant(item) && (
                <Badge variant="secondary" className="inline-flex items-center gap-1.5 px-2 py-0 text-sm font-normal text-(--muted-foreground)">
                  <Utensils className="h-4 w-4" />
                  {item.cuisine}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="my-2 border-b" />

        <div className="max-h-[60vh] overflow-y-auto pr-2">
          <div className="space-y-4 py-2">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <DialogDescription className="text-(--foreground)">
                {item.description}
              </DialogDescription>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {isActivity(item) && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-(--muted-foreground)" />
                  <span className="text-sm">Duration: {item.duration}h</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-(--muted-foreground)" />
                <span className="text-sm">
                  Price: 
                  <Badge variant="secondary" className={`ml-2 ${priceVariants[item.priceRange]}`}>
                    {item.priceRange}
                  </Badge>
                </span>
              </div>

              {item.location && (
                <div className="col-span-2 flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-(--muted-foreground) mt-0.5" />
                  <span className="text-sm">{item.location}</span>
                </div>
              )}
            </div>

            {isRestaurant(item) && item.dietaryOptions && item.dietaryOptions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-sm">Dietary Options</h4>
                <div className="flex flex-wrap gap-2">
                  {item.dietaryOptions.map((option) => (
                    <Badge key={option} variant="outline" className="bg-green-50 dark:bg-green-500/20 select-none">
                      {option.slice(0, 1).toUpperCase() + option.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="destructive" onClick={onClose} className="select-none">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
