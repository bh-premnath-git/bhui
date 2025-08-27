import { Node, Edge } from '@xyflow/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { apiService } from './api/api-service';
import { getNodeIcon, getNodePorts } from './transformationUtils';
import { NodeFormData } from '@/types/designer/flow';
import { useModules } from '@/hooks/useModules';


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
                baseUrl: CATALOG_REMOTE_API_URL,
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
                baseUrl: CATALOG_REMOTE_API_URL,
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

/**
 * Normalizes transformation data to ensure proper structure for form components
 */
const normalizeTransformationData = (transform: any, type: string): any => {
    const normalizedData = { ...transform };
    
    // Specific handling for different transformation types
    switch (type) {
        case 'Deduplicator':
            return {
                ...normalizedData,
                keep: transform.keep || 'any',
                dedup_by: Array.isArray(transform.dedup_by) ? transform.dedup_by : [],
                order_by: Array.isArray(transform.order_by) ? transform.order_by : []
            };
        
        case 'Aggregator':
            return {
                ...normalizedData,
                group_by: Array.isArray(transform.group_by) ? transform.group_by : [],
                aggregations: Array.isArray(transform.aggregate) ? transform.aggregate : 
                             Array.isArray(transform.aggregations) ? transform.aggregations : [],
                pivot_by: Array.isArray(transform.pivot) ? transform.pivot : 
                          Array.isArray(transform.pivot_by) ? transform.pivot_by : []
            };
        
        case 'SchemaTransformation':
            return {
                ...normalizedData,
                derived_fields: Array.isArray(transform.derived_fields) ? transform.derived_fields : [],
                select_columns: Array.isArray(transform.select_columns) ? transform.select_columns : [],
                drop_columns: Array.isArray(transform.drop_columns) ? transform.drop_columns : [],
                rename_columns: transform.rename_columns || {}
            };
        
        case 'Joiner':
            return {
                ...normalizedData,
                conditions: Array.isArray(transform.conditions) ? transform.conditions : [],
                expressions: Array.isArray(transform.expressions) ? transform.expressions : [],
                advanced: transform.advanced || { hints: [] }
            };
        
        case 'Filter':
            return {
                ...normalizedData,
                condition: transform.condition || ''
            };
        
        case 'Sorter':
            return {
                ...normalizedData,
                sort_columns: Array.isArray(transform.sort_columns) ? transform.sort_columns : []
            };
        
        case 'SequenceGenerator':
            // Helper function to safely convert to integer
            const safeParseIntSeq = (value: any, defaultValue: number) => {
                if (value === undefined || value === null || value === '') return defaultValue;
                const parsed = parseInt(value, 10);
                return isNaN(parsed) ? defaultValue : parsed;
            };

            return {
                ...normalizedData,
                for_column_name: transform.for_column_name || '',
                start_with: safeParseIntSeq(transform.start_with, 1),
                step: safeParseIntSeq(transform.step, 1),
                order_by: Array.isArray(transform.order_by) ? transform.order_by : []
            };
        
        case 'Reader':
            return {
                ...normalizedData,
                select_columns: Array.isArray(transform.select_columns) ? transform.select_columns : [],
                drop_columns: Array.isArray(transform.drop_columns) ? transform.drop_columns : [],
                rename_columns: transform.rename_columns || {}
            };
        
        case 'DQCheck':
            // Helper function to safely convert to integer
            const safeParseIntDQ = (value: any) => {
                if (value === undefined || value === null || value === '') return undefined;
                const parsed = parseInt(value, 10);
                return isNaN(parsed) ? undefined : parsed;
            };

            return {
                ...normalizedData,
                transformation: transform.transformation || 'DQCheck',
                name: transform.name || '',
                limit: safeParseIntDQ(transform.limit),
                dq_rules: Array.isArray(transform.dq_rules) 
                    ? transform.dq_rules.map(rule => ({
                        rule_name: rule.rule_name || '',
                        column: rule.column || '',
                        column_type: rule.column_type || 'string',
                        rule_type: rule.rule_type || '',
                        value: rule.value || '',
                        value2: rule.value2 || undefined,
                        action: rule.action || 'warning'
                    }))
                    : [],
                dependent_on: Array.isArray(transform.dependent_on) ? transform.dependent_on : []
            };
        
        case 'Lookup':
            // Handle lookup_conditions - convert array back to single object for UI
            let lookupConditions = {
                column_name: '',
                lookup_with: ''
            };
            
            if (Array.isArray(transform.lookup_conditions) && transform.lookup_conditions.length > 0) {
                // If it's an array, take the first valid condition
                const firstCondition = transform.lookup_conditions[0];
                if (firstCondition && (firstCondition.column_name || firstCondition.lookup_with)) {
                    lookupConditions = firstCondition;
                }
            } else if (transform.lookup_conditions && typeof transform.lookup_conditions === 'object') {
                // If it's already a single object, use it
                lookupConditions = transform.lookup_conditions;
            }
            
            return {
                ...normalizedData,
                lookup_type: transform.lookup_type || 'Column Based',
                lookup_config: transform.lookup_config || { name: '', source: {}, read_options: { header: true } },
                lookup_data: Array.isArray(transform.lookup_data) ? transform.lookup_data : [],
                lookup_columns: Array.isArray(transform.lookup_columns) ? transform.lookup_columns : [],
                lookup_conditions: lookupConditions,
                keep: transform.keep || 'First'
            };
        
        case 'Repartition':
            // Helper function to safely convert to integer
            const safeParseInt = (value: any) => {
                if (value === undefined || value === null || value === '') return undefined;
                const parsed = parseInt(value, 10);
                return isNaN(parsed) ? undefined : parsed;
            };

            return {
                ...normalizedData,
                repartition_type: transform.repartition_type || 'repartition',
                repartition_value: safeParseInt(transform.repartition_value),
                override_partition: transform.override_partition || '',
                repartition_expression: Array.isArray(transform.repartition_expression) 
                    ? transform.repartition_expression.map(expr => ({
                        expression: expr.expression || '',
                        sort_order: expr.sort_order || 'asc'
                    }))
                    : [],
                limit: safeParseInt(transform.limit)
            };
        
        case 'Target':
        case 'Writer':
            // For Writer/Target transformations, the target data might be in different places
            // 1. Direct target object: transform.target (when resolved)
            // 2. Reference: transform.target.$ref (needs resolution)
            // 3. Embedded in transform itself
            
            let targetInfo:any = {};
            if (transform.target && !transform.target.$ref) {
                // Direct target object (already resolved)
                targetInfo = transform.target;
            } else if (transform.target_type) {
                // Target info is directly in the transform
                targetInfo = {
                    target_type: transform.target_type,
                    table_name: transform.table_name,
                    file_name: transform.file_name,
                    load_mode: transform.load_mode,
                    connection: transform.connection
                };
            }
            
            return {
                ...normalizedData,
                name: transform.name || '',
                target: {
                    target_type: targetInfo.target_type || 'File',
                    table_name: targetInfo.table_name || '',
                    file_name: targetInfo.file_name || '',
                    load_mode: targetInfo.load_mode || 'append',
                    connection: targetInfo.connection || {}
                },
                file_type: transform.file_type || targetInfo.file_type || 'CSV',
                write_options: transform.write_options || {
                    header: true,
                    sep: ","
                }
            };
        
        default:
            return normalizedData;
    }
};



