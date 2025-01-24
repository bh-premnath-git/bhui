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
        source?: any;
        title?: string;
    };
}

export const convertUIToPipelineJson = (nodes: Node[], edges: Edge[], pipelineDtl: any) => {
    const uiNodes = nodes as UINode[];

    // Extract sources from Reader nodes
    const sources = uiNodes
        .filter(node => node.id.startsWith('Reader_'))
        .map(node => ({
            name: node.data.label,
            source_type: "File",
            file_name: `${node.data.source.file_path_prefix}/${node.data.source.file_name}`,
            data_src_id: node.data.source.data_src_id,
            connection: {
                name: node.data.source.connection?.name || "local_connection",
                connection_type: capitalizeFirstLetter(node.data.source.connection_type),
                file_path_prefix: `${node.data.source.file_path_prefix}/`
            }
        }));

    // Create a map of node IDs to their transformation names
    const nodeToTransformationName = new Map();
    uiNodes.forEach(node => {
        if (node.id.startsWith('Reader_')) {
            nodeToTransformationName.set(node.id, `read_${node.data.label}`);
        } else {
            const type = node.id.split('_')[0];
            nodeToTransformationName.set(node.id, getTransformationName(type, node.data.title));
        }
    });

    // Create transformations array following the flow order
    const transformations = [];

    // Helper function to get transformation config based on type and data
    const getTransformationConfig = (node: UINode, dependent_on: string[]) => {
        const baseConfig = {
            name: nodeToTransformationName.get(node.id),  // Use the mapped name
            dependent_on,
            transformation: node.id.split('_')[0]
        };

        switch (node.id.split('_')[0]) {
            case 'Filter':
                return {
                    ...baseConfig,
                    condition: node.data.transformationData?.condition || "age >= 18" // Default or from data
                };

            case 'Joiner':
                return {
                    ...baseConfig,
                    conditions: node.data.transformationData?.conditions || [{
                        join_input: "read_lookup_data",
                        join_condition: "read_input_data.id = read_lookup_data.id",
                        join_type: "left"
                    }],
                    expressions: node.data.transformationData?.expressions || [{
                        target_column: "full_name",
                        expression: "concat(read_input_data.name, ' ', read_input_data.city)"
                    }],
                    advanced: {
                        hints: node.data.transformationData?.hints || [{
                            join_input: "read_input_data",
                            hint_type: "broadcast"
                        }]
                    }
                };

            case 'SchemaTransformation':
                return {
                    ...baseConfig,
                    derived_fields: node.data.transformationData?.derived_fields || [{
                        name: "full_address",
                        expression: "concat(address, ' ', city, ' ', state, ' ', zip)"
                    }, {
                        name: "is_adult",
                        expression: "case when age >= 18 then 'Yes' else 'No' end"
                    }]
                };

            case 'Sorter':
                return {
                    ...baseConfig,
                    sort_columns: node.data.transformationData?.sort_columns || [{
                        column: "city",
                        order: "asc"
                    }]
                };

            case 'Aggregator':
                return {
                    ...baseConfig,
                    group_by: node.data.transformationData?.group_by || ["city"],
                    aggregate: node.data.transformationData?.aggregate || [{
                        expression: "avg(age)",
                        target_column: "average_age"
                    }],
                    pivot: node.data.transformationData?.pivot || [{
                        pivot_column: "city",
                        pivot_values: ["New York", "Los Angeles", "Chicago"]
                    }]
                };

            default:
                return baseConfig;
        }
    };

    // Process Reader transformations
    uiNodes
        .filter(node => node.id.startsWith('Reader_'))
        .forEach(node => {
            transformations.push({
                name: `read_${node.data.label}`,
                dependent_on: [],
                transformation: "Reader",
                source: {
                    name: node.data.label,
                    source_type: "File",
                    file_name: `${node.data.source.file_path_prefix}/${node.data.source.file_name}`,
                    connection: {
                        name: node.data.source.connection?.name || "local_connection",
                        connection_type: capitalizeFirstLetter(node.data.source.connection_type),
                        file_path_prefix: `${node.data.source.file_path_prefix}/`
                    }
                },
                read_options: {
                    header: true
                }
            });
        });

    // Process other transformations
    const processedNodes = new Set(uiNodes.filter(node => node.id.startsWith('Reader_')).map(n => n.id));
    const remainingNodes = new Set(uiNodes.filter(node => !node.id.startsWith('Reader_') && !node.id.startsWith('Target_')).map(n => n.id));

    while (remainingNodes.size > 0) {
        for (const nodeId of remainingNodes) {
            const incomingEdges = edges.filter(edge => edge.target === nodeId);
            const dependentNodes = incomingEdges.map(edge => edge.source);

            if (dependentNodes.every(depNode => processedNodes.has(depNode))) {
                const node = uiNodes.find(n => n.id === nodeId)!;
                const dependent_on = incomingEdges.map(edge => nodeToTransformationName.get(edge.source));

                // Get transformation config with all required fields
                const transformationConfig = getTransformationConfig(node, dependent_on);
                transformations.push(transformationConfig);

                processedNodes.add(nodeId);
                remainingNodes.delete(nodeId);
            }
        }
    }

    // Create target configuration
    const targets = uiNodes
        .filter(node => node.id.startsWith('Target_'))
        .map(() => ({
            name: "output_data",
            type: "File",
            connection: {
                type: "File",
                file_path: "examples/output.csv"
            },
            load_mode: "overwrite"
        }));

    return {
        pipeline_json: {
            $schema: "https://json-schema.org/draft-07/schema#",
            name: pipelineDtl?.pipeline_name,
            description: pipelineDtl?.pipeline_description,
            version: "1.0",
            mode: "DEBUG",
            parameters: [],
            sources,
            targets,
            transformations
        }
    };
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

function capitalizeFirstLetter(str: string): string {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

// Update the transformation name mapping
const getTransformationName = (type: string, title: string): string => {
    const baseName = title?.toLowerCase() || type.toLowerCase();
    switch (type) {
        case 'SchemaTransformation':
            return 'schema_transformation';
        case 'Joiner':
            return 'join_transformation';
        default:
            return `${baseName}_transformation`;
    }
}; 