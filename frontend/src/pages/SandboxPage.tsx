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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sun, Moon, Loader2 } from 'lucide-react';

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
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/d7fef365-2618-471b-b93a-5255705ca998',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SandboxPage.tsx:62',message:'Loading preferences',data:{tripDuration:prefs.tripDuration,savedPlanId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        setPreferences(prefs);
        
        if (savedPlanId) {
          api.getPlan(savedPlanId)
            .then((loadedPlan) => {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/d7fef365-2618-471b-b93a-5255705ca998',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SandboxPage.tsx:70',message:'Loaded plan from API',data:{planDays:loadedPlan.days?.length,planTripDuration:loadedPlan.preferences?.tripDuration,currentTripDuration:prefs.tripDuration},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
              // #endregion
              // Update plan with current preferences and adjust days if trip duration changed
              const currentTripDuration = prefs.tripDuration || 7;
              const planTripDuration = loadedPlan.preferences?.tripDuration || 7;
              
              if (currentTripDuration !== planTripDuration || loadedPlan.days.length !== currentTripDuration) {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/d7fef365-2618-471b-b93a-5255705ca998',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SandboxPage.tsx:77',message:'Trip duration mismatch, updating plan days',data:{currentTripDuration,planTripDuration,currentDays:loadedPlan.days.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
                // #endregion
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
                
                setPlan({
                  ...loadedPlan,
                  preferences: prefs,
                  days: updatedDays,
                });
              } else {
                // Just update preferences
                setPlan({
                  ...loadedPlan,
                  preferences: prefs,
                });
              }
            })
            .catch(() => {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/d7fef365-2618-471b-b93a-5255705ca998',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SandboxPage.tsx:100',message:'Plan load failed, initializing new',data:{tripDuration:prefs.tripDuration},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
              // #endregion
              initializeNewPlan(prefs);
            });
        } else {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/d7fef365-2618-471b-b93a-5255705ca998',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SandboxPage.tsx:105',message:'No saved plan, initializing new',data:{tripDuration:prefs.tripDuration},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d7fef365-2618-471b-b93a-5255705ca998',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SandboxPage.tsx:88',message:'initializeNewPlan called',data:{tripDuration,prefsTripDuration:prefs.tripDuration},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    const days: CalendarDay[] = Array.from({ length: tripDuration }, (_, i) => ({
      day: i + 1,
      items: [],
    }));
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d7fef365-2618-471b-b93a-5255705ca998',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SandboxPage.tsx:95',message:'Setting plan with days',data:{daysLength:days.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion

    setPlan({
      preferences: prefs,
      days,
    });
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