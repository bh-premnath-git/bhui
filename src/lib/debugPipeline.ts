/**
 * Debug helper for pipeline data flow issues
 */

export const debugNodeData = (nodes: any[], message = "Current nodes:") => {
  console.group(message);
  nodes.forEach(node => {
    console.log(`Node ${node.id} (${node.data.label}):`, {
      title: node.data.title,
      label: node.data.label,
      hasTransformationData: !!node.data.transformationData,
      transformationData: node.data.transformationData,
      fullData: node.data
    });
  });
  console.groupEnd();
};

export const debugFormStates = (formStates: Record<string, any>, message = "Current form states:") => {
  console.group(message);
  Object.entries(formStates).forEach(([nodeId, state]) => {
    console.log(`Form state for ${nodeId}:`, state);
  });
  console.groupEnd();
};

export const validateNodeTransformationData = (nodes: any[]) => {
  const issues: string[] = [];
  
  nodes.forEach(node => {
    if (node.id.startsWith('Reader_') || node.id.startsWith('Target_')) {
      return; // Skip reader and target nodes
    }
    
    if (!node.data.transformationData) {
      issues.push(`Node ${node.id} (${node.data.label}) is missing transformationData`);
    } else {
      // Check for common required fields based on transformation type
      switch (node.data.label) {
        case 'Filter':
          if (!node.data.transformationData.condition) {
            issues.push(`Filter node ${node.id} is missing condition`);
          }
          break;
        case 'SchemaTransformation':
          if (!node.data.transformationData.derived_fields || node.data.transformationData.derived_fields.length === 0) {
            issues.push(`SchemaTransformation node ${node.id} is missing derived_fields`);
          }
          break;
        case 'Joiner':
          if (!node.data.transformationData.conditions || node.data.transformationData.conditions.length === 0) {
            issues.push(`Joiner node ${node.id} is missing join conditions`);
          }
          break;
      }
    }
  });
  
  if (issues.length > 0) {
    console.group("⚠️ Pipeline validation issues:");
    issues.forEach(issue => console.warn(issue));
    console.groupEnd();
  } else {
    console.log("✅ All nodes have proper transformation data");
  }
  
  return issues;
};

export const compareBeforeAfterSubmit = (nodesBefore: any[], nodesAfter: any[], nodeId: string) => {
  const nodeBefore = nodesBefore.find(n => n.id === nodeId);
  const nodeAfter = nodesAfter.find(n => n.id === nodeId);
  
  console.group(`🔍 Node ${nodeId} comparison:`);
  console.log("Before:", nodeBefore?.data);
  console.log("After:", nodeAfter?.data);
  console.log("TransformationData before:", nodeBefore?.data?.transformationData);
  console.log("TransformationData after:", nodeAfter?.data?.transformationData);
  console.groupEnd();
};