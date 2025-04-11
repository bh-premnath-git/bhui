import { Node, Edge } from 'reactflow';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CATALOG_API_PORT } from '@/config/platformenv';
import axios from 'axios';
import { apiService } from './api/api-service';
import { getNodeIcon, getNodePorts } from './transformationUtils';


// Query keys
export const pipelineKeys = {
    all: ['pipeline'] as const,
    detail: (id: string) => [...pipelineKeys.all, 'detail', id] as const,
    transformationCount: (pipelineName: string) => [...pipelineKeys.all, 'transformationCount', pipelineName] as const,
};

export const useUpdatePipelineMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, pipeline_json }: { id: string; pipeline_json: any }) => {
            if(id){
            const data =await apiService.patch({
                portNumber: CATALOG_API_PORT,
                url: `/pipeline/${id}`,
                usePrefix: true,
                method: 'PATCH',
                data:pipeline_json,
                metadata: {
                    errorMessage: 'Failed to fetch projects'
                },
                    params: {limit: 1000}
                })
                return data;
            }
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: pipelineKeys.detail(id) });
        },
    });
};

export const useTransformationCountQuery = (pipelineName: string) => {
    return useQuery({
        queryKey: pipelineKeys.transformationCount(pipelineName),
        queryFn: async () => {
            const data  = await apiService.get({
                portNumber: CATALOG_API_PORT,
                url: '/pipeline/debug/get_transformation_count',
                usePrefix: true,
                method: 'GET',
                params: { pipeline_name: pipelineName }
            });
            return data;
        },
    });
};

export interface UINode extends Node {
    type: string;
    position: { x: number; y: number };
    data: {
        label: string;
        icon: string;
        ports: {
            inputs: number;
            outputs: number;
            maxInputs: number;
        };
        transformationType: string;
        transformationData: any;
        source?: any;
        title?: string;
    };
}

const generateUniqueTitle = (type: string, existingTitles: Set<string>): string => {
    let counter = 1;
    let title = type;
    
    while (existingTitles.has(title)) {
        title = `${type}${counter}`;
        counter++;
    }
    
    existingTitles.add(title);
    return title;
};