// Cache for data source details to avoid redundant API calls
const dataSourceCache = new Map<string, any>();

/**
 * Converts flow.json format to ReactFlow nodes and edges
 * @param flowJson The flow.json object from flow?.flow_definition?.flow_json
 * @returns An object containing nodes, edges, and nodeFormData arrays
 */
export const convertFlowJsonToReactFlow = (flowJson: any,moduleTypes:any): { nodes: Node[], edges: Edge[], nodeFormData: NodeFormData[] } => {
    // Handle case where flowJson might be a string
    let parsedFlowJson = flowJson;
    if (typeof flowJson === 'string') {
        try {
            parsedFlowJson = JSON.parse(flowJson);
        } catch (error) {
            console.error('Error parsing flow JSON string:', error);
            return { nodes: [], edges: [], nodeFormData: [] };
        }
    }

    if (!parsedFlowJson || !parsedFlowJson.tasks || !Array.isArray(parsedFlowJson.tasks)) {
        console.error('Invalid flow JSON structure:', parsedFlowJson);
        return { nodes: [], edges: [], nodeFormData: [] };
    }

    // Use the parsed flow JSON for the rest of the function
    flowJson = parsedFlowJson;

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodeFormData: NodeFormData[] = [];

    // Track node positions to avoid overlaps
    let xPosition = 50;
    let yPosition = 100;
    const xOffset = 250; // Horizontal spacing between nodes
    const yOffset = 150; // Vertical spacing between nodes

    // Map to store task_id to node_id mapping
    const taskToNodeMap = new Map<string, string>();

    // First pass: Create nodes for all tasks
    flowJson.tasks.forEach((task: any, index: number) => {
        // Generate a unique node ID based on task type and timestamp
        const timestamp = Date.now();
        const nodeType = task.type || 'Unknown';
        const nodePrefix = getNodePrefix(nodeType);
        const nodeId = `${nodePrefix}_${task.task_id}_${timestamp}`;

        // Store mapping from task_id to node_id for creating edges later
        taskToNodeMap.set(task.task_id, nodeId);

        // Determine node position
        const position = {
            x: xPosition + (index % 3) * xOffset,
            y: yPosition + Math.floor(index / 3) * yOffset
        };

        // Process parameters if they exist
        let processedTask = { ...task };
        if (task.parameters && Array.isArray(task.parameters) && task.parameters.length > 0) {
            // Convert parameters array to key-value pairs in the task object
            task.parameters.forEach((param: any) => {
                if (param.key && param.value !== undefined) {
                    processedTask[param.key] = param.value;
                }
            });
        }
        // Create the node with structure matching flowmode.json
        const node: Node = {
            id: nodeId,
            type: 'custom',
            position,
            data: {
                label: nodePrefix,
                icon: getNodeIconForOperator(nodeType),
                ports: getNodePortsForOperator(nodeType),
                id:getMetaById(nodePrefix,moduleTypes),
                meta: getMeta(nodePrefix,moduleTypes),
                requiredFields: [],
                selectedData: nodeType,
                type: nodeType,
                formData: processedTask,
                title: nodePrefix,
                status: "ready",
                tempSave: false
            }
        };

        nodes.push(node);

        // Create node form data
        nodeFormData.push({
            nodeId,
            formData: {
                ...processedTask,
                type: nodeType
            }
        });
    });

    // Create a sequential flow if no dependencies are specified
    // This will connect nodes in the order they appear in the tasks array
    const nodeIds = Array.from(nodes.map(node => node.id));

    // If we have dependencies, use them to create edges
    let hasExplicitDependencies = false;

    // Second pass: Create edges based on depends_on relationships
    flowJson.tasks.forEach((task: any) => {
        if (task.depends_on && Array.isArray(task.depends_on) && task.depends_on.length > 0) {
            hasExplicitDependencies = true;
            const targetNodeId = taskToNodeMap.get(task.task_id);

            if (!targetNodeId) {
                console.warn(`Target node not found for task_id: ${task.task_id}`);
                return;
            }

            // Create edges for each dependency
            task.depends_on.forEach((sourceTaskId: string, index: number) => {
                const sourceNodeId = taskToNodeMap.get(sourceTaskId);

                if (!sourceNodeId) {
                    console.warn(`Source node not found for task_id: ${sourceTaskId}`);
                    return;
                }

                // Create edge
                const edge: Edge = {
                    id: `reactflow__edge-${sourceNodeId}output-0-${targetNodeId}input-0`,
                    source: sourceNodeId,
                    target: targetNodeId,
                    sourceHandle: 'output-0',
                    targetHandle: 'input-0'
                };

                edges.push(edge);
            });
        }
    });

    // If no explicit dependencies were found, create a sequential flow
    if (!hasExplicitDependencies && nodeIds.length > 1) {
        for (let i = 0; i < nodeIds.length - 1; i++) {
            const edge: Edge = {
                id: `reactflow__edge-${nodeIds[i]}output-0-${nodeIds[i + 1]}input-0`,
                source: nodeIds[i],
                target: nodeIds[i + 1],
                sourceHandle: 'output-0',
                targetHandle: 'input-0'
            };

            edges.push(edge);
        }
    }

    return { nodes, edges, nodeFormData };
};

