import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserPreferences } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const hobbyOptions = [
  'Temples & Shrines',
  'Museums & Art',
  'Nature & Parks',
  'Food & Dining',
  'Shopping',
  'Nightlife',
  'Technology',
  'History & Culture',
  'Photography',
  'Anime & Manga',
];

const dietaryRestrictions = [
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Halal',
  'Kosher',
  'Gluten-Free',
  'No Pork',
  'No Beef',
];

const cuisinePreferences = [
  'Sushi',
  'Ramen',
  'Tempura',
  'Yakiniku',
  'Kaiseki',
  'Okonomiyaki',
  'Street Food',
  'Western',
  'Chinese',
  'Korean',
];

const travelStyles = [
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'adventurous', label: 'Adventurous' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'foodie', label: 'Foodie' },
] as const;

export default function PreferencesPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<UserPreferences>>({
    hobbies: [],
    foodPreferences: {
      dietaryRestrictions: [],
      cuisinePreferences: [],
    },
    budgetRange: {
      min: 0,
      max: 500,
    },
    tripDuration: 7,
    travelStyle: 'balanced',
  });

  const handleHobbyToggle = (hobby: string) => {
    setFormData((prev) => {
      const hobbies = prev.hobbies || [];
      const newHobbies = hobbies.includes(hobby)
        ? hobbies.filter((h) => h !== hobby)
        : [...hobbies, hobby];
      return { ...prev, hobbies: newHobbies };
    });
  };

  const handleDietaryToggle = (restriction: string) => {
    setFormData((prev) => {
      const restrictions = prev.foodPreferences?.dietaryRestrictions || [];
      const newRestrictions = restrictions.includes(restriction)
        ? restrictions.filter((r) => r !== restriction)
        : [...restrictions, restriction];
      return {
        ...prev,
        foodPreferences: {
          ...prev.foodPreferences,
          dietaryRestrictions: newRestrictions,
          cuisinePreferences: prev.foodPreferences?.cuisinePreferences || [],
        },
      };
    });
  };

  const handleCuisineToggle = (cuisine: string) => {
    setFormData((prev) => {
      const cuisines = prev.foodPreferences?.cuisinePreferences || [];
      const newCuisines = cuisines.includes(cuisine)
        ? cuisines.filter((c) => c !== cuisine)
        : [...cuisines, cuisine];
      return {
        ...prev,
        foodPreferences: {
          ...prev.foodPreferences,
          dietaryRestrictions: prev.foodPreferences?.dietaryRestrictions || [],
          cuisinePreferences: newCuisines,
        },
      };
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem('userPreferences', JSON.stringify(formData));
    navigate('/sandbox');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted to-muted/50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="border-2">
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
                  {hobbyOptions.map((hobby) => (
                    <Button
                      key={hobby}
                      type="button"
                      variant={formData.hobbies?.includes(hobby) ? "default" : "outline"}
                      onClick={() => handleHobbyToggle(hobby)}
                      className={cn(
                        "h-auto py-3",
                        formData.hobbies?.includes(hobby) && "bg-primary"
                      )}
                    >
                      {hobby}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Food Preferences Section */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-xl font-semibold">Dietary Restrictions</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {dietaryRestrictions.map((restriction) => (
                      <Button
                        key={restriction}
                        type="button"
                        variant={formData.foodPreferences?.dietaryRestrictions?.includes(restriction) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleDietaryToggle(restriction)}
                        className={cn(
                          "h-auto py-2.5",
                          formData.foodPreferences?.dietaryRestrictions?.includes(restriction) && "bg-green-600 hover:bg-green-700"
                        )}
                      >
                        {restriction}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-xl font-semibold">Cuisine Preferences</Label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {cuisinePreferences.map((cuisine) => (
                      <Button
                        key={cuisine}
                        type="button"
                        variant={formData.foodPreferences?.cuisinePreferences?.includes(cuisine) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleCuisineToggle(cuisine)}
                        className={cn(
                          "h-auto py-2.5",
                          formData.foodPreferences?.cuisinePreferences?.includes(cuisine) && "bg-orange-600 hover:bg-orange-700"
                        )}
                      >
                        {cuisine}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Budget Range */}
              <div className="space-y-4">
                <Label className="text-xl font-semibold">Daily Budget (USD)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="0"
                    value={formData.budgetRange?.min || 0}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        budgetRange: {
                          min: parseInt(e.target.value) || 0,
                          max: prev.budgetRange?.max || 500,
                        },
                      }))
                    }
                  />
                  <span className="text-muted-foreground font-medium">to</span>
                  <Input
                    type="number"
                    min="0"
                    value={formData.budgetRange?.max || 500}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        budgetRange: {
                          min: prev.budgetRange?.min || 0,
                          max: parseInt(e.target.value) || 500,
                        },
                      }))
                    }
                  />
                </div>
              </div>

              {/* Trip Duration */}
              <div className="space-y-4">
                <Label className="text-xl font-semibold">Trip Duration (days)</Label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.tripDuration || 7}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tripDuration: parseInt(e.target.value) || 7,
                    }))
                  }
                  className="w-32"
                />
              </div>

              {/* Travel Style */}
              <div className="space-y-4">
                <Label className="text-xl font-semibold">Travel Style</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {travelStyles.map((style) => (
                    <Button
                      key={style.value}
                      type="button"
                      variant={formData.travelStyle === style.value ? "default" : "outline"}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          travelStyle: style.value,
                        }))
                      }
                      className={cn(
                        "h-auto py-3",
                        formData.travelStyle === style.value && "bg-purple-600 hover:bg-purple-700"
                      )}
                    >
                      {style.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button type="submit" size="lg" className="w-full">
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
