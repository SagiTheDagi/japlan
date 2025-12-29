import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Plan, CalendarDay, GridItem, UserPreferences } from '../types';
import CalendarGrid from '../components/CalendarGrid';
import BlockPalette from '../components/BlockPalette';
import ActivityBlock from '../components/ActivityBlock';
import RestaurantBlock from '../components/RestaurantBlock';
import { sampleActivities, sampleRestaurants } from '../data/sampleData';
import { api } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Moon } from 'lucide-react';

export default function SandboxPage() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  
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

  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    const savedPlanId = localStorage.getItem('savedPlanId');
    
    if (savedPreferences) {
      try {
        const prefs = JSON.parse(savedPreferences);
        setPreferences(prefs);
        
        if (savedPlanId) {
          api.getPlan(savedPlanId)
            .then((loadedPlan) => {
              setPlan(loadedPlan);
            })
            .catch(() => {
              initializeNewPlan(prefs);
            });
        } else {
          initializeNewPlan(prefs);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  const initializeNewPlan = (prefs: UserPreferences) => {
    const tripDuration = prefs.tripDuration || 7;
    const days: CalendarDay[] = Array.from({ length: tripDuration }, (_, i) => ({
      day: i + 1,
      items: [],
    }));

    setPlan({
      preferences: prefs,
      days,
    });
  };

  const handleItemDrop = (day: number, timeSlot: string, item: GridItem) => {
    if (!plan) return;

    setPlan((prevPlan) => {
      if (!prevPlan) return prevPlan;

      const updatedDays = prevPlan.days.map((d) => {
        if (d.day === day) {
          const existingItem = d.items.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              ...d,
              items: d.items.map((i) =>
                i.id === item.id ? { ...i, timeSlot } : i
              ),
            };
          }
          return {
            ...d,
            items: [...d.items, item],
          };
        }
        return d;
      });

      return {
        ...prevPlan,
        days: updatedDays,
      };
    });
  };

  const handleItemRemove = (day: number, itemId: string) => {
    if (!plan) return;

    setPlan((prevPlan) => {
      if (!prevPlan) return prevPlan;

      const updatedDays = prevPlan.days.map((d) => {
        if (d.day === day) {
          return {
            ...d,
            items: d.items.filter((i) => i.id !== itemId),
          };
        }
        return d;
      });

      return {
        ...prevPlan,
        days: updatedDays,
      };
    });
  };

  const handleSavePlan = async () => {
    if (!plan) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const savedPlanId = localStorage.getItem('savedPlanId');
      let savedPlan: Plan;

      if (savedPlanId && plan.id) {
        savedPlan = await api.updatePlan(savedPlanId, plan);
      } else {
        savedPlan = await api.createPlan(plan);
        localStorage.setItem('savedPlanId', savedPlan.id || '');
      }

      setPlan(savedPlan);
      setSaveMessage('Plan saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving plan:', error);
      setSaveMessage('Error saving plan. Please try again.');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const renderGridItem = (item: GridItem, day: number) => {
    if (item.type === 'activity') {
      return (
        <ActivityBlock
          activity={item.item as any}
          isInPalette={false}
          onRemove={() => handleItemRemove(day, item.id)}
        />
      );
    } else {
      return (
        <RestaurantBlock
          restaurant={item.item as any}
          isInPalette={false}
          onRemove={() => handleItemRemove(day, item.id)}
        />
      );
    }
  };

  if (!plan || !preferences) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--background)">
        <div className="text-(--muted-foreground) text-lg font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-(--background)">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl">Your Japan Itinerary</CardTitle>
              <CardDescription className="mt-1">
                {preferences.tripDuration} days • {preferences.travelStyle} style
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {saveMessage && (
                <div className={`text-sm font-semibold px-3 py-1.5 rounded-lg ${saveMessage.includes('Error') ? 'text-(--destructive) bg-(--destructive)/10' : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'}`}>
                  {saveMessage}
                </div>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                title="Toggle theme"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <Button variant="outline" onClick={() => navigate('/')}>
                Edit Preferences
              </Button>
              <Button onClick={handleSavePlan} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Plan'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex-1 flex overflow-hidden">
        <BlockPalette
          activities={sampleActivities}
          restaurants={sampleRestaurants}
        />

        <div className="flex-1 overflow-auto">
          <CalendarGrid
            days={plan.days}
            onItemDrop={handleItemDrop}
            onItemRemove={handleItemRemove}
            gridItemRenderer={renderGridItem}
          />
        </div>
      </div>
    </div>
  );
}