/**
 * Gets the appropriate node prefix based on operator type
 */
const getNodePrefix = (operatorType: string): string => {
    const prefixMap: { [key: string]: string } = {
        'S3KeySensor': 'Sensor',
        'HttpSensor': 'Sensor',
        'BashOperator': 'Custom',
        'EmailOperator': 'Alert',
        'EmrAddStepsOperator': 'AWS',
        'EmrCreateJobFlowOperator': 'AWS',
        'EmrTerminateJobFlowOperator': 'AWS',
        'SFTPOperator': 'Transfer',
        'SFTPToS3Operator': 'Transfer',
        'SimpleHttpOperator': 'API'
    };
    return prefixMap[operatorType] || 'Custom';
};


/**
 * Gets the appropriate icon for an operator type
 */
const getNodeIconForOperator = (operatorType: string): string => {
    // Use the dynamic getNodeIcon function for flow operators
    return getNodeIcon(operatorType);
};


/**
 * Gets the appropriate ports configuration for an operator type
 */
const getNodePortsForOperator = (operatorType: string): { inputs: number; outputs: number; maxInputs: number } => {
    // Default ports configuration
    const defaultPorts = { inputs: 1, outputs: 1, maxInputs: 1 };

    const portsMap: { [key: string]: { inputs: number; outputs: number; maxInputs: number } } = {
        'S3KeySensor': { inputs: 0, outputs: 1, maxInputs: 1 },
        'HttpSensor': { inputs: 0, outputs: 1, maxInputs: 1 },
        'EmailOperator': { inputs: 1, outputs: 1, maxInputs: 1 },
        'BashOperator': { inputs: 1, outputs: 1, maxInputs: 1 },
        'EmrAddStepsOperator': { inputs: 1, outputs: 1, maxInputs: 1 },
        'EmrCreateJobFlowOperator': { inputs: 1, outputs: 1, maxInputs: 1 },
        'EmrTerminateJobFlowOperator': { inputs: 1, outputs: 1, maxInputs: 1 },
        'SFTPOperator': { inputs: 1, outputs: 0, maxInputs: 1 },
        'SFTPToS3Operator': { inputs: 1, outputs: 0, maxInputs: 1 }
    };

    return portsMap[operatorType] || defaultPorts;
};

