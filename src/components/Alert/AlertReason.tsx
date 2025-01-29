import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ApiService } from '@/services/apiServices';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react';
import { MONITOR_PORT } from '@/configration/environment';

interface ResolutionReasonProps {
  open: boolean;
  onClose: () => void;
  onAssign: (data: { preventionPlan: string; correctionPlan: string }) => void;
  alertId: string;
  initialValues?: { preventionPlan: string; correctionPlan: string };
}

const ResolutionReason: React.FC<ResolutionReasonProps> = ({ 
  open, 
  onClose, 
  onAssign,
  alertId,
  initialValues
}) => {
  const [preventionPlan, setPreventionPlan] = useState(initialValues?.preventionPlan || "");
  const [correctionPlan, setCorrectionPlan] = useState(initialValues?.correctionPlan || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialValues) {
      setPreventionPlan(initialValues.preventionPlan);
      setCorrectionPlan(initialValues.correctionPlan);
    }
  }, [initialValues]);

  const handleAssign = async () => {
    if (!alertId) {
      setError("Alert ID is missing. Cannot proceed with updating resolution reason.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const resolutionReason = {
        preventionPlan,
        correctionPlan
      };

      const response = await ApiService(
        MONITOR_PORT,
        'patch',
        `/api/v1/alert/${alertId}`,
        { resolution_reason: resolutionReason },  // Send as an object, not a JSON string
        null,
        null,
        false
      );
      if (!response) {
        throw new Error("Failed to update resolution reason. Unexpected response from server.");
      }

      onAssign({ preventionPlan, correctionPlan });
      onClose();
    } catch (error) {
      console.error("Error updating resolution reason:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Root Cause</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="prevention-plan">
              Prevention Plan
            </label>
            <textarea
              id="prevention-plan"
              value={preventionPlan}
              onChange={(e) => setPreventionPlan(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              placeholder="Enter prevention plan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="correction-plan">
              Correction Plan
            </label>
            <textarea
              id="correction-plan"
              value={correctionPlan}
              onChange={(e) => setCorrectionPlan(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              placeholder="Enter correction plan"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleAssign}
            disabled={!preventionPlan || !correctionPlan || isSubmitting}
            className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-300"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Save Reason'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResolutionReason;
