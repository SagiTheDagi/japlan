import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface LoadPlanDialogProps {
  open: boolean;
  isLoading: boolean;
  planNames: string[];
  onOpenChange: (open: boolean) => void;
  onLoad: (name: string) => Promise<void>;
  onLoadNames: () => Promise<void>;
}

export default function LoadPlanDialog({
  open,
  isLoading,
  planNames,
  onOpenChange,
  onLoad,
  onLoadNames,
}: LoadPlanDialogProps) {
  useEffect(() => {
    if (open) {
      onLoadNames();
    }
  }, [open, onLoadNames]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Load Saved Plan</DialogTitle>
          <DialogDescription>
            Select a plan to load
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-(--muted-foreground)" />
            </div>
          ) : planNames.length === 0 ? (
            <div className="text-center py-8 text-(--muted-foreground)">
              No saved plans found
            </div>
          ) : (
            <div className="space-y-2">
              {planNames.map((name) => (
                <Button
                  key={name}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onLoad(name)}
                >
                  {name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

