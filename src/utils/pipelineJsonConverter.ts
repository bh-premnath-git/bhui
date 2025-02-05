import { Node, Edge } from 'reactflow';
import { ApiService } from '@/services/apiServices';
import { CATALOG_API_PORT } from '@/configration/environment';

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
interface PipelineLog {
    timestamp: string;
    message: string;
    level: 'info' | 'error' | 'warning';
}

// Modify validation result to include logs
interface ValidationResult {
    isValid: boolean;
    errors: string[];
    logs: PipelineLog[];
}

// Update validation function to generate logs
const validatePipelineConnections = (nodes: UINode[], edges: Edge[]): ValidationResult => {
    const errors: string[] = [];
    const logs: PipelineLog[] = [];
    const timestamp = new Date().toISOString();

    // Add initial validation log
    logs.push({
        timestamp,
        message: 'Starting pipeline validation...',
        level: 'info'
    });

    // Validate overall pipeline structure
    if (nodes.length === 0) {
        logs.push({
            timestamp,
            message: 'Pipeline is empty - no nodes found',
            level: 'error'
        });
        errors.push('Pipeline is empty - no nodes found');
        return { isValid: false, errors, logs };
    }

    // Check for at least one reader and one target
    const hasReader = nodes.some(node => node.id.startsWith('Reader_'));
    const hasTarget = nodes.some(node => node.id.startsWith('Target_'));

    if (!hasReader) {
        logs.push({
            timestamp,
            message: 'Pipeline must contain at least one Reader node',
            level: 'error'
        });
        errors.push('Pipeline must contain at least one Reader node');
    } else {
        logs.push({
            timestamp,
            message: 'Reader node(s) found in pipeline',
            level: 'info'
        });
    }

    if (!hasTarget) {
        logs.push({
            timestamp,
            message: 'Pipeline must contain at least one Target node',
            level: 'error'
        });
        errors.push('Pipeline must contain at least one Target node');
    } else {
        logs.push({
            timestamp,
            message: 'Target node(s) found in pipeline',
            level: 'info'
        });
    }

    nodes.forEach(node => {
        // Node validation start log
        logs.push({
            timestamp,
            message: `Validating node: ${node.data.title || node.data.label}`,
            level: 'info'
        });

        // Reader node validation
        if (node.id.startsWith('Reader_')) {
            const hasOutput = edges.some(edge => edge.source === node.id);
            if (!hasOutput) {
                const error = `Reader node "${node.data.title || node.data.label}" is not connected to any transformation`;
                errors.push(error);
                logs.push({
                    timestamp,
                    message: error,
                    level: 'error'
                });
            } else {
                logs.push({
                    timestamp,
                    message: `✓ Reader node "${node.data.title || node.data.label}" is properly connected`,
                    level: 'info'
                });
            }
            return;
        }

        // Target node validation
        if (node.id.startsWith('Target_')) {
            const hasInput = edges.some(edge => edge.target === node.id);
            if (!hasInput) {
                const error = `Target node "${node.data.title || node.data.label}" is not connected to any transformation`;
                errors.push(error);
                logs.push({
                    timestamp,
                    message: error,
                    level: 'error'
                });
            } else {
                logs.push({
                    timestamp,
                    message: `✓ Target node "${node.data.title || node.data.label}" is properly connected`,
                    level: 'info'
                });
            }
            return;
        }

        // Transformation node validation
        const incomingEdges = edges.filter(edge => edge.target === node.id);
        const outgoingEdges = edges.filter(edge => edge.source === node.id);
        const requiredInputs = node.data.ports.inputs;
        const maxInputs = node.data.ports.maxInputs;

        // Input validation
        if (incomingEdges.length === 0) {
            const error = `Node "${node.data.title || node.data.label}" has no input connections`;
            errors.push(error);
            logs.push({
                timestamp,
                message: error,
                level: 'error'
            });
        } else if (incomingEdges.length < requiredInputs) {
            const warning = `Node "${node.data.title || node.data.label}" requires ${requiredInputs} inputs but has only ${incomingEdges.length}`;
            errors.push(warning);
            logs.push({
                timestamp,
                message: warning,
                level: 'warning'
            });
        } else if (maxInputs && incomingEdges.length > maxInputs) {
            const error = `Node "${node.data.title || node.data.label}" exceeds maximum allowed inputs (${maxInputs})`;
            errors.push(error);
            logs.push({
                timestamp,
                message: error,
                level: 'error'
            });
        } else {
            logs.push({
                timestamp,
                message: `✓ Node "${node.data.title || node.data.label}" has valid input connections (${incomingEdges.length}/${requiredInputs})`,
                level: 'info'
            });
        }

        // Output validation
        if (outgoingEdges.length === 0) {
            const error = `Node "${node.data.title || node.data.label}" has no output connections`;
            errors.push(error);
            logs.push({
                timestamp,
                message: error,
                level: 'error'
            });
        } else {
            logs.push({
                timestamp,
                message: `✓ Node "${node.data.title || node.data.label}" has valid output connections`,
                level: 'info'
            });
        }
    });

    // Add final validation summary
    const successCount = logs.filter(log => log.level === 'info').length;
    const warningCount = logs.filter(log => log.level === 'warning').length;
    const errorCount = logs.filter(log => log.level === 'error').length;

    logs.push({
        timestamp,
        message: `Validation complete: ${successCount} successes, ${warningCount} warnings, ${errorCount} errors`,
        level: errors.length === 0 ? 'info' : 'error'
    });

    return {
        isValid: errors.length === 0,
        errors,
        logs
    };
};

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

