import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Plan } from '../types';

interface SavePlanDialogProps {
  open: boolean;
  plan: Plan | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (planName: string) => Promise<void>;
}

export default function SavePlanDialog({
  open,
  plan,
  isSaving,
  onOpenChange,
  onSave,
}: SavePlanDialogProps) {
  const [planName, setPlanName] = useState('');

  useEffect(() => {
    if (open && plan?.name) {
      setPlanName(plan.name);
    } else if (!open) {
      setPlanName('');
    }
  }, [open, plan]);

  const handleSave = async () => {
    if (planName.trim()) {
      await onSave(planName.trim());
      setPlanName('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  handleSave();
                }
              }}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !planName.trim()}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