export const convertPipelineToUIJson = async (pipelineJson: any, handleSourceUpdate: (sourceData: any) => void) => {
    const nodes: any[] = [];
    const edges: any[] = [];
    let xPosition = 50;
    let yPosition = 100;
    const yOffset = -117;
    console.log(pipelineJson, "pipelineJson");
    
    // Track existing titles to ensure uniqueness
    const existingTitles = new Set<string>();
    console.log(pipelineJson);

    // Helper function to resolve references
    const resolveRef = (ref: string) => {
        if (!ref || typeof ref !== 'string' || !ref.startsWith('#/')) return null;
        
        const path = ref.substring(2).split('/');
        let result = pipelineJson;
        
        for (const segment of path) {
            if (result && result[segment] !== undefined) {
                result = result[segment];
            } else {
                return null;
            }
        }
        
        return result;
    };

    // Process readers first - sources is now an object, not an array
    const sources = pipelineJson.sources || {};
    let sourceIndex = 0;
    
    for (const sourceKey in sources) {
        try {
            const source = sources[sourceKey];
            
            // Resolve connection reference if it exists
            let connection = source.connection;
            if (connection && connection.$ref) {
                connection = resolveRef(connection.$ref);
            }
            
            // Merge connection data with source
            const sourceWithConnection = {
                ...source,
                connection: connection
            };
            
            const sourceDetails: any = await apiService.get({
                portNumber: CATALOG_API_PORT,
                url: `/data_source/${source.data_src_id || ''}`,
                usePrefix: true,
                method: 'GET',
                metadata: {
                    errorMessage: 'Failed to fetch source details'
                },
            });
            
            if (handleSourceUpdate) {
                const nodeId = `Reader_${sourceIndex + 1}`;
                const sourceData = {
                    nodeId,
                    sourceData: {
                        data: {
                            label: source.name || sourceDetails.data_src_name,
                            source: {
                                "name": source.name || sourceDetails.data_src_name,
                                "data_src_desc": source.name || sourceDetails.name,
                                "reader_name": source.reader_name || sourceDetails.data_src_name,
                                "source_type": source.source_type || sourceDetails.connection_type,
                                "file_name": source.file_name || sourceDetails.file_name,
                                "data_src_id": source.data_src_id || sourceDetails.data_src_id,
                                "project_id": sourceDetails.bh_project_id,
                                "file_path_prefix": connection?.file_path_prefix || sourceDetails.connection?.file_path_prefix,
                                "file_type": connection?.file_type || sourceDetails.file_type,
                                "connection_config_id": connection?.connection_config_id || sourceDetails?.connection_config_id,
                                "table_name": source.table_name || sourceDetails.table_name,
                                "connection_config": { custom_metadata: connection || sourceDetails?.connection_config?.custom_metadata },
                                "connection": connection || sourceDetails?.connection_config?.custom_metadata
                            }
                        }
                    }
                };
                
                handleSourceUpdate(sourceData);
            }
            
            const title = source.name;
            existingTitles.add(title);
            
            nodes.push({
                id: `Reader_${sourceIndex + 1}`,
                type: 'custom',
                position: {
                    x: xPosition,
                    y: sourceIndex === 0 ? yPosition : yPosition + yOffset
                },
                data: {
                    label: 'Reader',
                    title: title,
                    icon: getNodeIcon('Reader'),
                    ports: getNodePorts('Reader'),
                    source: {
                        "name": source.name || sourceDetails.data_src_name,
                        "data_src_desc": source.name || sourceDetails.name,
                        "reader_name": source.reader_name || sourceDetails.data_src_name,
                        "source_type": source.source_type || sourceDetails.connection_type,
                        "file_name": source.file_name || sourceDetails.file_name,
                        "data_src_id": source.data_src_id || sourceDetails.data_src_id,
                        "project_id": sourceDetails.bh_project_id,
                        "file_path_prefix": connection?.file_path_prefix || sourceDetails.connection?.file_path_prefix,
                        "file_type": connection?.file_type || sourceDetails.file_type,
                        "connection_config_id": connection?.connection_config_id || sourceDetails?.connection_config_id,
                        "table_name": source.table_name || sourceDetails.table_name,
                        "connection_config": { custom_metadata: connection || sourceDetails?.connection_config?.custom_metadata },
                        "connection": connection || sourceDetails?.connection_config?.custom_metadata
                    }
                },
                width: 56,
                height: 72
            });
            
            sourceIndex++;
        } catch (error) {
            console.error(`Error fetching source details for ${sourceKey}:`, error);
        }
    }

    // Process transformations
    xPosition += 130;
    const transformationNodes = new Map<string, string>(); // Map transformation names to node IDs

    for (const transform of pipelineJson.transformations) {
        if (transform.transformation === 'Reader' || transform.transformation === 'Target' || transform.transformation === 'Writer') continue;

        const type = transform.transformation;
        const nodeId = `${type}_${nodes.length + 1}`;
        
        // Use the original transformation name if it exists
        const nodeTitle = transform.name || generateUniqueTitle(type, existingTitles);
        transformationNodes.set(transform.name, nodeId);

        nodes.push({
            id: nodeId,
            type: 'custom',
            position: { x: xPosition, y: yPosition },
            data: {
                label: type,
                title: nodeTitle, // Use the preserved name
                icon: getNodeIcon(type),
                ports: getNodePorts(type),
                transformationType: type,
                transformationData: {
                    ...transform,
                    name: nodeTitle // Ensure the name is preserved in transformation data
                }
            },
            width: 56,
            height: 72
        });

        // Create edges based on dependencies
        if (transform.dependent_on) {
            await transform.dependent_on.forEach((dependentName: string, index: number) => {
                const sourceNodeId = [...nodes].reverse().find(
                    node => node.data.title === dependentName
                )?.id;
                console.log(sourceNodeId);

                if (sourceNodeId) {
                    edges.push({
                        source: sourceNodeId,
                        sourceHandle: 'output-0',
                        target: nodeId,
                        targetHandle: `input-${index}`,
                        id: `reactflow__edge-${sourceNodeId}output-0-${nodeId}input-${index}`
                    });
                }
            });
        }

        xPosition += 130;
    }

    // Add target nodes - targets is now an object, not an array
    const targets = pipelineJson.targets || {};
    
    if (Object.keys(targets).length > 0) {
        const targetId = 'Target_1';
        const targetTitle = generateUniqueTitle('Target', existingTitles);
        
        // Find the writer transformation or target transformation
        const writerTransformation = pipelineJson.transformations.find(
            (t: any) => t.transformation === 'Writer' || t.transformation === 'Target'
        );
        
        if (writerTransformation) {
            // Resolve target reference if it exists
            let targetData = writerTransformation.target || writerTransformation;
            if (targetData && targetData.$ref) {
                targetData = resolveRef(targetData.$ref);
            }
            
            // Resolve connection reference if it exists
            let connection = targetData?.connection;
            if (connection && connection.$ref) {
                connection = resolveRef(connection.$ref);
            }
            
            console.log(writerTransformation, "writerTransformation");
            
            nodes.push({
                id: targetId,
                type: 'custom',
                position: { x: xPosition, y: yPosition },
                data: {
                    label: 'Target',
                    title: targetData?.name || targetTitle,
                    icon: getNodeIcon('Target'),
                    ports: getNodePorts('Target'),
                    source: {
                        name: targetData?.name || 'output',
                        target_type: connection?.connection_type === "PostgreSQL" ? 'Relational' : targetData?.target_type || 'File',
                        target_name: targetData?.target_name || 'output',
                        table_name: targetData?.table_name,
                        connection: {
                            name: connection?.name || 'local_connection',
                            connection_type: connection?.connection_type || 'Local',
                            file_path_prefix: connection?.file_path_prefix || '${output_file}',
                            connection_config_id: connection?.connection_config_id,
                            database: connection?.database,
                            schema: connection?.schema,
                            secret_name: connection?.secret_name,
                        },
                        file_name: targetData?.file_name || 'output.csv',
                        load_mode: targetData?.load_mode,
                        file_type: targetData?.file_type
                    },
                    transformationData: {
                        write_options: writerTransformation.write_options || {
                            header: true,
                            sep: '|'
                        },
                        file_type: writerTransformation.file_type || 'csv'
                    }
                },
                width: 56,
                height: 72
            });

            // Connect last transformation to target
            const lastTransformation = nodes[nodes.length - 2];
            if (lastTransformation) {
                edges.push({
                    source: lastTransformation.id,
                    sourceHandle: 'output-0',
                    target: targetId,
                    targetHandle: 'input-0',
                    id: `reactflow__edge-${lastTransformation.id}output-0-${targetId}input-0`
                });
            }
        }
    }

    return await { nodes, edges };
};

