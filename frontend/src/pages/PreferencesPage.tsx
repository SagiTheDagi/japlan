import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserPreferences } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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

const TRAVEL_STYLES = [
  { value: 'relaxed', label: 'Relaxed', color: 'bg-purple-600 hover:bg-purple-700' },
  { value: 'adventurous', label: 'Adventurous', color: 'bg-purple-600 hover:bg-purple-700' },
  { value: 'balanced', label: 'Balanced', color: 'bg-purple-600 hover:bg-purple-700' },
  { value: 'cultural', label: 'Cultural', color: 'bg-purple-600 hover:bg-purple-700' },
  { value: 'foodie', label: 'Foodie', color: 'bg-purple-600 hover:bg-purple-700' },
] as const;

// --- Initial State Helper ---
// Defining this avoids "undefined" checks throughout the code
const INITIAL_STATE: UserPreferences = {
  hobbies: [],
  foodPreferences: {
    dietaryRestrictions: [],
    cuisinePreferences: [],
  },
  budgetRange: { min: 0, max: 500 },
  tripDuration: 7,
  travelStyle: 'balanced',
};

export default function PreferencesPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserPreferences>(INITIAL_STATE);

  // Generic array toggle helper
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

  const handleBudgetChange = (field: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData((prev) => ({
      ...prev,
      budgetRange: { ...prev.budgetRange, [field]: numValue },
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem('userPreferences', JSON.stringify(formData));
    navigate('/sandbox');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-(--muted) to-(--muted)/50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-4xl md:text-5xl">Plan Your Japan Trip</CardTitle>
            <CardDescription className="text-lg">
              Tell us about your preferences and we'll help you create the perfect itinerary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Hobbies Section */}
              <div className="space-y-4">
                <Label className="text-xl font-semibold">What are your interests?</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

              {/* Food Preferences Section */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-xl font-semibold">Dietary Restrictions</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

                <div className="space-y-4">
                  <Label className="text-xl font-semibold">Cuisine Preferences</Label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
              </div>

              {/* Budget Range */}
              <div className="space-y-4">
                <Label htmlFor="budget-min" className="text-xl font-semibold">Daily Budget (USD)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="budget-min"
                    type="number"
                    min="0"
                    value={formData.budgetRange.min}
                    onChange={(e) => handleBudgetChange('min', e.target.value)}
                    placeholder="Min"
                  />
                  <span className="text-(--muted-foreground) font-medium">to</span>
                  <Input
                    id="budget-max"
                    type="number"
                    min="0"
                    value={formData.budgetRange.max}
                    onChange={(e) => handleBudgetChange('max', e.target.value)}
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Trip Duration */}
              <div className="space-y-4">
                <Label htmlFor="duration" className="text-xl font-semibold">Trip Duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="30"
                  value={formData.tripDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, tripDuration: parseInt(e.target.value) || 1 }))}
                  className="w-32"
                />
              </div>

              {/* Travel Style */}
              <div className="space-y-4">
                <Label className="text-xl font-semibold">Travel Style</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {TRAVEL_STYLES.map((style) => {
                    const isSelected = formData.travelStyle === style.value;
                    return (
                      <Button
                        key={style.value}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => setFormData(prev => ({ ...prev, travelStyle: style.value }))}
                        aria-pressed={isSelected}
                        className={cn(
                          "h-auto py-3",
                          isSelected && style.color
                        )}
                      >
                        {style.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
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