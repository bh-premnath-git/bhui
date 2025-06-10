import { useMemo, useCallback } from "react";
import { toast } from "sonner";
import { isFieldEmpty } from "../utils/formUtils";

/**
 * Custom hook for form validation
 * @param selectedNodeId - ID of the selected node
 * @param requiredFields - List of fields that are required
 * @param getNodeFormData - Function to get node form data
 */
export const useFormValidation = (
  selectedNodeId: string,
  requiredFields: string[],
  getNodeFormData: (id: string) => any
) => {
  const isSaveDisabled = useMemo(() => {
    const data = getNodeFormData(selectedNodeId) || {};
    // Ensure requiredFields is an array before calling some()
    return Array.isArray(requiredFields) && requiredFields.length > 0
      ? requiredFields.some((f) => isFieldEmpty(data[f]))
      : false; // If no required fields, form is valid
  }, [getNodeFormData, requiredFields, selectedNodeId]);

  const validateForm = useCallback(() => {
    const data = getNodeFormData(selectedNodeId);
    if (!data) {
      toast("Missing form data", {
        style: { backgroundColor: "#f44336", color: "#fff" },
      });
      return false;
    }
    
    // Check if requiredFields is an array before using filter
    if (Array.isArray(requiredFields) && requiredFields.length > 0) {
      const missing = requiredFields.filter((f) => isFieldEmpty(data[f]));
      if (missing.length) {
        toast(`Missing required fields: ${missing.join(", ")}`, {
          style: { backgroundColor: "#f44336", color: "#fff" },
        });
        return false;
      }
    }
    
    return true;
  }, [getNodeFormData, requiredFields, selectedNodeId]);

  return { isSaveDisabled, validateForm };
}; 