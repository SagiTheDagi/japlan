import { useNavigate } from 'react-router-dom';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ViewModeToggle from './ViewModeToggle';
import SavePlanDialog from './SavePlanDialog';
import LoadPlanDialog from './LoadPlanDialog';
import { Sun, Moon } from 'lucide-react';
import type { Plan, UserPreferences } from '../types';

interface PageHeaderProps {
  preferences: UserPreferences;
  plan: Plan | null;
  viewMode: 'week' | 'month';
  isDarkMode: boolean;
  isSaving: boolean;
  saveMessage: string | null;
  saveDialogOpen: boolean;
  loadDialogOpen: boolean;
  savedPlanNames: string[];
  isLoadingPlans: boolean;
  onViewModeChange: (mode: 'week' | 'month') => void;
  onToggleTheme: () => void;
  onSaveDialogOpenChange: (open: boolean) => void;
  onLoadDialogOpenChange: (open: boolean) => void;
  onSavePlan: (planName: string) => Promise<void>;
  onLoadPlan: (name: string) => Promise<void>;
  onLoadPlanNames: () => Promise<void>;
}

export default function PageHeader({
  preferences,
  plan,
  viewMode,
  isDarkMode,
  isSaving,
  saveMessage,
  saveDialogOpen,
  loadDialogOpen,
  savedPlanNames,
  isLoadingPlans,
  onViewModeChange,
  onToggleTheme,
  onSaveDialogOpenChange,
  onLoadDialogOpenChange,
  onSavePlan,
  onLoadPlan,
  onLoadPlanNames,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <Card className="rounded-none border-x-0 border-t-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <CardTitle className="text-3xl">Your Japan Itinerary</CardTitle>
              <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
            </div>
            <CardDescription className="mt-1">
              {preferences.tripDuration} days • {preferences.travelStyle} style
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {saveMessage && (
              <div className={`text-sm font-semibold px-3 py-1.5 rounded-lg ${
                saveMessage.includes('Error') 
                  ? 'text-(--destructive) bg-(--destructive)/10' 
                  : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
              }`}>
                {saveMessage}
              </div>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggleTheme}
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Button variant="outline" onClick={() => onLoadDialogOpenChange(true)}>
              Load Plan
            </Button>

            <LoadPlanDialog
              open={loadDialogOpen}
              isLoading={isLoadingPlans}
              planNames={savedPlanNames}
              onOpenChange={onLoadDialogOpenChange}
              onLoad={onLoadPlan}
              onLoadNames={onLoadPlanNames}
            />

            <Button variant="outline" onClick={() => navigate('/')}>
              Edit Preferences
            </Button>
            
            <Button 
              onClick={() => onSaveDialogOpenChange(true)} 
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Plan'}
            </Button>

            <SavePlanDialog
              open={saveDialogOpen}
              plan={plan}
              isSaving={isSaving}
              onOpenChange={onSaveDialogOpenChange}
              onSave={onSavePlan}
            />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

