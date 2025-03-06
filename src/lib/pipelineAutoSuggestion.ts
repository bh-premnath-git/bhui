import { Node, Edge } from 'reactflow';
import { UINode } from "./pipelineJsonConverter";
import { apiService } from './api/api-service';
import { CATALOG_API_PORT } from '@/config/platformenv';

interface LayoutField {
  lyt_fld_name: string;
}

interface LayoutResponse {
  layout_fields: LayoutField[];
}

export const getColumnSuggestions = async ( 
  currentNodeId: string,
  nodes: Node[],
  edges: Edge[]
): Promise<string[]> => {
  try {
    const columns = new Set<string>();
    
    // Get all nodes that feed into the current node
    const getDependentNodes = (nodeId: string): Node[] => {
      const dependentNodes: Node[] = [];
      const incomingEdges = edges.filter(edge => edge.target === nodeId);
      
      for (const edge of incomingEdges) {
        const sourceNode = nodes.find(n => n.id === edge.source);
        if (sourceNode) {
          dependentNodes.push(sourceNode);
          dependentNodes.push(...getDependentNodes(sourceNode.id));
        }
      }
      
      return dependentNodes;
    };

    const dependentNodes = getDependentNodes(currentNodeId);
    const processedNodes = [...dependentNodes].reverse(); // Process in order of execution

    // Process each node to build up available columns
    for (const node of processedNodes) {
      if (node.id.startsWith('Reader_')) {
        // Get columns from API for reader nodes
        const dataSrcId = node.data.source?.data_src_id;
        if (dataSrcId) {
          const response= await apiService.get({
        portNumber: CATALOG_API_PORT,
        url: `/data_source_layout/list_full/?data_src_id=${dataSrcId}`,
        usePrefix: true,
        method: 'GET',
          })
          console.log(response,'response')
          response[0].layout_fields?.forEach((field: LayoutField) => {
            columns.add(field.lyt_fld_name);
          });
        }
      } else {
        // Add columns from transformations
        switch (node.data.label) {
          case 'SchemaTransformation':
            // Add derived fields from schema transformation
            node.data.transformationData?.derived_fields?.forEach((field: { name: string }) => {
              columns.add(field.name);
            });
            break;
            
          case 'Joiner':
            // Add new columns from join expressions
            node.data.transformationData?.expressions?.forEach((expr: { target_column: string }) => {
              columns.add(expr.target_column);
            });
            break;
            
          case 'Drop':
            // Remove dropped columns
            node.data.transformationData?.column_list?.forEach((column: string) => {
              columns.delete(column);
            });
            break;
            
          case 'Select':
            // Keep only selected columns
            if (node.data.transformationData?.column_list?.length > 0) {
              const selectedColumns = new Set(node.data.transformationData.column_list);
              [...columns].forEach(col => {
                if (!selectedColumns.has(col)) {
                  columns.delete(col);
                }
              });
            }
            break;
        }
      }
    }

    return Array.from(columns);
  } catch (error) {
    console.error('Error getting column suggestions:', error);
    return [];
  }
};