const getMeta = (operatorType: string,moduleTypes) => {
    let node = moduleTypes.find((type) => type.label.toLowerCase() === operatorType.toLowerCase());

    return {
            type: node?.type,
            moduleInfo: {
                color: node?.color,
                icon: node?.icon,
                label: node?.label,
            },
            properties: node.operators.map((op) => op.properties),
            description: node?.description,
            fullyOptimized: false,
    }
}
const getMetaById = (operatorType: string,moduleTypes) => {
        let node = moduleTypes.find((type) => type.label.toLowerCase() === operatorType.toLowerCase());
return node?.id
}

export const convertPipelineToUIJson = async (pipelineJson: any, handleSourceUpdate: (sourceData: any) => void) => {
    const nodes: any[] = [];
    const edges: any[] = [];
    let xPosition = 50;
    let yPosition = 100;
    const yOffset = -117;
    
    // Extract engine type from pipeline JSON, default to 'pyspark'
    const selectedEngineType = pipelineJson.engine_type || 'pyspark';

    // Track existing titles to ensure uniqueness
    const existingTitles = new Set<string>();

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

    // Track processed sources to avoid duplicates
    const processedSources = new Set<string>();

    // Process transformations
    xPosition += 130;
    const transformationNodes = new Map<string, string>(); // Map transformation names to node IDs
    let sourceIndex = 0;


    // First, process Reader transformations from the transformations array
    for (const transform of pipelineJson.transformations) {
        if (transform.transformation === 'Reader') {
            // Resolve source reference if it exists
            let sourceData = transform.source;
            if (sourceData && sourceData.$ref) {
                sourceData = resolveRef(sourceData.$ref);
            }

            // Resolve connection reference if it exists
            let connection = sourceData?.connection;
            if (connection && connection.$ref) {
                connection = resolveRef(connection.$ref);
            }

            // Skip if this source has already been processed
            const sourceName = sourceData?.name || transform.name;
            if (processedSources.has(sourceName)) continue;
            processedSources.add(sourceName);

            try {
                // Check if we already have this data source in cache
                const dataSourceId = sourceData?.data_src_id || '';
                let sourceDetails: any;

                if (dataSourceId && dataSourceCache.has(dataSourceId)) {
                    // Use cached data
                    sourceDetails = dataSourceCache.get(dataSourceId);
                } else if (dataSourceId) {
                    // Fetch data and cache it
                    sourceDetails = await apiService.get({
                        baseUrl: CATALOG_REMOTE_API_URL,
                        url: `/data_source/${dataSourceId}`,
                        usePrefix: true,
                        method: 'GET',
                        metadata: {
                            errorMessage: 'Failed to fetch source details'
                        },
                    });

                    // Cache the result for future use
                    dataSourceCache.set(dataSourceId, sourceDetails);
                } else {
                    // Handle case where no data_src_id is provided
                    sourceDetails = { data_src_name: sourceName };
                }
                if (handleSourceUpdate) {
                    const nodeId = `Reader_${sourceIndex + 1}`;
                    const sourceUpdateData = {
                        nodeId,
                        sourceData: {
                            data: {
                                label: sourceName || sourceDetails.data_src_name,
                                source: {
                                    "name": sourceName || sourceDetails.data_src_name,
                                    "data_src_desc": sourceName || sourceDetails.name,
                                    "reader_name": sourceData?.reader_name || sourceDetails.data_src_name,
                                    "source_type": sourceData?.source_type || sourceDetails.connection_type,
                                    "file_name": sourceData?.file_name || sourceDetails.file_name,
                                    "data_src_id": sourceData?.data_src_id || sourceDetails.data_src_id,
                                    "project_id": sourceDetails.bh_project_id,
                                    "file_path_prefix": connection?.file_path_prefix || sourceDetails.connection?.file_path_prefix,
                                    "file_type": connection?.file_type || sourceDetails.file_type,
                                    "connection_config_id": connection?.connection_config_id || sourceDetails?.connection_config_id,
                                    "table_name": sourceData?.table_name || sourceDetails.table_name,
                                    "connection_config": { custom_metadata: connection || sourceDetails?.connection_config?.custom_metadata },
                                    "connection": connection || sourceDetails?.connection_config?.custom_metadata
                                }
                            }
                        }
                    };

                    handleSourceUpdate(sourceUpdateData);
                }

                const nodeTitle = sourceName;
                existingTitles.add(nodeTitle);

                const nodeId = `Reader_${sourceIndex + 1}`;
                transformationNodes.set(transform.name, nodeId);

                nodes.push({
                    id: nodeId,
                    type: 'custom',
                    position: {
                        x: xPosition - 130, // Position at the start
                        y: yPosition + (sourceIndex * Math.abs(yOffset))
                    },
                    data: {
                        label: 'Reader',
                        title: nodeTitle,
                        icon: getNodeIcon('Reader', selectedEngineType),
                        ports: getNodePorts('Reader'),
                        transformationType: 'Reader',
                        transformationData: normalizeTransformationData(transform, 'Reader'),
                        source: {
                            "name": sourceName || sourceDetails.data_src_name,
                            "data_src_desc": sourceName || sourceDetails.name,
                            "reader_name": sourceData?.reader_name || sourceDetails.data_src_name,
                            "source_type": sourceData?.source_type || sourceDetails.connection_type,
                            "file_name": sourceData?.file_name || sourceDetails.file_name,
                            "data_src_id": sourceData?.data_src_id || sourceDetails.data_src_id,
                            "project_id": sourceDetails.bh_project_id,
                            "file_path_prefix": connection?.file_path_prefix || sourceDetails.connection?.file_path_prefix,
                            "file_type": connection?.file_type || sourceDetails.file_type,
                            "connection_config_id": connection?.connection_config_id || sourceDetails?.connection_config_id,
                            "table_name": sourceData?.table_name || sourceDetails.table_name,
                            "connection_config": { custom_metadata: connection || sourceDetails?.connection_config?.custom_metadata },
                            "connection": connection || sourceDetails?.connection_config?.custom_metadata
                        }
                    },
                    width: 56,
                    height: 72
                });

                sourceIndex++;
            } catch (error) {
                console.error(`Error processing Reader transformation:`, error);
            }
        }
    }

    // Sort non-Reader, non-Writer transformations based on dependencies
    // This ensures they appear in the correct sequence in the UI
    const nonReaderWriterTransformations = pipelineJson.transformations.filter(
        (t: any) => t.transformation !== 'Reader' && t.transformation !== 'Writer' && t.transformation !== 'Target'
    );

    // Create a dependency map to track which transformations depend on which
    const dependencyMap = new Map<string, string[]>();

    // Add Reader transformations to the dependency map
    pipelineJson.transformations.forEach((transform: any) => {
        if (transform.transformation === 'Reader') {
            dependencyMap.set(transform.name, []);
        }
    });

    // Add non-Reader, non-Writer transformations to the dependency map
    nonReaderWriterTransformations.forEach((transform: any) => {
        if (transform.dependent_on && Array.isArray(transform.dependent_on)) {
            dependencyMap.set(transform.name, transform.dependent_on);
        } else {
            dependencyMap.set(transform.name, []);
        }
    });

    // Sort transformations based on dependencies using a topological sort
    // This ensures that transformations appear in the correct dependency order
    const sortedTransformations: any[] = [];
    const visited = new Set<string>();
    const temp = new Set<string>();

    // Topological sort function to handle dependency chains
    const visit = (transformName: string) => {
        // If we've already processed this node, skip it
        if (visited.has(transformName)) return;

        // If we're currently processing this node, we have a cycle
        if (temp.has(transformName)) {
            console.warn(`Dependency cycle detected involving ${transformName}`);
            return;
        }

        // Mark the node as being processed
        temp.add(transformName);

        // Process all dependencies first
        const dependencies = dependencyMap.get(transformName) || [];
        for (const dependency of dependencies) {
            visit(dependency);
        }

        // Mark the node as processed
        temp.delete(transformName);
        visited.add(transformName);

        // Add the transformation to the sorted list
        // Skip Reader transformations as they're handled separately
        const transform = pipelineJson.transformations.find(
            (t: any) => t.name === transformName &&
                t.transformation !== 'Reader' &&
                t.transformation !== 'Writer' &&
                t.transformation !== 'Target'
        );
        if (transform) {
            sortedTransformations.push(transform);
        }
    };

    // Process all transformations
    for (const transform of nonReaderWriterTransformations) {
        if (!visited.has(transform.name)) {
            visit(transform.name);
        }
    }

    // Fallback: if sort produced no items, use original list to avoid losing nodes
    const orderedTransforms = sortedTransformations.length > 0
        ? sortedTransformations
        : nonReaderWriterTransformations;

    // Process non-Reader, non-Writer transformations in sorted order
    // First pass: create all nodes
    for (const transform of orderedTransforms) {
        const type = transform.transformation;
        const nodeId = `${type}_${nodes.length + 1}`;

        // Use the original transformation name if it exists
        const nodeTitle = transform.name || generateUniqueTitle(type, existingTitles);
        transformationNodes.set(transform.name, nodeId);

        // Handle regular transformations
        nodes.push({
            id: nodeId,
            type: 'custom',
            position: { x: xPosition, y: yPosition },
            data: {
                label: type,
                title: nodeTitle,
                icon: getNodeIcon(type, selectedEngineType),
                ports: getNodePorts(type),
                transformationType: type,
                transformationData: normalizeTransformationData(transform, type)
            },
            width: 56,
            height: 72
        });

        xPosition += 130;
    }

    // Second pass: create all edges after all nodes have been created
    // This ensures that all node IDs are available in the transformationNodes map
    // Use the sorted transformations to maintain the correct order
    for (const transform of orderedTransforms) {
        // Get the node ID for this transformation
        const nodeId = transformationNodes.get(transform.name);

        if (!nodeId) continue; // Skip if node ID not found

        // Create edges based on dependencies
        if (transform.dependent_on && Array.isArray(transform.dependent_on)) {

            transform.dependent_on.forEach((dependentName: string, index: number) => {
                const sourceNodeId = transformationNodes.get(dependentName);

                if (sourceNodeId) {

                    edges.push({
                        source: sourceNodeId,
                        sourceHandle: 'output-0',
                        target: nodeId,
                        targetHandle: `input-${index}`,
                        id: `reactflow__edge-${sourceNodeId}output-0-${nodeId}input-${index}`
                    });
                } else {
                    // Avoid dangling edges
                    console.warn(`Source node ID not found for dependency: ${dependentName}`);
                }
            });
        }
    }

    // Process Writer/Target transformation
    const writerTransformation = pipelineJson.transformations.find(
        (t: any) => t.transformation === 'Writer' || t.transformation === 'Target'
    );

    if (writerTransformation) {
        const targetId = `Target_${nodes.length + 1}`;
        const targetTitle = writerTransformation.name || generateUniqueTitle('Target', existingTitles);
        if (writerTransformation.name) {
            transformationNodes.set(writerTransformation.name, targetId);
        }
        // Resolve target reference if it exists
        let targetData = writerTransformation.target || writerTransformation;
        if (targetData && targetData.$ref) {
            targetData = resolveRef(targetData.$ref);
        }

        // If targets is an array, use the first target
        const targets = pipelineJson.targets || {};
        if (Array.isArray(targets) && targets.length > 0) {
            targetData = targets[0];
        }

        // Resolve connection reference if it exists
        let connection = targetData?.connection;
        if (connection && connection.$ref) {
            connection = resolveRef(connection.$ref);
        }
        
        // Ensure connection has the required fields for validation
        if (connection) {
            // Make sure connection_config_id is available
            if (!connection.connection_config_id && connection.id) {
                connection.connection_config_id = connection.id;
            }
        }


        nodes.push({
            id: targetId,
            type: 'custom',
            position: { x: xPosition, y: yPosition },
            data: {
                label: 'Target',
                title: targetData?.name || targetTitle,
                icon: getNodeIcon('Target', selectedEngineType),
                ports: getNodePorts('Target'),
                transformationType: 'Target',
                transformationData: {
                    ...writerTransformation,
                    name: targetTitle,
                    write_options: writerTransformation.write_options || {
                        header: true,
                        sep: '|'
                    },
                    file_type: writerTransformation.file_type || 'csv'
                },
                source: {
                    name: targetData?.name || 'output',
                    target_type: connection?.connection_type === "PostgreSQL" ? 'Relational' : targetData?.target_type || 'File',
                    table_name: targetData?.table_name,
                    connection: connection,
                    file_name: targetData?.file_name || 'output.csv',
                    load_mode: targetData?.load_mode,
                    file_type: targetData?.file_type
                }
            },
            width: 56,
            height: 72
        });

        // Create edges based on dependencies
        if (writerTransformation.dependent_on && Array.isArray(writerTransformation.dependent_on)) {

            writerTransformation.dependent_on.forEach((dependentName: string, index: number) => {
                const sourceNodeId = transformationNodes.get(dependentName);

                if (sourceNodeId) {

                    edges.push({
                        source: sourceNodeId,
                        sourceHandle: 'output-0',
                        target: targetId,
                        targetHandle: `input-${index}`,
                        id: `reactflow__edge-${sourceNodeId}output-0-${targetId}input-${index}`
                    });
                } else {
                    console.warn(`Source node ID not found for target dependency: ${dependentName}`);
                }
            });
        } 
    }

    // Log the final edges array for debugging

    return await { nodes, edges };
};

