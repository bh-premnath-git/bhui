import { Node, Edge } from 'reactflow';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CATALOG_API_PORT } from '@/config/platformenv';
import axios from 'axios';
import { apiService } from './api/api-service';

// API client setup
const apiClient = axios.create({
    baseURL: `http://localhost:${CATALOG_API_PORT}`
});

// Query keys
export const pipelineKeys = {
    all: ['pipeline'] as const,
    detail: (id: string) => [...pipelineKeys.all, 'detail', id] as const,
    transformationCount: (pipelineName: string) => [...pipelineKeys.all, 'transformationCount', pipelineName] as const,
};

// Query functions
export const usePipelineQuery = (id?: string) => {
    return useQuery({
        queryKey: pipelineKeys.detail(id || ''),
        queryFn: async () => {
            if (!id) {
                throw new Error("Pipeline id is required");
            }
            const data = await apiService.get({
                portNumber: CATALOG_API_PORT,
                url: `/pipeline/${id}`,
                usePrefix: true,
                method: 'GET',
                metadata: {
                    errorMessage: 'Failed to fetch projects'
                },
                params: { limit: 1000 }
            });
            return data;
        },
        enabled: !!id,
    });
};

export const useUpdatePipelineMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, pipeline_json }: { id: string; pipeline_json: any }) => {
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
            const { data } = await apiClient.get('/pipeline/debug/get_transformation_count', {
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

// Add new interface for logs


// Modify validation result to include logs


// Update validation function to generate logs


// Add a helper function to generate unique titles
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



const getNodeIcon = (type: string): string => {
    const iconMap: { [key: string]: string } = {
        Reader: '/assets/buildPipeline/6.svg',
        Target: '/assets/buildPipeline/7.svg',
        Filter: '/assets/buildPipeline/display/filter.svg',
        Joiner: '/assets/buildPipeline/display/join.svg',
        Ship: '/assets/buildPipeline/display/ship.svg',
        SchemaTransformation: '/assets/buildPipeline/28.svg',
        Sorter: '/assets/buildPipeline/squre/1.svg',
        Aggregator: '/assets/buildPipeline/squre/2.svg',
        'DQ Check': '/assets/buildPipeline/squre/4.svg',
        Dedup: '/assets/buildPipeline/squre/5.svg',
        Repartition: '/assets/buildPipeline/squre/6.svg',
        'SQL Transformation': '/assets/buildPipeline/squre/7.svg',
        Union: '/assets/buildPipeline/squre/8.svg',
        Select: '/assets/buildPipeline/squre/11.svg',
        SequenceGenerator: '/assets/buildPipeline/squre/12.svg',
        Drop: '/assets/buildPipeline/squre/13.svg'
    };
    return iconMap[type] || '/assets/buildPipeline/default.svg';
};

const getNodePorts = (type: string) => {
    const portsMap: { [key: string]: { inputs: number; outputs: number; maxInputs: number | 'unlimited' } } = {
        Reader: { inputs: 0, outputs: 1, maxInputs: 0 },
        Target: { inputs: 1, outputs: 0, maxInputs: 1 },
        Filter: { inputs: 1, outputs: 1, maxInputs: 1 },
        Joiner: { inputs: 2, outputs: 1, maxInputs: 'unlimited' },
        Ship: { inputs: 1, outputs: 1, maxInputs: 1 },
        SchemaTransformation: { inputs: 1, outputs: 1, maxInputs: 1 },
        Sorter: { inputs: 1, outputs: 1, maxInputs: 1 },
        Aggregator: { inputs: 1, outputs: 1, maxInputs: 1 },
        'DQ Check': { inputs: 1, outputs: 1, maxInputs: 1 },
        Dedup: { inputs: 1, outputs: 1, maxInputs: 1 },
        Repartition: { inputs: 1, outputs: 1, maxInputs: 1 },
        'SQL Transformation': { inputs: 1, outputs: 1, maxInputs: 1 },
        Union: { inputs: 2, outputs: 1, maxInputs: 'unlimited' }
    };
    return portsMap[type] || { inputs: 1, outputs: 1, maxInputs: 1 };
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
            const { data } = await apiClient.get(`/data_source/${source.data_src_id}`);
            const sourceDetails = data;

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
                    source: sourceDetails
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
        if (transform.transformation === 'Reader') continue;

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

        nodes.push({
            id: targetId,
            type: 'custom',
            position: { x: xPosition, y: yPosition },
            data: {
                label: 'Target',
                title: targetTitle,
                icon: getNodeIcon('Target'),
                ports: getNodePorts('Target')
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

    return { nodes, edges };
};

