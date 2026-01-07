import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserPreferences } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Sun, Moon } from 'lucide-react';

// --- Constants ---
const HOBBY_OPTIONS = [
  'Temples & Shrines', 'Museums & Art', 'Nature & Parks', 'Food & Dining',
  'Shopping', 'Nightlife', 'Technology', 'History & Culture',
  'Photography', 'Anime & Manga',
];

const DIETARY_RESTRICTIONS = [
  'Vegetarian', 'Vegan', 'Pescatarian', 'Halal',
  'Kosher', 'Gluten-Free', 'No Pork', 'No Beef',
];

const CUISINE_PREFERENCES = [
  'Sushi', 'Ramen', 'Tempura', 'Yakiniku', 'Kaiseki',
  'Okonomiyaki', 'Street Food', 'Western', 'Chinese', 'Korean',
];



// --- Initial State Helper ---
const INITIAL_STATE: UserPreferences = {
  hobbies: [],
  foodPreferences: {
    dietaryRestrictions: [],
    cuisinePreferences: [],
  },
  budget: 'medium',
  tripDuration: 7,
  travelStyle: 'balanced',
};

export default function PreferencesPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserPreferences>(INITIAL_STATE);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.theme === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
      }
      return newMode;
    });
  };

  const toggleItem = (currentList: string[], item: string) => {
    return currentList.includes(item)
      ? currentList.filter((i) => i !== item)
      : [...currentList, item];
  };

  const handleHobbyToggle = (hobby: string) => {
    setFormData((prev) => ({
      ...prev,
      hobbies: toggleItem(prev.hobbies, hobby),
    }));
  };

  const handleFoodPreferenceToggle = (type: 'dietaryRestrictions' | 'cuisinePreferences', value: string) => {
    setFormData((prev) => ({
      ...prev,
      foodPreferences: {
        ...prev.foodPreferences,
        [type]: toggleItem(prev.foodPreferences[type], value),
      },
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem('userPreferences', JSON.stringify(formData));
    navigate('/sandbox');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-(--background) via-(--muted) to-(--muted)/50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Card className="border-2 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-6">
            <div className="space-y-1.5">
              <CardTitle className="text-4xl md:text-5xl">Plan Your Japan Trip</CardTitle>
              <CardDescription className="text-lg">
                Tell us about your preferences and we'll help you create the perfect itinerary
              </CardDescription>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="shrink-0 ml-4"
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Hobbies Section */}
              <div className="space-y-4">
                <Label className="text-xl font-semibold">What are your interests?</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-1">
                  {HOBBY_OPTIONS.map((hobby) => {
                    const isSelected = formData.hobbies.includes(hobby);
                    return (
                      <Button
                        key={hobby}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => handleHobbyToggle(hobby)}
                        aria-pressed={isSelected}
                        className={cn(
                          "h-auto py-3 transition-all",
                          isSelected && "bg-blue-600 hover:bg-blue-700 text-(--primary-foreground)"
                        )}
                      >
                        {hobby}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Dietary Restrictions Section */}
              <div className="space-y-4">
                <Label className="text-xl font-semibold">Dietary Restrictions</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
                  {DIETARY_RESTRICTIONS.map((restriction) => {
                    const isSelected = formData.foodPreferences.dietaryRestrictions.includes(restriction);
                    return (
                      <Button
                        key={restriction}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFoodPreferenceToggle('dietaryRestrictions', restriction)}
                        aria-pressed={isSelected}
                        className={cn(
                          "h-auto py-2.5",
                          isSelected && "bg-green-600 hover:bg-green-700 text-white"
                        )}
                      >
                        {restriction}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Cuisine Preferences Section */}
              <div className="space-y-4">
                <Label className="text-xl font-semibold">Cuisine Preferences</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-1">
                  {CUISINE_PREFERENCES.map((cuisine) => {
                    const isSelected = formData.foodPreferences.cuisinePreferences.includes(cuisine);
                    return (
                      <Button
                        key={cuisine}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFoodPreferenceToggle('cuisinePreferences', cuisine)}
                        aria-pressed={isSelected}
                        className={cn(
                          "h-auto py-2.5",
                          isSelected && "bg-orange-600 hover:bg-orange-700 text-white"
                        )}
                      >
                        {cuisine}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 flex justify-center gap-40">
                {/* Budget Selection */}
                <div className="space-y-4 flex flex-col items-center">
                  <Label className="text-xl font-semibold">Daily Budget</Label>
                  <Tabs
                    value={formData.budget}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value as any }))}
                    className="w-full max-w-xl"
                  >
                    <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-(--background) border border-(--muted)/50 rounded-lg">
                      <TabsTrigger value="low" className="py-2.5 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 dark:data-[state=active]:bg-blue-900/40 dark:data-[state=active]:text-blue-100">Low</TabsTrigger>
                      <TabsTrigger value="medium" className="py-2.5 data-[state=active]:bg-green-100 data-[state=active]:text-green-900 dark:data-[state=active]:bg-green-900/40 dark:data-[state=active]:text-green-100">Medium</TabsTrigger>
                      <TabsTrigger value="high" className="py-2.5 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-900 dark:data-[state=active]:bg-orange-900/40 dark:data-[state=active]:text-orange-100">High</TabsTrigger>
                      <TabsTrigger value="luxury" className="py-2.5 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 dark:data-[state=active]:bg-purple-900/40 dark:data-[state=active]:text-purple-100">Luxury</TabsTrigger>
                      <TabsTrigger value="flexible" className="py-2.5 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100">Flexible</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Travel Style */}
                <div className="space-y-4 flex flex-col items-center">
                  <Label className="text-xl font-semibold">Travel Style</Label>
                  <Tabs
                    value={formData.travelStyle}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, travelStyle: value as any }))}
                    className="w-full max-w-xl"
                  >
                    <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-(--background) border border-(--muted)/50 rounded-lg">
                      <TabsTrigger value="relaxed" className="py-2.5 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 dark:data-[state=active]:bg-blue-900/40 dark:data-[state=active]:text-blue-100">Relaxed</TabsTrigger>
                      <TabsTrigger value="adventurous" className="py-2.5 data-[state=active]:bg-red-100 data-[state=active]:text-red-900 dark:data-[state=active]:bg-red-900/40 dark:data-[state=active]:text-red-100">Adventurous</TabsTrigger>
                      <TabsTrigger value="balanced" className="py-2.5 data-[state=active]:bg-green-100 data-[state=active]:text-green-900 dark:data-[state=active]:bg-green-900/40 dark:data-[state=active]:text-green-100">Balanced</TabsTrigger>
                      <TabsTrigger value="cultural" className="py-2.5 data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-900 dark:data-[state=active]:bg-indigo-900/40 dark:data-[state=active]:text-indigo-100">Cultural</TabsTrigger>
                      <TabsTrigger value="foodie" className="py-2.5 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 dark:data-[state=active]:bg-amber-900/40 dark:data-[state=active]:text-amber-100">Foodie</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {/* Trip Duration */}
              <div className="space-y-4 flex flex-col items-center">
                <Label htmlFor="duration" className="text-xl font-semibold text-center">Trip Duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="365"
                  value={formData.tripDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, tripDuration: parseInt(e.target.value) || 1 }))}
                  className="w-32"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button type="submit" size="lg" className="w-full text-lg font-semibold bg-(--primary)">
                  Start Planning Your Trip →
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}