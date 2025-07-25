import { useState, useEffect } from "react";
import { useAlertHub } from "../hooks/usealertHub";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { MONITOR_REMOTE_URL } from "@/config/platformenv";
import { X, Eye, Edit2, User, Save } from "lucide-react";

type DialogProps = {
  open: boolean;
  mode: "assign" | "resolve";
  onClose: () => void;
  onAssign?: (user: string) => void;
  onResolve?: (correctionPlan: string, preventionPlan: string) => void;
  currentUser?: string;
  currentResolution?: string[] | any;
  alertId?: string;
};

export function FlexibleDialog({
  open,
  mode,
  onClose,
  onAssign,
  onResolve,
  currentUser = "",
  currentResolution = null,
  alertId,
}: DialogProps) {
  const [user, setUser] = useState(currentUser);
  const [correctionPlan, setCorrectionPlan] = useState("");
  const [preventionPlan, setPreventionPlan] = useState("");
  const [isViewMode, setIsViewMode] = useState(false);

  const { alertHub, updateAlert } = useAlertHub();
  const queryClient = useQueryClient();

  useEffect(() => {
    setUser(currentUser);

    if (currentResolution) {
      try {
        let resolutionData: any;

        if (Array.isArray(currentResolution) && currentResolution.length > 0) {
          const firstItem = currentResolution[0];
          if (typeof firstItem === "string") {
            try {
              resolutionData = JSON.parse(firstItem);
            } catch {
              resolutionData = { correction_plan: firstItem, prevention_plan: "" };
            }
          } else {
            resolutionData = firstItem;
          }
        } else if (typeof currentResolution === "string") {
          try {
            resolutionData = JSON.parse(currentResolution);
          } catch {
            resolutionData = { correction_plan: currentResolution, prevention_plan: "" };
          }
        } else {
          resolutionData = currentResolution;
        }

        setCorrectionPlan(resolutionData.correction_plan || "");
        setPreventionPlan(resolutionData.prevention_plan || "");
        setIsViewMode(true);
      } catch {
        setCorrectionPlan("");
        setPreventionPlan("");
        setIsViewMode(false);
      }
    } else {
      setCorrectionPlan("");
      setPreventionPlan("");
      setIsViewMode(false);
    }
  }, [open, currentUser, currentResolution]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (mode === "assign") {
      if (!user || !onAssign) return;

      try {
        if (alertId) {
          await updateAlert.mutateAsync({
            alert_Id: alertId,
            assigned_to: user,
          });

          toast.success("Alert assigned successfully!");
          await queryClient.invalidateQueries({
            queryKey: ["alert", "list"],
          });

          onAssign(user);
          onClose();
        }
      } catch (error) {
        toast.error("Failed to assign alert");
        console.error("Assignment error:", error);
      }
    } else if (mode === "resolve") {
      if (!correctionPlan || !preventionPlan) {
        toast.error("Please enter both correction plan and prevention plan.");
        return;
      }

      const existing =
        typeof currentResolution === "string"
          ? JSON.parse(currentResolution)
          : Array.isArray(currentResolution)
            ? currentResolution[0]
            : currentResolution;

      if (
        correctionPlan.trim() === (existing?.correction_plan ?? "").trim() &&
        preventionPlan.trim() === (existing?.prevention_plan ?? "").trim()
      ) {
        toast.warning("No changes detected in resolution.");
        return;
      }

      try {
        if (alertId) {

          await updateAlert.mutateAsync({
            alert_Id: alertId,
            resolution_reason: {
              "correction_plan": correctionPlan,
              "prevention_plan": preventionPlan,
            },
          } as any);

          toast.success("Alert resolved successfully!");
          await queryClient.invalidateQueries({
            queryKey: ["alert", "list"],
          });

          onResolve?.(correctionPlan, preventionPlan);
          onClose();
        }
      } catch (error) {
        toast.error("Failed to resolve alert");
        console.error("Resolution error:", error);
      }
    }
  };

  const toggleEditMode = () => {
    setIsViewMode(!isViewMode);
  };

  const userList =
    alertHub?.length > 0
      ? [...new Set(alertHub.map((alert) => alert.created_by))].map((user) => ({
        created_by: user,
      }))
      : [];


  const isAssignDisabled = mode === "assign" && (!user || user === currentUser);
  const isResolveDisabled =
    mode === "resolve" &&
    (!correctionPlan.trim() || !preventionPlan.trim() || (correctionPlan.trim() ===
      (typeof currentResolution === "string"
        ? JSON.parse(currentResolution)?.correction_plan?.trim()
        : currentResolution?.[0]?.correction_plan?.trim() || currentResolution?.correction_plan?.trim()) &&
      preventionPlan.trim() ===
      (typeof currentResolution === "string"
        ? JSON.parse(currentResolution)?.prevention_plan?.trim()
        : currentResolution?.[0]?.prevention_plan?.trim() || currentResolution?.prevention_plan?.trim())));


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50  dark:text-black" >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-semibold mt-1">
            {mode === "assign" ? "Assign To" : isViewMode ? "View Resolution"
              : "Add Resolution"}
          </h2>

          <div className="flex gap-2">
            {mode === "resolve" && currentResolution && (
              <button
                onClick={toggleEditMode}
                className="flex items-center gap-1 px-3 py-1.5 bg-black text-white rounded hover:bg-gray-800"
                aria-label={isViewMode ? "Switch to Edit Mode" : "Switch to View Mode"}
              >
                {isViewMode ? <Edit2 size={16} /> : <Eye size={16} />}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Assign dropdown */}
        {mode === "assign" && (
          <select
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="w-full p-2 border rounded mb-6"
          >
            <option value="">Select a user</option>
            {userList.map((u, index) => (
              <option key={index} value={u.created_by}>
                {u.created_by}
              </option>
            ))}
          </select>
        )}

        {/* Resolve fields */}
        {mode === "resolve" && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Correction Plan</label>
              <textarea
                placeholder="Enter the correction plan"
                value={correctionPlan}
                onChange={(e) => setCorrectionPlan(e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
                disabled={isViewMode}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Prevention Plan</label>
              <textarea
                placeholder="Enter the prevention plan"
                value={preventionPlan}
                onChange={(e) => setPreventionPlan(e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
                disabled={isViewMode}
              />
            </div>
          </>
        )}

        {/* Submit / Assign button */}
        {!isViewMode && (
          <div className="flex justify-end gap-2">
            <button
              onClick={handleSubmit}
              disabled={updateAlert.isPending || isAssignDisabled || isResolveDisabled}
              className={`flex items-center gap-2 px-4 py-2 text-white rounded transition ${updateAlert.isPending || isAssignDisabled || isResolveDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
                }`}
              aria-label={mode === "assign" ? "Assign" : "Submit"}
            >
              {updateAlert.isPending
                ? "Submitting..."
                : mode === "assign"
                  ?
                  <User size={16} />
                  :
                  <Save size={16} />
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}