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



export const convertPipelineToUIJson = async (pipelineJson: any) => {
    const nodes: any[] = [];
    const edges: any[] = [];
    let xPosition = 50;
    let yPosition = 100;
    const yOffset = -117;
    
    // Track existing titles to ensure uniqueness
    const existingTitles = new Set<string>();

    // Process readers first
    for (const [index, source] of pipelineJson.sources.entries()) {
        try {
            const sourceDetails:any = await apiService.get({
                portNumber: CATALOG_API_PORT,
                url: `/data_source/${source.data_src_id}`,
                usePrefix: true,
                method: 'GET',
                metadata: {
                    errorMessage: 'Failed to fetch source details'
                },
            })
          
            console.log(sourceDetails)
console.log(pipelineJson.sources)
let updatedDetails=pipelineJson.sources?.find(item=>item.data_src_id===sourceDetails.data_src_id);
console.log(updatedDetails,"updatedDetails")
            const nodeId = `Reader_${index + 1}`;
            const title = source.name;
            existingTitles.add(title);
            nodes.push({
                id: nodeId,
                type: 'custom',
                position: {
                    x: xPosition,
                    y: index === 0 ? yPosition : yPosition + yOffset
                },
                data: {
                    label: 'Reader',
                    title: title,
                    icon: getNodeIcon('Reader'),
                    ports: getNodePorts('Reader'),
                    source:{
                        "name": updatedDetails.name??sourceDetails.data_src_name,
                        "data_src_desc": updatedDetails.name??sourceDetails.name,
                        "reader_name": updatedDetails.reader_name??sourceDetails.data_src_name,
                        "source_type": sourceDetails.connection_type,
                        "file_name": updatedDetails.file_name??sourceDetails.file_name,
                        "data_src_id": updatedDetails.data_src_id??sourceDetails.data_src_id,
                        "project_id": sourceDetails.bh_project_id,
                        "file_path_prefix": updatedDetails.connection?.file_path_prefix??sourceDetails.connection?.file_path_prefix,
                        "file_type": updatedDetails.connection?.file_type??sourceDetails.file_type,
                        "connection_config_id": updatedDetails.connection?.connection_config_id??sourceDetails?.connection_config_id,
                        "table_name": updatedDetails.table_name??sourceDetails.table_name,
                        "connection": {
                            "name": updatedDetails.connection?.name??sourceDetails.connection?.name,
                            "connection_type": updatedDetails?.connection?.connection_type??sourceDetails.connection?.connection_type,
                            "connection_name": updatedDetails.connection?.name??sourceDetails.connection?.name,
                            "file_type": updatedDetails.connection?.file_type??sourceDetails.file_type,
                            "file_path_prefix": updatedDetails.connection?.file_path_prefix??sourceDetails.connection?.file_path_prefix,
                            "connection_config_id": updatedDetails.connection?.connection_config_id??sourceDetails.connection?.connection_config_id,
                            "table_name": updatedDetails.table_name??sourceDetails.table_name,
                            "database": updatedDetails.connection?.database??sourceDetails.connection?.database,
                            "schema": updatedDetails.connection?.schema??sourceDetails.connection?.schema,
                            "secret_name": updatedDetails.connection?.secret_name??sourceDetails.connection?.secret_name,
                        }
                    }
                },
                width: 56,
                height: 72
            });
        } catch (error) {
            console.error(`Error fetching source details for ${source.name}:`, error);
        }
    }

    // Process transformations
    xPosition += 130;
    const transformationNodes = new Map<string, string>(); // Map transformation names to node IDs

    for (const transform of pipelineJson.transformations) {
        if (transform.transformation === 'Reader'||transform.transformation==="Target") continue;

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
            transform.dependent_on.forEach((dependentName: string, index: number) => {
                const sourceNodeId = [...nodes].reverse().find(
                    node => node.data.title === dependentName
                )?.id;
                console.log(sourceNodeId)

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

    // Add target nodes
    if (pipelineJson.targets && pipelineJson.targets.length > 0) {
        const targetId = 'Target_1';
        const targetTitle = generateUniqueTitle('Target', existingTitles);
        
        // Find the target transformation
        const targetTransformation = pipelineJson.transformations.find(
            (t: any) => t.transformation === 'Target'
        );
        if (targetTransformation) {
            console.log(targetTransformation)
            console.log( targetTransformation?.target?.target_type )

            nodes.push({
                id: targetId,
                type: 'custom',
                position: { x: xPosition, y: yPosition },
                data: {
                    label: 'Target',
                    title: targetTransformation?.target?.name || targetTitle, // Use transformation name if available
                    icon: getNodeIcon('Target'),
                    ports: getNodePorts('Target'),
                    source: {
                        name: targetTransformation?.target?.name || 'output',
                        target_type: targetTransformation?.target?.connection?.connection_type==="PostgreSQL"?'Relational':targetTransformation?.target?.target_type || 'File',
                        target_name: targetTransformation?.target?.target_name || 'output',
                        table_name: targetTransformation?.target?.table_name,
                        connection: {
                            name: targetTransformation?.target?.connection?.name || 'local_connection',
                            connection_type: targetTransformation.target?.connection?.connection_type || 'Local',
                            file_path_prefix: targetTransformation.target?.connection?.file_path_prefix || '${output_file}',
                            connection_config_id: targetTransformation.target?.connection?.connection_config_id,
                            database: targetTransformation.target?.connection?.database,
                            schema: targetTransformation.target?.connection?.schema,
                            secret_name: targetTransformation.target?.connection?.secret_name,

                        },
                        file_name: targetTransformation.target?.file_name || 'output.csv',
                        load_mode: targetTransformation.target?.load_mode,
                        file_type: targetTransformation.target?.file_type
                    },
                    transformationData: {
                        write_options: targetTransformation.write_options || {
                            header: true,
                            sep: '|'
                        },
                        file_type: targetTransformation.file_type || 'csv'
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

    return { nodes, edges };
};

