import schema from "@bh-ai/flow-schema";
import { convertLiteralStrings } from "./formUtils";

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
  if (!selectedFlowId || !selectedFlow?.flow_id) return;

  const raw = localStorage.getItem(`flow-${selectedFlowId}`);
  if (!raw) return;

  const flowStructure = JSON.parse(raw);
  const formData = nodeFormData.length
    ? nodeFormData
    : flowStructure.nodeFormData;
  if (!formData?.length) return;

  const tasks = formData.map((item: any) => {
    const copy = JSON.parse(JSON.stringify(item.formData));
    if (!Array.isArray(copy.parameters)) copy.parameters = [];
    return convertLiteralStrings(copy);
  });

  const flowJson = {
    $schema: schema["$schema"],
    description: `Flow for ${selectedFlow?.flow_name || "Unnamed Flow"}`,
    name: selectedFlow?.flow_name || "Unnamed Flow",
    version: schema.schemaVersion || "1.0.0", // Using schemaVersion as fallback
    parameters: flowConfigMap?.flowconfig?.flow_config || [],
    tasks,
  };

  dispatch({
    type: "designer/updateFlowDefinition", // or your slice action
    payload: {
      flow_id: String(selectedFlow.flow_id),
      flow_json: {
        flow_deployment_id:
          selectedFlow.flow_deployment?.[0]?.flow_deployment_id,
        flow_id: String(selectedFlow.flow_id),
        flow_json: { flowJson, flowStructure },
      },
    },
  });
}; 