/**
 * Converts the current pipeline JSON format to the optimized format with references
 * @param currentJson The current pipeline JSON
 * @returns The optimized pipeline JSON with references
 */
export const convertToOptimizedPipelineJson = (currentJson: any, pipelineName?: string) => {
    const optimizedJson: any = {
        $schema: currentJson.$schema || "https://json-schema.org/draft-07/schema#",
        name: pipelineName || currentJson.name || "pipeline",
        description: currentJson.description || "",
        version: currentJson.version || "1.0.0",
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
                // Extract connection details - merge custom_metadata with root level properties
                const customMetadata = source.connection.custom_metadata || {};
                const rootConnection = { ...source.connection };
                delete rootConnection.custom_metadata; // Remove custom_metadata to avoid duplication
                const connectionData = { ...customMetadata, ...rootConnection };
                
                // Only create connection if we have connection_type
                if (connectionData && connectionData.connection_type) {
                    const cleanConnection: any = {
                        name: connectionData.name || connectionKey,
                        connection_type: connectionData.connection_type
                    };
                    
                    // Add connection_config_id if it exists
                    if (connectionData.connection_config_id !== undefined && connectionData.connection_config_id !== null && connectionData.connection_config_id !== '') {
                        // Try to parse as integer, but keep original if parsing fails
                        const parsedId = parseInt(connectionData.connection_config_id, 10);
                        cleanConnection.connection_config_id = isNaN(parsedId) ? connectionData.connection_config_id : parsedId;
                    } 
                    
                    // Add file_path_prefix for file-based connections
                    if (connectionData.connection_type === 'Local' || connectionData.connection_type === 'S3') {
                        cleanConnection.file_path_prefix = connectionData.file_path_prefix || "";
                    }
                    
                    // Add S3-specific fields
                    if (connectionData.connection_type === 'S3') {
                        if (connectionData.bucket) cleanConnection.bucket = connectionData.bucket;
                        if (connectionData.secret_name) cleanConnection.secret_name = connectionData.secret_name;
                    }
                    
                    // Add database-specific fields for relational connections
                    if (connectionData.connection_type !== 'Local' && connectionData.connection_type !== 'S3') {
                        if (connectionData.database) cleanConnection.database = connectionData.database;
                        if (connectionData.schema) cleanConnection.schema = connectionData.schema;
                        if (connectionData.secret_name) cleanConnection.secret_name = connectionData.secret_name;
                    }
                    
                    connections[connectionKey] = cleanConnection;
                } else {
                    console.warn('Missing connection_type for source:', source.name, connectionData);
                }
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
                // Extract connection details - merge custom_metadata with root level properties
                const customMetadata = target.connection.custom_metadata || {};
                const rootConnection = { ...target.connection };
                delete rootConnection.custom_metadata; // Remove custom_metadata to avoid duplication
                const connectionData = { ...customMetadata, ...rootConnection };

                
                // Only create connection if we have connection_type
                if (connectionData && connectionData.connection_type) {
                    const cleanConnection: any = {
                        name: connectionData.name || connectionKey,
                        connection_type: connectionData.connection_type
                    };
                    
                    // Add connection_config_id if it exists
                    if (connectionData.connection_config_id !== undefined && connectionData.connection_config_id !== null && connectionData.connection_config_id !== '') {
                        // Try to parse as integer, but keep original if parsing fails
                        const parsedId = parseInt(connectionData.connection_config_id, 10);
                        cleanConnection.connection_config_id = isNaN(parsedId) ? connectionData.connection_config_id : parsedId;
                    }
                    
                    // Add file_path_prefix for file-based connections
                    if (connectionData.connection_type === 'Local' || connectionData.connection_type === 'S3') {
                        cleanConnection.file_path_prefix = connectionData.file_path_prefix || "";
                    }
                    
                    // Add S3-specific fields
                    if (connectionData.connection_type === 'S3') {
                        if (connectionData.bucket) cleanConnection.bucket = connectionData.bucket;
                        if (connectionData.secret_name) cleanConnection.secret_name = connectionData.secret_name;
                    }
                    
                    // Add database-specific fields for relational connections
                    if (connectionData.connection_type !== 'Local' && connectionData.connection_type !== 'S3') {
                        if (connectionData.database) cleanConnection.database = connectionData.database;
                        if (connectionData.schema) cleanConnection.schema = connectionData.schema;
                        if (connectionData.secret_name) cleanConnection.secret_name = connectionData.secret_name;
                    }
                    
                    // Add additional fields for targets
                    if (connectionData.type) cleanConnection.type = connectionData.type;
                    if (connectionData.connection_name) cleanConnection.connection_name = connectionData.connection_name;
                    
                    connections[connectionKey] = cleanConnection;
                } else {
                    console.warn('Missing connection_type for target:', target.name, connectionData);
                }
            }
            // Determine target type based on connection
            const connectionData = target.connection?.custom_metadata || target.connection;
            const isFileTarget = connectionData?.connection_type?.toLowerCase() === 'local' || 
                                connectionData?.connection_type?.toLowerCase() === 's3';
            
            // Add target to targets section with reference to connection
            optimizedJson.targets[targetKey] = {
                name: target.name || targetKey,
                target_type: isFileTarget ? 'File' : 'Relational',
                table_name: target.table_name || target.name || targetKey,
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
                        // Extract connection details - merge custom_metadata with root level properties
                        const customMetadata = transform.target.connection.custom_metadata || {};
                        const rootConnection = { ...transform.target.connection };
                        delete rootConnection.custom_metadata; // Remove custom_metadata to avoid duplication
                        const connectionData = { ...customMetadata, ...rootConnection };
                        

                        
                        // Only create connection if we have connection_type
                        if (connectionData && connectionData.connection_type) {
                            const cleanConnection: any = {
                                name: connectionData.name || connectionKey,
                                connection_type: connectionData.connection_type
                            };
                            
                            // Add connection_config_id if it exists
                            if (connectionData.connection_config_id !== undefined && connectionData.connection_config_id !== null && connectionData.connection_config_id !== '') {
                                // Try to parse as integer, but keep original if parsing fails
                                const parsedId = parseInt(connectionData.connection_config_id, 10);
                                cleanConnection.connection_config_id = isNaN(parsedId) ? connectionData.connection_config_id : parsedId;
                            }
                            // Add file_path_prefix for file-based connections
                            if (connectionData.connection_type === 'Local' || connectionData.connection_type === 'S3') {
                                cleanConnection.file_path_prefix = connectionData.file_path_prefix || "";
                            }
                            
                            // Add S3-specific fields
                            if (connectionData.connection_type === 'S3') {
                                if (connectionData.bucket) cleanConnection.bucket = connectionData.bucket;
                                if (connectionData.secret_name) cleanConnection.secret_name = connectionData.secret_name;
                            }
                            
                            // Add database-specific fields for relational connections
                            if (connectionData.connection_type !== 'Local' && connectionData.connection_type !== 'S3') {
                                if (connectionData.database) cleanConnection.database = connectionData.database;
                                if (connectionData.schema) cleanConnection.schema = connectionData.schema;
                                if (connectionData.secret_name) cleanConnection.secret_name = connectionData.secret_name;
                            }
                            
                            // Add additional fields for targets
                            if (connectionData.type) cleanConnection.type = connectionData.type;
                            if (connectionData.connection_name) cleanConnection.connection_name = connectionData.connection_name;
                            
                            connections[connectionKey] = cleanConnection;
                        } else {
                            console.warn('Missing connection_type for writer target:', transform.target.name, connectionData);
                        }
                    }
                    // Determine target type based on connection
                    const connectionData = transform.target.connection?.custom_metadata || transform.target.connection;
                    const isFileTarget = connectionData?.connection_type?.toLowerCase() === 'local' || 
                                        connectionData?.connection_type?.toLowerCase() === 's3';
                    
                    // Add target to targets section
                    optimizedJson.targets[targetKey] = {
                        name: transform.target.name || targetKey,
                        target_type: isFileTarget ? 'File' : 'Relational',
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



export const resolveRefs = (obj: any, root: any) => {
    // Handle null or undefined inputs
    if (obj === null || obj === undefined) return obj;
    if (root === null || root === undefined) return obj;

    // Handle non-object types
    if (typeof obj !== "object") return obj;

    if (Array.isArray(obj)) {
        return obj.map((item: any) => resolveRefs(item, root));
    }

    if (obj.$ref) {
        const refPath = obj.$ref.replace("#/", "").split("/");
        let resolved = root;

        for (const key of refPath) {
            if (!resolved || typeof resolved !== 'object') {
                console.error("Invalid $ref path:", obj.$ref, "at key:", key);
                return obj; // Return as is if reference is broken
            }
            resolved = resolved[key];
            if (!resolved) {
                console.error("Invalid $ref:", obj.$ref, "at key:", key);
                return obj; // Return as is if reference is broken
            }
        }
        return resolveRefs(resolved, root); // Recursively resolve further
    }

    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, resolveRefs(value, root)])
    );
};