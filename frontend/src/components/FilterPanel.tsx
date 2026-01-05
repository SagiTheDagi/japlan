import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import type { Activity, Restaurant } from '../types';

interface FilterPanelProps {
  activities: Activity[];
  restaurants: Restaurant[];
  selectedActivityCategories: string[];
  selectedPriceRanges: string[];
  selectedDietaryOptions: string[];
  selectedCuisines: string[];
  onToggleFilter: (
    category: 'activityCategories' | 'priceRanges' | 'dietaryOptions' | 'cuisines',
    value: string
  ) => void;
  onClearAll: () => void;
}

export default function FilterPanel({
  activities,
  restaurants,
  selectedActivityCategories,
  selectedPriceRanges,
  selectedDietaryOptions,
  selectedCuisines,
  onToggleFilter,
  onClearAll,
}: FilterPanelProps) {
  // Extract unique filter options
  const activityCategories = Array.from(new Set(activities.map(a => a.category))).sort();
  const priceRanges = Array.from(new Set([
    ...activities.map(a => a.priceRange),
    ...restaurants.map(r => r.priceRange)
  ])).sort();
  const dietaryOptions = Array.from(new Set(
    restaurants.flatMap(r => r.dietaryOptions || [])
  )).sort();
  const cuisines = Array.from(new Set(restaurants.map(r => r.cuisine))).sort();

  // Calculate counts
  const categoryCounts: Record<string, number> = {};
  activities.forEach(activity => {
    categoryCounts[activity.category] = (categoryCounts[activity.category] || 0) + 1;
  });

  const priceRangeCounts: Record<string, number> = {};
  [...activities, ...restaurants].forEach(item => {
    priceRangeCounts[item.priceRange] = (priceRangeCounts[item.priceRange] || 0) + 1;
  });

  const dietaryOptionCounts: Record<string, number> = {};
  restaurants.forEach(restaurant => {
    if (restaurant.dietaryOptions) {
      restaurant.dietaryOptions.forEach(option => {
        dietaryOptionCounts[option] = (dietaryOptionCounts[option] || 0) + 1;
      });
    }
  });

  const cuisineCounts: Record<string, number> = {};
  restaurants.forEach(restaurant => {
    cuisineCounts[restaurant.cuisine] = (cuisineCounts[restaurant.cuisine] || 0) + 1;
  });

  const activeFilterCount = selectedActivityCategories.length + 
    selectedPriceRanges.length + 
    selectedDietaryOptions.length + 
    selectedCuisines.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">Filters</h4>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-7 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Activity Categories */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Activity Categories</Label>
        <div className="space-y-2">
          {activityCategories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={selectedActivityCategories.includes(category)}
                onCheckedChange={() => onToggleFilter('activityCategories', category)}
              />
              <Label
                htmlFor={`category-${category}`}
                className="text-sm font-normal cursor-pointer flex-1"
              >
                {category} ({categoryCounts[category]})
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Ranges */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Price Range</Label>
        <div className="space-y-2">
          {priceRanges.map((priceRange) => (
            <div key={priceRange} className="flex items-center space-x-2">
              <Checkbox
                id={`price-${priceRange}`}
                checked={selectedPriceRanges.includes(priceRange)}
                onCheckedChange={() => onToggleFilter('priceRanges', priceRange)}
              />
              <Label
                htmlFor={`price-${priceRange}`}
                className="text-sm font-normal cursor-pointer flex-1 capitalize"
              >
                {priceRange} ({priceRangeCounts[priceRange]})
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Cuisines */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Cuisines</Label>
        <div className="space-y-2">
          {cuisines.map((cuisine) => (
            <div key={cuisine} className="flex items-center space-x-2">
              <Checkbox
                id={`cuisine-${cuisine}`}
                checked={selectedCuisines.includes(cuisine)}
                onCheckedChange={() => onToggleFilter('cuisines', cuisine)}
              />
              <Label
                htmlFor={`cuisine-${cuisine}`}
                className="text-sm font-normal cursor-pointer flex-1"
              >
                {cuisine} ({cuisineCounts[cuisine]})
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Dietary Options */}
      {dietaryOptions.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Dietary Options</Label>
          <div className="space-y-2">
            {dietaryOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`dietary-${option}`}
                  checked={selectedDietaryOptions.includes(option)}
                  onCheckedChange={() => onToggleFilter('dietaryOptions', option)}
                />
                <Label
                  htmlFor={`dietary-${option}`}
                  className="text-sm font-normal cursor-pointer flex-1 capitalize"
                >
                  {option} ({dietaryOptionCounts[option]})
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

