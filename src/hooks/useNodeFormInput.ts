import { useCallback } from "react";

interface UseNodeFormInputProps {
  selectedNode: any;
  currentFormData: Record<string, any>;
  depends_on: any;
  updateNodeFormData: (nodeId: string, formData: Record<string, any>) => void;
  saveFlow: () => void;
  taskID: string;
}

export function useNodeFormInput({
  selectedNode,
  currentFormData,
  depends_on,
  updateNodeFormData,
  saveFlow,
  taskID,
}: UseNodeFormInputProps) {
    
  const handleInputChange = useCallback(
    (key: string, value: any) => {
      if (!selectedNode) return;
      
      updateNodeFormData(selectedNode.id, {
        ...currentFormData,
        task_id: taskID,
        [key]: value,
      });
      
      // Don't call saveFlow here - this causes a continuous loop
      // Let the parent component handle saving at appropriate times
    },
    [selectedNode, currentFormData, depends_on, updateNodeFormData, taskID]
  );

  return handleInputChange;
}
