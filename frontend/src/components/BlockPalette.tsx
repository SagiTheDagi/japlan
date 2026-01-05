import { useState, useMemo } from 'react';
import type { Activity, Restaurant } from '../types';
import ActivityBlock from './ActivityBlock';
import RestaurantBlock from './RestaurantBlock';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter } from 'lucide-react';
import TypeFilterChips from './TypeFilterChips';
import FilterPanel from './FilterPanel';

interface BlockPaletteProps {
  activities: Activity[];
  restaurants: Restaurant[];
}

export default function BlockPalette({
  activities,
  restaurants,
}: BlockPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'activity' | 'restaurant'>('all');
  const [selectedActivityCategories, setSelectedActivityCategories] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedDietaryOptions, setSelectedDietaryOptions] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);


  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    // Activity category filter
    const matchesCategory = selectedActivityCategories.length === 0 || 
      selectedActivityCategories.includes(activity.category);
    
    // Price range filter
    const matchesPrice = selectedPriceRanges.length === 0 || 
      selectedPriceRanges.includes(activity.priceRange);
    
    // Search query filter
    const matchesSearch = 
      activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesPrice && matchesSearch;
  });

  // Filter restaurants
  const filteredRestaurants = restaurants.filter((restaurant) => {
    // Cuisine filter
    const matchesCuisine = selectedCuisines.length === 0 || 
      selectedCuisines.includes(restaurant.cuisine);
    
    // Price range filter
    const matchesPrice = selectedPriceRanges.length === 0 || 
      selectedPriceRanges.includes(restaurant.priceRange);
    
    // Dietary options filter
    const matchesDietary = selectedDietaryOptions.length === 0 || 
      (restaurant.dietaryOptions && restaurant.dietaryOptions.some(option => 
        selectedDietaryOptions.includes(option)
      ));
    
    // Search query filter
    const matchesSearch = 
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCuisine && matchesPrice && matchesDietary && matchesSearch;
  });

  // Combine filtered items into unified list
  type UnifiedItem = { type: 'activity'; item: Activity } | { type: 'restaurant'; item: Restaurant };
  const filteredItems: UnifiedItem[] = useMemo(() => {
    const items: UnifiedItem[] = [];
    
    if (selectedType === 'all' || selectedType === 'activity') {
      items.push(...filteredActivities.map(activity => ({ type: 'activity' as const, item: activity })));
    }
    
    if (selectedType === 'all' || selectedType === 'restaurant') {
      items.push(...filteredRestaurants.map(restaurant => ({ type: 'restaurant' as const, item: restaurant })));
    }
    
    return items;
  }, [filteredActivities, filteredRestaurants, selectedType]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return selectedActivityCategories.length + 
           selectedPriceRanges.length + 
           selectedDietaryOptions.length + 
           selectedCuisines.length;
  }, [selectedActivityCategories, selectedPriceRanges, selectedDietaryOptions, selectedCuisines]);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedActivityCategories([]);
    setSelectedPriceRanges([]);
    setSelectedDietaryOptions([]);
    setSelectedCuisines([]);
  };

  // Toggle filter option
  const toggleFilter = (
    category: 'activityCategories' | 'priceRanges' | 'dietaryOptions' | 'cuisines',
    value: string
  ) => {
    const setters = {
      activityCategories: setSelectedActivityCategories,
      priceRanges: setSelectedPriceRanges,
      dietaryOptions: setSelectedDietaryOptions,
      cuisines: setSelectedCuisines,
    };
    const getters = {
      activityCategories: selectedActivityCategories,
      priceRanges: selectedPriceRanges,
      dietaryOptions: selectedDietaryOptions,
      cuisines: selectedCuisines,
    };

    const current = getters[category];
    const setter = setters[category];
    
    if (current.includes(value)) {
      setter(current.filter(v => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  return (
    <Card className="w-80 rounded-none border-r border-x-0 border-t-0 h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle>Add to Your Plan</CardTitle>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Filter className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 max-h-[600px] overflow-y-auto">
              <FilterPanel
                activities={activities}
                restaurants={restaurants}
                selectedActivityCategories={selectedActivityCategories}
                selectedPriceRanges={selectedPriceRanges}
                selectedDietaryOptions={selectedDietaryOptions}
                selectedCuisines={selectedCuisines}
                onToggleFilter={toggleFilter}
                onClearAll={clearAllFilters}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
        <TypeFilterChips
          selectedType={selectedType}
          activityCount={filteredActivities.length}
          restaurantCount={filteredRestaurants.length}
          onTypeChange={setSelectedType}
        />
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {filteredItems.length > 0 ? (
            <div className="space-y-3">
              {filteredItems.map((unifiedItem) => {
                if (unifiedItem.type === 'activity') {
                  return (
                    <ActivityBlock
                      key={`activity-${unifiedItem.item.id}`}
                      activity={unifiedItem.item}
                      isInPalette={true}
                    />
                  );
                } else {
                  return (
                    <RestaurantBlock
                      key={`restaurant-${unifiedItem.item.id}`}
                      restaurant={unifiedItem.item}
                      isInPalette={true}
                    />
                  );
                }
              })}
            </div>
          ) : (
            <div className="text-center text-(--muted-foreground) py-8">
              No items found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
