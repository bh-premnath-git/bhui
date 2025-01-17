import { Node, Edge } from 'reactflow';
import { ApiService } from '@/services/apiServices';

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
    };
}

export const convertUIToPipelineJson = (nodes: Node[], edges: Edge[], pipelineDtl: any) => {
    const uiNodes = nodes as UINode[];
    // ... conversion logic
    return { pipeline_json: { nodes: uiNodes, edges } };
};

interface Source {
    name: string;
    source_type: string;
    file_name: string;
    connection: {
        name: string;
        connection_type: string;
        file_path_prefix: string;
    };
}

interface Transformation {
    name: string;
    transformation: string;
    dependent_on: string[];
}

const getNodeIcon = (type: string): string => {
    const iconMap: { [key: string]: string } = {
        Reader: '/assets/buildPipeline/6.svg',
        Filter: '/assets/buildPipeline/display/filter.svg',
        Joiner: '/assets/buildPipeline/display/join.svg',
        SchemaTransformation: '/assets/buildPipeline/28.svg',
        Sorter: '/assets/buildPipeline/squre/1.svg',
        Aggregator: '/assets/buildPipeline/squre/2.svg',
        Target: '/assets/buildPipeline/7.svg'
    };
    return iconMap[type] || '/assets/buildPipeline/default.svg';
};

const getNodePorts = (type: string) => {
    const portsMap: { [key: string]: { inputs: number; outputs: number; maxInputs: number | 'unlimited' } } = {
        Reader: { inputs: 0, outputs: 1, maxInputs: 0 },
        Filter: { inputs: 1, outputs: 1, maxInputs: 1 },
        Joiner: { inputs: 2, outputs: 1, maxInputs: 'unlimited' },
        SchemaTransformation: { inputs: 1, outputs: 1, maxInputs: 1 },
        Sorter: { inputs: 1, outputs: 1, maxInputs: 1 },
        Aggregator: { inputs: 1, outputs: 1, maxInputs: 1 },
        Target: { inputs: 1, outputs: 0, maxInputs: 1 }
    };
    return portsMap[type] || { inputs: 1, outputs: 1, maxInputs: 1 };
};

export const convertPipelineToUIJson = async (pipelineJson: any) => {
    const nodes: any[] = [];
    const edges: any[] = [];
    let xPosition = 50;
    let yPosition = 100;
    const yOffset = -117;

    // Create a map to store transformation name to node ID mapping
    const transformationToNodeMap: { [key: string]: string } = {};

    // Process sources and create Reader nodes
    for (const [index, source] of pipelineJson.sources.entries()) {
        try {
            const sourceDetails = await ApiService(
                "8011",
                "get",
                `/data_source/${source.data_src_id}`,
                null
            );

            const nodeId = `Reader_${index + 1}`;
            // Map the source name to the node ID
            transformationToNodeMap[`read_${source.name}`] = nodeId;

            nodes.push({
                id: nodeId,
                type: 'custom',
                position: {
                    x: xPosition,
                    y: index === 0 ? yPosition : yPosition + yOffset
                },
                data: {
                    label: source.name,
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
    let transformationCounter: { [key: string]: number } = {};
    xPosition += 130; // Initial offset for transformations

    for (const transform of pipelineJson.transformations) {
        if (transform.transformation === 'Reader') continue;

        const type = transform.transformation;
        transformationCounter[type] = (transformationCounter[type] || 0) + 1;

        const nodeId = `${type}_${transformationCounter[type]}`;
        // Map the transformation name to the node ID
        transformationToNodeMap[transform.name] = nodeId;

        nodes.push({
            id: nodeId,
            type: 'custom',
            position: { x: xPosition, y: yPosition },
            data: {
                label: type,
                icon: getNodeIcon(type),
                ports: getNodePorts(type)
            },
            width: 56,
            height: 72
        });

        // Create edges based on dependencies
        transform.dependent_on.forEach((dependentNode: string, index: number) => {
            const sourceNodeId = transformationToNodeMap[dependentNode];
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

        xPosition += 130;
    }

    // Add target node
    if (pipelineJson.targets && pipelineJson.targets.length > 0) {
        const targetId = 'Target_1';
        nodes.push({
            id: targetId,
            type: 'custom',
            position: { x: xPosition, y: yPosition },
            data: {
                label: 'Target',
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