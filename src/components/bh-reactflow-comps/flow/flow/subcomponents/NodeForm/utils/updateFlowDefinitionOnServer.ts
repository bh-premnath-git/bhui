import schema from "@bh-ai/flow-schema";
import { convertLiteralStrings } from "./formUtils";
import { updateFlowDefinition } from "@/store/slices/designer/flowSlice";

/**
 * Updates the flow definition on the server
 */
export const updateFlowDefinitionOnServer = (
  selectedFlowId: string | null,
  selectedFlow: any,
  dispatch: any,
  flowConfigMap: Record<string, any>,
  nodeFormData: any[]
) => {
  console.log("Inside updateFlowDefinitionOnServer");
  
  if (!selectedFlowId || !selectedFlow?.flow_id) {
    console.error('Missing required flow data:', { selectedFlowId, selectedFlow });
    return;
  }

  const raw = localStorage.getItem(`flow-${selectedFlowId}`);
  if (!raw) {
    console.error('No flow data found in localStorage for ID:', selectedFlowId);
    return;
  }

  const flowStructure = JSON.parse(raw);
  const formData = nodeFormData.length
    ? nodeFormData
    : flowStructure.nodeFormData;
  if (!formData?.length) {
    console.error('No form data available:', { nodeFormData, flowStructure });
    return;
  }

  // Log form data for debugging
  console.log("Processing form data:", formData);

  const tasks = formData.map((item: any) => {
    const copy = JSON.parse(JSON.stringify(item.formData));
    if (!Array.isArray(copy.parameters)) copy.parameters = [];
    return convertLiteralStrings(copy);
  });

  // Get flow config parameters safely
  let parameters = [];
  try {
    if (flowConfigMap && 
        typeof flowConfigMap === 'object' && 
        flowConfigMap.flowconfig && 
        typeof flowConfigMap.flowconfig === 'object' && 
        flowConfigMap.flowconfig.flow_config) {
      parameters = flowConfigMap.flowconfig.flow_config;
    }
  } catch (error) {
    console.error("Error accessing flow config:", error);
  }

  const flowJson = {
    $schema: schema["$schema"],
    description: `Flow for ${selectedFlow?.flow_name || "Unnamed Flow"}`,
    name: selectedFlow?.flow_name || "Unnamed Flow",
    version: schema.schemaVersion || "1.0.0",
    flow_key: selectedFlow.flow_key,
    parameters: parameters,
    tasks,
  };

  // Create the full payload with the required structure
  const flowDefinitionPayload = {
    flow_id: String(selectedFlow.flow_id),
    flow_json: { flowJson, flowStructure }
  };

  // Log the full payload being sent
  console.log('Complete update flow definition payload:', {
    flow_id: selectedFlow.flow_id,
    flow_json: flowDefinitionPayload
  });

  try {
    console.log("Dispatching updateFlowDefinition action");
    // Use the imported action creator with the correct payload structure
    dispatch(updateFlowDefinition({
      flow_id: String(selectedFlow.flow_id),
      flow_json: flowDefinitionPayload
    }));
    console.log("Action dispatched successfully");
  } catch (error) {
    console.error("Error dispatching action:", error);
  }
}; 