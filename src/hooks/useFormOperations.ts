import { useCallback } from 'react';
import { NodeFormData } from '@/types/designer/flow';

export function useFormOperations(
  nodeFormData: NodeFormData[],
  setNodeFormData: React.Dispatch<React.SetStateAction<NodeFormData[]>>
) {
  const updateNodeFormData = useCallback(
    (nodeId: string, newFormData: Record<string, any>) => {
      setNodeFormData((prevData) => {
        const existingIndex = prevData.findIndex(
          (item) => item.nodeId === nodeId
        );
        if (existingIndex !== -1) {
          const newData = [...prevData];
          newData[existingIndex] = {
            nodeId,
            formData: { ...newFormData },
          };
          return newData;
        }
        return [...prevData, { nodeId, formData: { ...newFormData } }];
      });
    },
    [setNodeFormData]
  );

  const getNodeFormData = useCallback(
    (nodeId: string) => {
      return nodeFormData.find((item) => item.nodeId === nodeId)?.formData;
    },
    [nodeFormData]
  );

  return {
    updateNodeFormData,
    getNodeFormData
  };
}