import { useState, useEffect } from "react";
import { useResource } from "@/hooks/api/useResource";
import { useAlertHub } from "../hooks/usealertHub";
import { AlertHub } from "@/types/dataops/alertsHub";
import {KEYCLOAK_API_REMOTE_URL, MONITOR_REMOTE_URL } from "@/config/platformenv";
import { toast } from "sonner";

type DialogProps = {
  open: boolean;
  mode: "assign" | "resolve";
  onClose: () => void;
  onAssign?: (user: string) => void;
  onResolve?: (reason: string, resolutionPlan: string) => void;
  currentUser?: string;
  currentReason?: string;
};

export function FlexibleDialog({
  open,
  mode,
  onClose,
  onAssign,
  onResolve,
  currentUser = "",
  currentReason = "",
}: DialogProps) {
  const [user, setUser] = useState(currentUser);
  const [reason, setReason] = useState(currentReason);
  const [resolutionPlan, setResolutionPlan] = useState("");

  
  useEffect(() => {
    setUser(currentUser);
    setReason(currentReason);
    setResolutionPlan("");
  }, [open, currentUser, currentReason]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (mode === "assign" && user && onAssign) {
      onAssign(user);
      setUser(user);
      onClose();
    } else if (mode === "resolve") {
      if (!reason || !resolutionPlan) {
        toast("Please enter all information.");
        return;
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {mode === "assign" ? "Assign To" : "Correction Plan"}
          </h2>
        </div>

        {mode === "assign" && (
          <select
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="w-full p-2 border rounded mb-6"
          >
            <option value="">Select a user</option>
            {userList.map((u) => (
              <option key={u.alert_id} value={u.created_by}>
                {u.created_by}
              </option>
            ))}
            
          </select>
        )}

        {mode === "resolve" && (
          <>
            <textarea
              placeholder="Enter the reason for resolution"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 border rounded mb-6"
              rows={4}
            />
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Resolution Plan</h2>
            </div>
            <textarea
              placeholder="Enter the resolution plan"
              value={resolutionPlan}
              onChange={(e) => setResolutionPlan(e.target.value)}
              className="w-full p-2 border rounded mb-6"
              rows={4}
            />
          </>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            {mode === "assign" ? "Assign" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
