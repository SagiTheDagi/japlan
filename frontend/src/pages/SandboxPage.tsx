import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Plan, CalendarDay, GridItem, UserPreferences } from '../types';
import CalendarGrid from '../components/CalendarGrid';
import WeeksView from '../components/WeeksView';
import BlockPalette from '../components/BlockPalette';
import ActivityBlock from '../components/ActivityBlock';
import RestaurantBlock from '../components/RestaurantBlock';
import { sampleActivities, sampleRestaurants } from '../data/sampleData';
import { api } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Sun, Moon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function SandboxPage() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [planName, setPlanName] = useState('');
  const [savedPlanNames, setSavedPlanNames] = useState<string[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [viewMode, setViewMode] = useState<'days' | 'weeks'>('days');
  const [currentWeekStart, setCurrentWeekStart] = useState(0);

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
              // Update plan with current preferences and adjust days if trip duration changed
              const currentTripDuration = prefs.tripDuration || 7;
              const planTripDuration = loadedPlan.preferences?.tripDuration || 7;
              
              if (currentTripDuration !== planTripDuration || loadedPlan.days.length !== currentTripDuration) {
                // Adjust days array to match current trip duration
                let updatedDays = [...loadedPlan.days];
                if (currentTripDuration > updatedDays.length) {
                  // Add more days
                  for (let i = updatedDays.length; i < currentTripDuration; i++) {
                    updatedDays.push({ day: i + 1, items: [] });
                  }
                } else if (currentTripDuration < updatedDays.length) {
                  // Remove extra days (keep items from removed days for now, or remove them)
                  updatedDays = updatedDays.slice(0, currentTripDuration);
                }
                
                const newPlan = {
                  ...loadedPlan,
                  preferences: prefs,
                  days: updatedDays,
                };
                setPlan(newPlan);
              } else {
                // Just update preferences
                setPlan({
                  ...loadedPlan,
                  preferences: prefs,
                });
              }
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

    const newPlan = {
      preferences: prefs,
      days,
    };
    setPlan(newPlan);
  };

  const handleItemDrop = (day: number, item: GridItem) => {
    if (!plan) return;

    setPlan((prevPlan) => {
      if (!prevPlan) return prevPlan;

      // First, remove the item from its old location (if it exists)
      const daysWithItemRemoved = prevPlan.days.map((d) => ({
        ...d,
        items: d.items.filter((i) => i.id !== item.id),
      }));

      // Then, add it to the new location
      const updatedDays = daysWithItemRemoved.map((d) => {
        if (d.day === day) {
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
    if (!plan || !planName.trim()) {
      setSaveMessage('Please enter a plan name');
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const planToSave: Plan = {
        ...plan,
        name: planName.trim(),
      };

      let savedPlan: Plan;
      if (plan.id) {
        savedPlan = await api.updatePlan(String(plan.id), planToSave);
      } else {
        savedPlan = await api.createPlan(planToSave);
      }

      setPlan(savedPlan);
      setSaveMessage(`Plan "${planName}" saved successfully!`);
      setSaveDialogOpen(false);
      setPlanName('');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving plan:', error);
      setSaveMessage('Error saving plan. Please try again.');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const loadSavedPlanNames = async () => {
    setIsLoadingPlans(true);
    try {
      const names = await api.getAllPlanNames();
      setSavedPlanNames(names);
    } catch (error) {
      console.error('Error loading plan names:', error);
      setSaveMessage('Error loading saved plans');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleLoadPlan = async (name: string) => {
    try {
      const loadedPlan = await api.getPlanByName(name);
      setPlan(loadedPlan);
      setPlanName(loadedPlan.name || '');
      setLoadDialogOpen(false);
      setSaveMessage(`Plan "${name}" loaded successfully!`);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error loading plan:', error);
      setSaveMessage('Error loading plan. Please try again.');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  useEffect(() => {
    if (loadDialogOpen) {
      loadSavedPlanNames();
    }
  }, [loadDialogOpen]);

  // Calculate visible days based on view mode
  const visibleDays = useMemo(() => {
    if (!plan) return [];
    
    if (viewMode === 'days') {
      // In days view, show 7 days at a time (navigate by week)
      if (plan.days.length > 7) {
        return plan.days.slice(currentWeekStart, currentWeekStart + 7);
      }
      return plan.days;
    } else {
      // Weeks view: show ALL days in a wrapping grid (like monthly calendar)
      return plan.days;
    }
  }, [plan, viewMode, currentWeekStart]);

  // Calculate week information
  const totalWeeks = useMemo(() => {
    if (!plan) return 0;
    return Math.ceil(plan.days.length / 7);
  }, [plan]);

  const currentWeekNumber = useMemo(() => {
    return Math.floor(currentWeekStart / 7) + 1;
  }, [currentWeekStart]);

  const weekStartDay = currentWeekStart + 1;
  const weekEndDay = Math.min(currentWeekStart + 7, plan?.days.length || 0);

  // Navigation handlers
  const handlePreviousWeek = () => {
    if (viewMode === 'days') {
      // In days view, navigate by week (7 days)
      const newStart = currentWeekStart - 7;
      if (newStart >= 0) {
        setCurrentWeekStart(newStart);
      }
    } else {
      // In weeks view, navigation doesn't change what's shown (all days always visible)
      // But we can still track currentWeekStart for future features
      // For now, do nothing or scroll to previous section
    }
  };

  const handleNextWeek = () => {
    if (!plan) return;
    if (viewMode === 'days') {
      // In days view, navigate by week (7 days)
      const newStart = currentWeekStart + 7;
      const maxStart = plan.days.length - 7;
      if (newStart <= maxStart) {
        setCurrentWeekStart(newStart);
      }
    } else {
      // In weeks view, navigation doesn't change what's shown (all days always visible)
      // But we can still track currentWeekStart for future features
      // For now, do nothing or scroll to next section
    }
  };

  const handleViewModeChange = (mode: 'days' | 'weeks') => {
    setViewMode(mode);
    setCurrentWeekStart(0); // Reset to first week when switching views
  };

  const renderGridItem = (item: GridItem, day: number) => {
    if (item.type === 'activity') {
      return (
        <ActivityBlock
          activity={item.item as any}
          isInPalette={false}
          gridItemId={item.id}
          onRemove={() => handleItemRemove(day, item.id)}
        />
      );
    } else {
      return (
        <RestaurantBlock
          restaurant={item.item as any}
          isInPalette={false}
          gridItemId={item.id}
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
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-3xl">Your Japan Itinerary</CardTitle>
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 border border-(--border) rounded-md p-1">
                  <Button
                    variant={viewMode === 'days' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleViewModeChange('days')}
                    className={cn(
                      "h-7 px-3 text-xs",
                      viewMode === 'days' && "bg-(--primary) text-(--primary-foreground)"
                    )}
                  >
                    Days
                  </Button>
                  <Button
                    variant={viewMode === 'weeks' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleViewModeChange('weeks')}
                    className={cn(
                      "h-7 px-3 text-xs",
                      viewMode === 'weeks' && "bg-(--primary) text-(--primary-foreground)"
                    )}
                  >
                    Weeks
                  </Button>
                </div>
              </div>
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

              <Button variant="outline" onClick={() => setLoadDialogOpen(true)}>
                Load Plan
              </Button>

              <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Load Saved Plan</DialogTitle>
                    <DialogDescription>
                      Select a plan to load
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[400px] overflow-y-auto">
                    {isLoadingPlans ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-(--muted-foreground)" />
                      </div>
                    ) : savedPlanNames.length === 0 ? (
                      <div className="text-center py-8 text-(--muted-foreground)">
                        No saved plans found
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {savedPlanNames.map((name) => (
                          <Button
                            key={name}
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => handleLoadPlan(name)}
                          >
                            {name}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={() => navigate('/')}>
                Edit Preferences
              </Button>
              
              <Button 
                onClick={() => {
                  if (plan?.name) {
                    setPlanName(plan.name);
                  }
                  setSaveDialogOpen(true);
                }} 
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Plan'}
              </Button>

              <Dialog open={saveDialogOpen} onOpenChange={(open: boolean) => {
                setSaveDialogOpen(open);
                if (open && plan?.name) {
                  setPlanName(plan.name);
                } else if (!open) {
                  setPlanName('');
                }
              }}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Plan</DialogTitle>
                    <DialogDescription>
                      Enter a name for your plan
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="plan-name">Plan Name</Label>
                      <Input
                        id="plan-name"
                        value={planName}
                        onChange={(e) => setPlanName(e.target.value)}
                        placeholder="e.g., Tokyo Spring 2024"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && planName.trim()) {
                            handleSavePlan();
                          }
                        }}
                        autoFocus
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSavePlan} disabled={isSaving || !planName.trim()}>
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex-1 flex overflow-hidden">
        <BlockPalette
          activities={sampleActivities}
          restaurants={sampleRestaurants}
        />

        <div className="flex-1 overflow-auto flex flex-col">
          {plan && plan.days.length > 7 && (
            <div className="sticky top-0 z-20 bg-(--background) border-b border-(--border) px-6 py-6 flex items-center justify-center gap-6 shadow-sm">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePreviousWeek}
                disabled={currentWeekStart === 0}
                className="h-12 w-12"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <div className="text-3xl font-bold text-center min-w-[350px]">
                {viewMode === 'days' ? (
                  <>
                    Week {currentWeekNumber} of {totalWeeks}
                    <div className="text-lg font-normal text-(--muted-foreground) mt-2">
                      Days {weekStartDay}-{weekEndDay} of {plan.days.length}
                    </div>
                  </>
                ) : (
                  <>
                    All Days
                    <div className="text-lg font-normal text-(--muted-foreground) mt-2">
                      {plan.days.length} days total
                    </div>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={handleNextWeek}
                disabled={plan ? (viewMode === 'days' ? currentWeekStart >= plan.days.length - 7 : false) : true}
                className="h-12 w-12"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </div>
          )}
          {viewMode === 'days' ? (
            <CalendarGrid
              days={visibleDays}
              onItemDrop={handleItemDrop}
              onItemRemove={handleItemRemove}
              gridItemRenderer={renderGridItem}
            />
          ) : (
            <WeeksView
              days={visibleDays}
              onItemDrop={handleItemDrop}
              onItemRemove={handleItemRemove}
            />
          )}
        </div>
      </div>
    </div>
  );
}