export const convertUIToPipelineJson = (nodes: Node[], edges: Edge[], pipelineDtl: any, validateOnly: boolean = false) => {
    const uiNodes = nodes as UINode[];
    
    if (validateOnly) {
        // Perform validation and return logs
        const validation = validatePipelineConnections(uiNodes, edges);
        
        if (!validation.isValid) {
            const error = new Error(`Pipeline is incomplete or broken:\n${validation.errors.join('\n')}`);
            (error as any).logs = validation.logs;
            throw error;
        }
        
        // Return early if only validating
        return validation;
    }
    
    // Get ordered nodes using topological sort
    const getOrderedNodes = () => {
        const orderedNodes: UINode[] = [];
        const visited = new Set<string>();

        const processNode = (nodeId: string) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);

            // Process incoming edges first
            const incomingEdges = edges.filter(edge => edge.target === nodeId);
            incomingEdges.forEach(edge => {
                if (!visited.has(edge.source)) {
                    processNode(edge.source);
                }
            });

            const node = uiNodes.find(n => n.id === nodeId);
            if (node) {
                orderedNodes.push(node);
            }
        };

        // Start with target nodes
        const targetNodes = uiNodes.filter(node => node.id.startsWith('Target_'));
        targetNodes.forEach(node => {
            processNode(node.id);
        });

        return orderedNodes;
    };

    const orderedUiNodes = getOrderedNodes();
    
    // Extract sources and create reader transformations
    const sources = uiNodes
        .filter(node => node.id.startsWith('Reader_'))
        .map(node => ({
            name: node.data.source.name || node.data.title,
            source_type: "File",
            file_name: `${node.data.source.file_path_prefix}/${node.data.source.file_name}`,
            data_src_id: node.data.source.data_src_id,
            connection: {
                name: node.data.source.connection?.name || "local_connection",
                connection_type: capitalizeFirstLetter(node.data.source.connection_type),
                file_path_prefix: `${node.data.source.file_path_prefix}/`
            }
        }));

    // Create reader transformations
    const readerTransformations = uiNodes
        .filter(node => node.id.startsWith('Reader_'))
        .map(node => ({
            name: node.data.title,
            dependent_on: [],
            transformation: "Reader",
            source: {
                name: node.data.source.name || node.data.title,
                source_type: "File",
                file_name: node.data.source.file_name,
                connection: {
                    name: node.data.source.connection?.name || "local_connection",
                    connection_type: capitalizeFirstLetter(node.data.source.connection_type),
                    file_path_prefix: node.data.source.file_path_prefix
                }
            },
            read_options: {
                header: true
            }
        }));

    // Process regular transformations using ordered nodes
    const regularTransformations = orderedUiNodes
        .filter(node => !node.id.startsWith('Reader_') && !node.id.startsWith('Target_'))
        .map(node => {
            console.log(node.data.title)
            const baseConfig = {
                name: node.data.title, // Use the node's title as the transformation name
                transformation: node.data.label,
                dependent_on: edges
                    .filter(edge => edge.target === node.id)
                    .map(edge => {
                        const sourceNode = uiNodes.find(n => n.id === edge.source);
                        console.log(sourceNode)
                        return sourceNode?.data?.title || '';
                    })
            };

            // Rest of the transformation configuration...
            switch (node.data.label) {
                case 'Aggregator':
                    return {
                        ...baseConfig,
                        name: node.data.title, // Explicitly set the name
                        group_by: node.data.transformationData?.group_by || [],
                        aggregations: node.data.transformationData?.aggregations || [],
                        pivot_by: node.data.transformationData?.pivot_by || []
                    };
                case 'Filter':
                    return {
                        ...baseConfig,
                        condition: node.data.transformationData?.condition || ''
                    };
                case 'SQL Transformation':
                    return {
                        ...baseConfig,
                        sql: node.data.transformationData?.sql || "true"
                    };
                case 'Joiner':
                    return {
                        ...baseConfig,
                        conditions: node.data.transformationData?.conditions || [],
                        expressions: node.data.transformationData?.expressions || [],
                        advanced: node.data.transformationData?.advanced || {
                            hints: []
                        }
                    };
                case 'SchemaTransformation':
                    return {
                        ...baseConfig,
                        derived_fields: node.data.transformationData?.derived_fields || []
                    };
                case 'Sorter':
                    return {
                        ...baseConfig,
                        sort_columns: node.data.transformationData?.sort_columns 
                    };
                case 'DQ Check':
                    return {
                        ...baseConfig,
                        transformation: node.data.transformationData?.transformation || "",
                        name: node.data.transformationData?.name || "",
                        limit: node.data.transformationData?.limit,
                        dq_rules: node.data.transformationData?.dq_rules || []
                    };
                case 'Dedup':
                    return {
                        ...baseConfig,
                        keep: node.data.transformationData?.keep || "any",
                        dedup_by: node.data.transformationData?.dedup_by || [],
                        order_by: node.data.transformationData?.order_by || []
                    };
                case 'Repartition':
                    return {
                        ...baseConfig,
                        repartition_type: node.data.transformationData?.repartition_type || "repartition",
                        repartition_value: node.data.transformationData?.repartition_value,
                        override_partition: node.data.transformationData?.override_partition || "",
                        repartition_expression: node.data.transformationData?.repartition_expression || [],
                        limit: node.data.transformationData?.limit
                    };
                case 'Union':
                    return {
                        ...baseConfig,
                        operation_type: node.data.transformationData?.operation_type || "union",
                        allow_missing_columns: node.data.transformationData?.allow_missing_columns || false
                    };
                case 'Select':
                    return {
                        ...baseConfig,
                        column_list: node.data.transformationData?.column_list || [],
                        limit: node.data.transformationData?.limit || ''
                    };
                case 'SequenceGenerator':
                    return {
                        ...baseConfig,
                        for_column_name: node.data.transformationData?.for_column_name || "",
                        order_by: node.data.transformationData?.order_by || [],
                        start_with: node.data.transformationData?.start_with || 1,
                        step: node.data.transformationData?.step || ''
                    };
                case 'Drop':
                    return {
                        ...baseConfig,
                        column_list: node.data.transformationData?.column_list || [],
                        pattern: node.data.transformationData?.pattern
                    };
                default:
                    return {
                        ...baseConfig,
                        ...node.data.transformationData
                    };
            }
        });

    // Create target configuration and writer transformation
    const targets = uiNodes
        .filter(node => node.id.startsWith('Target_'))
        .map(node => ({
            name: "output_data",
            type: "File",
            connection: {
                type: "File",
                file_path: "examples/output.csv"
            },
            load_mode: "overwrite"
        }));

    // const writerTransformations = uiNodes
    //     .filter(node => node.id.startsWith('Target_'))
    //     .map(node => {
    //         const lastTransformation = uiNodes
    //             .filter(n => !n.id.startsWith('Target_'))
    //             .slice(-1)[0];
            
    //         return {
    //             name: "write_output",
    //             dependent_on: [lastTransformation?.data.title || ""],
    //             transformation: "Writer",
    //             target: {
    //                 name: "output_data",
    //                 type: "File",
    //                 connection: {
    //                     type: "File",
    //                     file_path: "examples/output.csv"
    //                 },
    //                 load_mode: "overwrite"
    //             }
    //         };
    //     });
console.log({
    $schema: "https://json-schema.org/draft-07/schema#",
    name: pipelineDtl?.pipeline_name || "sample_pipeline",
    description: pipelineDtl?.pipeline_description || " ",
    version: "1.0",
    mode: "DEBUG",
    parameters: [],
    sources,
    targets,
    transformations: [
        ...readerTransformations,
        ...regularTransformations.filter(Boolean),
        // ...writerTransformations
    ]
})
    return {
        pipeline_json: {
            $schema: "https://json-schema.org/draft-07/schema#",
            name: pipelineDtl?.pipeline_name || "sample_pipeline",
            description: pipelineDtl?.pipeline_description || " ",
            version: "1.0",
            mode: "DEBUG",
            parameters: [],
            sources,
            targets,
            transformations: [
                ...readerTransformations,
                ...regularTransformations.filter(Boolean),
                // ...writerTransformations
            ]
        }
    };
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
            const sourceDetails = await ApiService(
                CATALOG_API_PORT,
                "get",
                `/data_source/${source.data_src_id}`,
                null
            );

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

function capitalizeFirstLetter(str: string): string {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

// Update the transformation name mapping
const getTransformationName = (type: string, title: string): string => {
    return title || type;
}; 