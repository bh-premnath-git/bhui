import { Node, Edge } from '@xyflow/react';
import { UINode } from "./pipelineJsonConverter";
import { apiService } from './api/api-service';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface LayoutField {
  lyt_fld_name: string;
}

// Add a cache for API responses
const layoutFieldsCache = new Map<string, LayoutField[]>();

async function fetchLayoutFields(dataSrcId: string): Promise<LayoutField[]> {
  // Check cache first
  if (layoutFieldsCache.has(dataSrcId)) {
    return layoutFieldsCache.get(dataSrcId)!;
  }

  // If not in cache, fetch from API
  const response = await apiService.get({
    baseUrl: CATALOG_REMOTE_API_URL,
    url: `/data_source_layout/list_full/?data_src_id=${dataSrcId}`,
    usePrefix: true,
    method: 'GET',
  });

  const layoutFields = response[0]?.layout_fields || [];
  // Store in cache
  layoutFieldsCache.set(dataSrcId, layoutFields);
  return layoutFields;
}

// New function to get columns for a specific data source
export const getColumnsForDataSource = async (dataSrcId: string): Promise<string[]> => {
  try {
    if (!dataSrcId) {
      return [];
    }
    
    const layoutFields = await fetchLayoutFields(dataSrcId);
    return layoutFields.map((field: LayoutField) => field.lyt_fld_name);
  } catch (error) {
    console.error('Error getting columns for data source:', error);
    return [];
  }
};

export const getColumnSuggestions = async ( 
  currentNodeId: string,
  nodes: Node[],
  edges: Edge[],
  pipelineDtl?:any
): Promise<string[]> => {

  try {
    console.log(pipelineDtl)
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

    // Find the current node first
    const currentNode = nodes.find(n => n.id === currentNodeId);
    if (currentNode?.id.startsWith('Reader_')) {
      const dataSrcId = (currentNode.data.source as any)?.data_src_id;
      if (dataSrcId) {
        const layoutFields = await fetchLayoutFields(dataSrcId);
        layoutFields.forEach((field: LayoutField) => {
          columns.add(field.lyt_fld_name);
        });
      }
    }

    // Process dependent nodes only if not a Reader
    if (!currentNode?.id.startsWith('Reader_')) {
      const dependentNodes = getDependentNodes(currentNodeId);
      const processedNodes = [...dependentNodes].reverse();

      // Process each node to build up available columns
      for (const node of processedNodes) {
        if (node.id.startsWith('Reader_')) {
          const dataSrcId = (node.data.source as any)?.data_src_id;
          if (dataSrcId) {
            const layoutFields = await fetchLayoutFields(dataSrcId);
            layoutFields.forEach((field: LayoutField) => {
              columns.add(field.lyt_fld_name);
            });
          }
        } else {
          // Add columns from transformations
          switch (node.data.label) {
            case 'SchemaTransformation':
              // Add derived fields from schema transformation
              (node.data.transformationData as any )?.derived_fields?.forEach((field: { name: string }) => {
                columns.add(field.name);
              });
              break;
              
            case 'Joiner':
              // Add new columns from join expressions
              (node.data.transformationData as any)?.expressions?.forEach((expr: { target_column: string }) => {
                columns.add(expr.target_column);
              });
              break;
              
            case 'Drop':
              // Remove dropped columns
              (node.data.transformationData as any)?.column_list?.forEach((column: string) => {
                columns.delete(column);
              });
              break;
              
            case 'Select':
              // Keep only selected columns
              if ((node.data.transformationData as any)?.column_list?.length > 0) {
                const selectedColumns = new Set((node.data.transformationData as any)?.column_list);
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
    }

    const columnArray = Array.from(columns);
    
    // If no columns found and no nodes exist, provide some sample columns for testing
    if (columnArray.length === 0 && nodes.length === 0) {
      console.log('🔍 No columns found and no nodes exist, providing sample columns');
      return ['id', 'name', 'email', 'created_at', 'updated_at', 'status', 'category', 'amount', 'description'];
    }
    
    return columnArray;
  } catch (error) {
    console.error('Error getting column suggestions:', error);
    // Provide sample columns even on error for testing purposes
    return ['id', 'name', 'email', 'created_at', 'updated_at', 'status'];
  }
};