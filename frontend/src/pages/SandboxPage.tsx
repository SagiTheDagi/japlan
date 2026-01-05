import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Plan, CalendarDay, GridItem, UserPreferences } from '../types';
import CalendarGrid from '../components/CalendarGrid';
import MonthView from '../components/MonthView';
import BlockPalette from '../components/BlockPalette';
import ActivityBlock from '../components/ActivityBlock';
import RestaurantBlock from '../components/RestaurantBlock';
import PageHeader from '../components/PageHeader';
import { sampleActivities, sampleRestaurants } from '../data/sampleData';
import { api } from '../services/api';
import { useCalendarNavigation } from '../hooks/useCalendarNavigation';

export default function SandboxPage() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [savedPlanNames, setSavedPlanNames] = useState<string[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  
  const {
    currentStart,
    handlePrevious: handlePreviousPage,
    handleNext: handleNextPage,
    reset: resetNavigation,
    pageSize,
  } = useCalendarNavigation({
    viewMode,
    totalDays: plan?.days.length || 0,
  });

  useEffect(() => {
    // Reset navigation when view mode changes
    resetNavigation();
  }, [viewMode, resetNavigation]);

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

  const handleSavePlan = async (planName: string) => {
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
    
    // Show a "page" of days based on view mode (7 for week, 35 for month)
    return plan.days.slice(currentStart, currentStart + pageSize);
  }, [plan, currentStart, pageSize]);

  // Calculate week information
  const totalWeeks = useMemo(() => {
    if (!plan) return 0;
    return Math.ceil(plan.days.length / 7);
  }, [plan]);

  const currentWeekNumber = useMemo(() => {
    return Math.floor(currentStart / 7) + 1;
  }, [currentStart]);

  const weekStartDay = currentStart + 1;
  const weekEndDay = Math.min(currentStart + pageSize, plan?.days.length || 0);



  const handleViewModeChange = (mode: 'week' | 'month') => {
    setViewMode(mode);
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
      <PageHeader
        preferences={preferences}
        plan={plan}
        viewMode={viewMode}
        isDarkMode={isDarkMode}
        isSaving={isSaving}
        saveMessage={saveMessage}
        saveDialogOpen={saveDialogOpen}
        loadDialogOpen={loadDialogOpen}
        savedPlanNames={savedPlanNames}
        isLoadingPlans={isLoadingPlans}
        onViewModeChange={handleViewModeChange}
        onToggleTheme={toggleTheme}
        onSaveDialogOpenChange={setSaveDialogOpen}
        onLoadDialogOpenChange={setLoadDialogOpen}
        onSavePlan={handleSavePlan}
        onLoadPlan={handleLoadPlan}
        onLoadPlanNames={loadSavedPlanNames}
      />

      <div className="flex-1 flex overflow-hidden">
        <BlockPalette
          activities={sampleActivities}
          restaurants={sampleRestaurants}
        />

        <div className="flex-1 overflow-auto flex flex-col">
          {viewMode === 'week' ? (
            <CalendarGrid
              days={visibleDays}
              onItemDrop={handleItemDrop}
              onItemRemove={handleItemRemove}
              gridItemRenderer={renderGridItem}
              viewMode={viewMode}
              currentWeekStart={currentStart}
              totalDays={plan?.days.length || 0}
              totalWeeks={totalWeeks}
              currentWeekNumber={currentWeekNumber}
              weekStartDay={weekStartDay}
              weekEndDay={weekEndDay}
              onPrevious={handlePreviousPage}
              onNext={handleNextPage}
            />
          ) : (
            <MonthView
              days={visibleDays}
              onItemDrop={handleItemDrop}
              onItemRemove={handleItemRemove}
              viewMode={viewMode}
              currentWeekStart={currentStart}
              totalDays={plan?.days.length || 0}
              totalWeeks={totalWeeks}
              currentWeekNumber={currentWeekNumber}
              weekStartDay={weekStartDay}
              weekEndDay={weekEndDay}
              onPrevious={handlePreviousPage}
              onNext={handleNextPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}