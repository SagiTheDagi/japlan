import { useState } from 'react';
import type { Activity, Restaurant } from '../types';
import ActivityBlock from './ActivityBlock';
import RestaurantBlock from './RestaurantBlock';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BlockPaletteProps {
  activities: Activity[];
  restaurants: Restaurant[];
}

export default function BlockPalette({
  activities,
  restaurants,
}: BlockPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredActivities = activities.filter(
    (activity) =>
      activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="w-80 rounded-none border-r border-x-0 border-t-0 h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle>Add to Your Plan</CardTitle>
        <Input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
        <Tabs defaultValue="activities" className="flex flex-col h-full">
          <TabsList className="mx-4 mb-4">
            <TabsTrigger value="activities" className="flex-1">
              Activities ({filteredActivities.length})
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="flex-1">
              Restaurants ({filteredRestaurants.length})
            </TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <TabsContent value="activities" className="space-y-3 mt-0">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => (
                  <ActivityBlock
                    key={activity.id}
                    activity={activity}
                    isInPalette={true}
                  />
                ))
              ) : (
                <div className="text-center text-(--muted-foreground) py-8">
                  No activities found
                </div>
              )}
            </TabsContent>
            <TabsContent value="restaurants" className="space-y-3 mt-0">
              {filteredRestaurants.length > 0 ? (
                filteredRestaurants.map((restaurant) => (
                  <RestaurantBlock
                    key={restaurant.id}
                    restaurant={restaurant}
                    isInPalette={true}
                  />
                ))
              ) : (
                <div className="text-center text-(--muted-foreground) py-8">
                  No restaurants found
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