/**
 * Converts the current pipeline JSON format to the optimized format with references
 * @param currentJson The current pipeline JSON
 * @returns The optimized pipeline JSON with references
 */
export const convertToOptimizedPipelineJson = (currentJson: any) => {
  console.log(currentJson,"currentJson");
  // Create the base structure for the optimized JSON
  const optimizedJson: any = {
    $schema: currentJson.$schema || "https://json-schema.org/draft-07/schema#",
    name: currentJson.name || "pipeline",
    description: currentJson.description || "",
    version: currentJson.version || "1.0",
    mode: currentJson.mode || "ENGINE",
    parameters: currentJson.parameters || [],
    connections: {},
    sources: {},
    targets: {},
    transformations: []
  };

  // Extract and organize connections
  const connections: Record<string, any> = {};
  
  // Process sources and their connections
  if (Array.isArray(currentJson.sources)) {
    currentJson.sources.forEach((source: any, index: number) => {
      const connectionKey = `${source.name}`;
      
      // Add connection to connections section
      if (source.connection) {
        connections[connectionKey] = {
          ...source.connection,
          name: source.connection.name || connectionKey
        };
      }
      
      // Add source to sources section with reference to connection
      optimizedJson.sources[source.name] = {
        name: source.name,
        source_type: source.source_type,
        table_name: source.table_name,
        data_src_id: source.data_src_id,
        file_name: source.file_name || undefined
      };
      
      // Add connection reference if it exists
      if (source.connection) {
        optimizedJson.sources[source.name].connection = { 
          $ref: `#/connections/${connectionKey}` 
        };
      }
    });
  }
  
  // Process targets and their connections
  if (Array.isArray(currentJson.targets)) {
    currentJson.targets.forEach((target: any, index: number) => {
      const targetKey = target.name || 'target' + index;
      const connectionKey = `${targetKey}`;
      
      // Add connection to connections section
      if (target.connection) {
        connections[connectionKey] = {
          ...target.connection,
          name: target.connection.name || connectionKey
        };
      }
      console.log(target)
      // Add target to targets section with reference to connection
      optimizedJson.targets[targetKey] = {
        name: target.name || targetKey,
        target_type: target?.connection?.connection_type?.toLowerCase()=='local'||target?.connection?.connection_type?.toLowerCase()=='s3' ? 'File' : 'Relational',
        target_name: target.target_name,
        table_name: target.table_name|| target.name || targetKey,
        load_mode: target.load_mode || 'append',
        file_name: target.file_name
      };
      
      // Add connection reference if it exists
      if (target.connection) {
        optimizedJson.targets[targetKey].connection = { 
          $ref: `#/connections/${connectionKey}` 
        };
      }
    });
  }
  
  // Process transformations to extract targets if they're embedded there
  if (Array.isArray(currentJson.transformations)) {
    currentJson.transformations.forEach((transform: any) => {
      // Extract targets from Writer transformations if they're not already in the targets section
      if ((transform.transformation === 'Writer' || transform.transformation === 'Target') && transform.target) {
        const targetKey = transform.target.name || 'target';
        const connectionKey = `${targetKey}`;
        
        // Only add if not already present
        if (!optimizedJson.targets[targetKey]) {
          // Add connection to connections section if it exists
          if (transform.target.connection) {
            connections[connectionKey] = {
              ...transform.target.connection,
              name: transform.target.connection.name || connectionKey
            };
          }
          console.log(transform)
          // Add target to targets section
          optimizedJson.targets[targetKey] = {
            name: transform.target.name || targetKey,
            target_type: transform.target?.connection?.connection_type?.toLowerCase()=='local'||transform.target?.connection?.connection_type?.toLowerCase()=='s3' ? 'File' : 'Relational',
            target_name: transform.target.target_name,
            table_name: transform.target.table_name,
            load_mode: transform.target.load_mode || 'append',
            file_name: transform.target.file_name
          };
          
          // Add connection reference if it exists
          if (transform.target.connection) {
            optimizedJson.targets[targetKey].connection = { 
              $ref: `#/connections/${connectionKey}` 
            };
          }
        }
      }
    });
  }
  
  // Add all connections to the optimized JSON
  optimizedJson.connections = connections;
  
  // Process transformations
  if (Array.isArray(currentJson.transformations)) {
    currentJson.transformations.forEach((transform: any) => {
      const transformCopy = { ...transform };
      
      // For Reader transformations, replace source with reference
      if (transform.transformation === 'Reader' && transform.source) {
        const sourceName = transform.source.name;
        if (optimizedJson.sources[sourceName]) {
          transformCopy.source = { $ref: `#/sources/${sourceName}` };
        }
      }
      
      // For Writer transformations, replace target with reference
      if ((transform.transformation === 'Writer' || transform.transformation === 'Target') && transform.target) {
        const targetName = transform.target.name || 'target';
        if (optimizedJson.targets[targetName]) {
          transformCopy.target = { $ref: `#/targets/${targetName}` };
        }
      }
      
      optimizedJson.transformations.push(transformCopy);
    });
  }
  
  return optimizedJson;
};



export const resolveRefs = (obj:any, root:any) => {
    if (typeof obj !== "object" || obj === null) return obj;
  
    if (Array.isArray(obj)) {
      return obj.map((item:any) => resolveRefs(item, root));
    }
  
    if (obj.$ref) {
      const refPath = obj.$ref.replace("#/", "").split("/");
      let resolved = root;
  
      for (const key of refPath) {
        resolved = resolved[key];
        if (!resolved) {
          console.error("Invalid $ref:", obj.$ref);
          return obj; // Return as is if reference is broken
        }
      }
      return resolveRefs(resolved, root); // Recursively resolve further
    }
  
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, resolveRefs(value, root)])
    );
  };