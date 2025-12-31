import { useState, useMemo } from 'react';
import type { Activity, Restaurant } from '../types';
import ActivityBlock from './ActivityBlock';
import RestaurantBlock from './RestaurantBlock';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Filter, X } from 'lucide-react';

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

  // Extract unique filter options
  const activityCategories = useMemo(() => {
    return Array.from(new Set(activities.map(a => a.category))).sort();
  }, [activities]);

  const priceRanges = useMemo(() => {
    const activityPrices = activities.map(a => a.priceRange);
    const restaurantPrices = restaurants.map(r => r.priceRange);
    return Array.from(new Set([...activityPrices, ...restaurantPrices])).sort();
  }, [activities, restaurants]);

  const dietaryOptions = useMemo(() => {
    const allOptions: string[] = [];
    restaurants.forEach(r => {
      if (r.dietaryOptions) {
        allOptions.push(...r.dietaryOptions);
      }
    });
    return Array.from(new Set(allOptions)).sort();
  }, [restaurants]);

  const cuisines = useMemo(() => {
    return Array.from(new Set(restaurants.map(r => r.cuisine))).sort();
  }, [restaurants]);

  // Calculate counts for filter options
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    activities.forEach(activity => {
      counts[activity.category] = (counts[activity.category] || 0) + 1;
    });
    return counts;
  }, [activities]);

  const priceRangeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    [...activities, ...restaurants].forEach(item => {
      counts[item.priceRange] = (counts[item.priceRange] || 0) + 1;
    });
    return counts;
  }, [activities, restaurants]);

  const dietaryOptionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    restaurants.forEach(restaurant => {
      if (restaurant.dietaryOptions) {
        restaurant.dietaryOptions.forEach(option => {
          counts[option] = (counts[option] || 0) + 1;
        });
      }
    });
    return counts;
  }, [restaurants]);

  const cuisineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    restaurants.forEach(restaurant => {
      counts[restaurant.cuisine] = (counts[restaurant.cuisine] || 0) + 1;
    });
    return counts;
  }, [restaurants]);

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
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Filters</h4>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
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
                          onCheckedChange={() => toggleFilter('activityCategories', category)}
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
                          onCheckedChange={() => toggleFilter('priceRanges', priceRange)}
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
                          onCheckedChange={() => toggleFilter('cuisines', cuisine)}
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
                            onCheckedChange={() => toggleFilter('dietaryOptions', option)}
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
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
        {/* Type Filter Chips */}
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
              onClick={() => setSelectedType('all')}
            >
              All ({filteredActivities.length + filteredRestaurants.length})
            </Badge>
            <Badge
              variant={selectedType === 'activity' ? 'default' : 'outline'}
              className={cn(
                "cursor-pointer transition-all duration-200 px-2 py-1 text-xs font-medium",
                selectedType === 'activity'
                  ? "bg-(--primary) text-(--primary-foreground) shadow-sm border border-(--primary)"
                  : "bg-transparent text-(--muted-foreground) border border-(--border) hover:border-(--primary)/50 hover:text-(--foreground) hover:bg-(--muted)/50"
              )}
              onClick={() => setSelectedType('activity')}
            >
              Activities ({filteredActivities.length})
            </Badge>
            <Badge
              variant={selectedType === 'restaurant' ? 'default' : 'outline'}
              className={cn(
                "cursor-pointer transition-all duration-200 px-2 py-1 text-xs font-medium",
                selectedType === 'restaurant'
                  ? "bg-(--primary) text-(--primary-foreground) shadow-sm border border-(--primary)"
                  : "bg-transparent text-(--muted-foreground) border border-(--border) hover:border-(--primary)/50 hover:text-(--foreground) hover:bg-(--muted)/50"
              )}
              onClick={() => setSelectedType('restaurant')}
            >
              Restaurants ({filteredRestaurants.length})
            </Badge>
          </div>
        </div>
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
