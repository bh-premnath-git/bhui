import { flowSchema as schema } from "@bh-ai/schemas";
import { convertLiteralStrings } from "./formUtils";
import { updateFlowDefinition } from "@/store/slices/designer/flowSlice";
import { usePipelineContext } from "@/context/designers/DataPipelineContext";

/**
 * Updates the flow definition on the server
 */
export const updateFlowDefinitionOnServer = (
  selectedFlowId: string | null,
  selectedFlow: any,
  dispatch: any,
  flowConfigMap: Record<string, any>,
  nodeFormData: any[],
  nodes?: any[],
  edges?: any[]
) => {
  console.log("Inside updateFlowDefinitionOnServer", nodeFormData);
  console.log(nodes, "curr")

  if (!selectedFlowId || !selectedFlow?.flow_id) {
    console.error('Missing required flow data:', { selectedFlowId, selectedFlow });
    return;
  }

  const raw = localStorage.getItem(`flow-${selectedFlowId}`);
  if (!raw) {
    console.error('No flow data found in localStorage for ID:', selectedFlowId);
    return;
  }

  let flowStructure: any = JSON.parse(raw);
  delete flowStructure.nodes; // Remove flow_id from flowStructure
  delete flowStructure.edges; // Remove flow_id from flowStructure
  // flowStructure.nodes = nodes || flowStructure.nodes || [];
  // flowStructure.edges = edges || flowStructure.edges || [];
  flowStructure.nodeFormData = nodeFormData || flowStructure.nodeFormData || [];
  const formData = nodeFormData.length
    ? nodeFormData
    : flowStructure.nodeFormData;
  if (!formData?.length) {
    console.error('No form data available:', { nodeFormData, flowStructure });
    return;
  }

  // Log form data for debugging
  console.log("Processing form data:", formData);

  const tasksList = formData.map((item: any) => {
    const copy = JSON.parse(JSON.stringify(item.formData));
    if (!Array.isArray(copy.parameters)) copy.parameters = [];
    return convertLiteralStrings(copy);
  });
  let tasks = [];
  console.log("Processing form data:", tasks);
  console.log("Processing form data:", nodes);

  // let currentTaskList=tasks.map((task: any) => {
  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < tasksList.length; j++) {
      if (tasksList[j].task_id === nodes[i].data?.formData?.task_id) {
        tasks.push(tasksList[j]);
        break; // Exit inner loop once a match is found
      }
    }
  }
  console.log(tasks, "currentTaskList");
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
    flow_json: { flowJson }
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