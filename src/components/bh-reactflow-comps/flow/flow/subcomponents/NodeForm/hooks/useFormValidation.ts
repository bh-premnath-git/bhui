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
    return requiredFields.some((f) => isFieldEmpty(data[f]));
  }, [getNodeFormData, requiredFields, selectedNodeId]);

  const validateForm = useCallback(() => {
    const data = getNodeFormData(selectedNodeId);
    if (!data) {
      toast("Missing required fields", {
        style: { backgroundColor: "#f44336", color: "#fff" },
      });
      return false;
    }
    
    const missing = requiredFields.filter((f) => isFieldEmpty(data[f]));
    if (missing.length) {
      toast(`Missing required fields: ${missing.join(", ")}`, {
        style: { backgroundColor: "#f44336", color: "#fff" },
      });
      return false;
    }
    
    return true;
  }, [getNodeFormData, requiredFields, selectedNodeId]);

  return { isSaveDisabled, validateForm };
}; 