import { flowSchema as schema } from "@bh-ai/schemas";
import { convertLiteralStrings } from "./formUtils";
import { updateFlowDefinition } from "@/store/slices/designer/flowSlice";
import { usePipelineContext } from "@/context/designers/DataPipelineContext";
import { flow } from "lodash";

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
  edges?: any[],
  currentFlow: any = null
) => {
  console.log("Inside updateFlowDefinitionOnServer", nodeFormData);
  console.log(selectedFlow, "curr")

  if (!selectedFlowId || !selectedFlow?.flow_id) {
    console.error('Missing required flow data:', { selectedFlowId, selectedFlow });
    return;
  }

  const raw = localStorage.getItem(`flow-${selectedFlowId}`);
  console.log(raw, "raw")
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
  console.log("Processing form data:", nodes);
  console.log("Processing form data:", currentFlow);

  // Create a map of node IDs to task IDs for quick lookup
  const nodeIdToTaskIdMap = new Map();
  for (const item of formData) {
    if (item.nodeId && item.formData && item.formData.task_id) {
      nodeIdToTaskIdMap.set(item.nodeId, item.formData.task_id);
    }
  }

  // Also add task_ids from nodes data as a fallback
  if (nodes && nodes.length > 0) {
    for (const node of nodes) {
      if (node.id && node.data?.formData?.task_id && !nodeIdToTaskIdMap.has(node.id)) {
        nodeIdToTaskIdMap.set(node.id, node.data.formData.task_id);
      }
    }
  }

  console.log("Node ID to Task ID Map:", Object.fromEntries(nodeIdToTaskIdMap));

  // Create a map of node dependencies based on edges
  const nodeDependencies = new Map();
  if (edges && edges.length > 0) {
    console.log("Processing edges for dependencies:", edges);

    for (const edge of edges) {
      console.log(`Processing edge: source=${edge.source}, target=${edge.target}`);

      if (!nodeDependencies.has(edge.target)) {
        nodeDependencies.set(edge.target, []);
      }

      if (nodeIdToTaskIdMap.has(edge.source)) {
        const sourceTaskId = nodeIdToTaskIdMap.get(edge.source);
        console.log(`Adding dependency: ${edge.target} depends on ${sourceTaskId}`);
        nodeDependencies.get(edge.target).push(sourceTaskId);
      } else {
        console.log(`Warning: Could not find task_id for source node ${edge.source}`);
      }
    }
  }

  console.log("Node Dependencies Map:", Object.fromEntries([...nodeDependencies.entries()].map(
    ([k, v]) => [k, v]
  )));

  // Process tasks with updated dependencies
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const nodeId = node.id;
    const nodeTaskId = node.data?.formData?.task_id;

    console.log(`Processing node ${nodeId} with task_id ${nodeTaskId}`);

    // Find the corresponding task in tasksList
    const taskIndex = tasksList.findIndex(task => task.task_id === nodeTaskId);

    if (taskIndex === -1) {
      console.log(`Warning: No task found for node ${nodeId} with task_id ${nodeTaskId}`);
      continue;
    }

    const taskCopy = { ...tasksList[taskIndex] };
    console.log(`Found task:`, taskCopy);

    // Update depends_on based on the edges
    if (nodeDependencies.has(nodeId)) {
      console.log(`Node ${nodeId} has dependencies`);

      // Get the task_ids of the nodes this node depends on
      const dependsOnTaskIds = nodeDependencies.get(nodeId);
      console.log(`Node depends on task_ids:`, dependsOnTaskIds);

      // Set the depends_on property with the task_ids from the dependencies map
      taskCopy.depends_on = dependsOnTaskIds;
      console.log(`Updated task depends_on:`, taskCopy.depends_on);
    } else {
      // If no dependencies found in the edges, keep existing or set to empty array
      taskCopy.depends_on = taskCopy.depends_on || [];
      console.log(`No dependencies for node ${nodeId}, using:`, taskCopy.depends_on);
    }
    console.log(taskCopy, "***************")
    if (taskCopy.task_id.toLowerCase().includes('emraddstepsoperator') || taskCopy.task_id.toLowerCase().includes('emrterminatejobflowoperator')) {
      delete taskCopy.parameters;
    } else {
      // Create a set of parameter keys for quick lookup
      const parameterKeys = new Set(taskCopy.parameters.map((param: { key: string }) => param.key));

      // Iterate over the keys of taskCopy and delete those that are in parameterKeys
      for (const key of Object.keys(taskCopy)) {
        if (parameterKeys.has(key)) {
          delete taskCopy[key];
        }
      }
    }

    tasks.push(taskCopy);


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

  // Final validation of tasks to ensure depends_on is properly set
  for (const task of tasks) {
    // Make sure depends_on is always an array
    if (!Array.isArray(task.depends_on)) {
      if (task.depends_on === null || task.depends_on === undefined) {
        task.depends_on = [];
      } else if (typeof task.depends_on === 'string') {
        // If it's a string, convert to array
        task.depends_on = [task.depends_on];
      } else {
        // For any other type, set to empty array
        console.warn(`Invalid depends_on for task ${task.task_id}:`, task.depends_on);
        task.depends_on = [];
      }
    }

    // Filter out any null, undefined or empty string values
    task.depends_on = task.depends_on.filter(dep => dep && dep.trim() !== '');

    console.log(`Final depends_on for task ${task.task_id}:`, task.depends_on);
  }

  const flowJson = {
    $schema: schema["$schema"],
    name: selectedFlow?.flow_name || "Unnamed Flow",
    flow_name: selectedFlow?.flow_name || "Unnamed Flow",
    flow_id: selectedFlow?.flow_id || selectedFlowId,
    flow_type: selectedFlow?.flow_type || "INGESTION",
    flow_key: selectedFlow.flow_key,
    description: `Flow for ${selectedFlow?.flow_name || "Unnamed Flow"}`,
    version: schema.schemaVersion || "1.0.0",
    project_id: currentFlow?.bh_project_id || 2,
    project_name: currentFlow?.bh_project_name || "Default Project",
    cron_expression: selectedFlow?.cron_expression || null,
    flow_tags: selectedFlow?.flow_tags || [],
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