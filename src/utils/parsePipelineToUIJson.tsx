// Type definitions for better type safety
interface Position {
    x: number;
    y: number;
}

interface NodePort {
    inputs: number;
    outputs: number;
    maxInputs: number;
}

interface TransformationConfig {
    condition?: string;
    conditions?: any[];
    derived_fields?: any[];
    sort_columns?: any[];
    group_by?: string[];
    aggregate?: any[];
    pivot?: any[];
    expressions?: any[];
    advanced?: any;
}

interface NodeData {
    label: string;
    icon: string;
    ports: NodePort;
    transformationType: string;
    transformationData: any;
    metadata: {
        level: number;
        description: string;
        parameters: any[];
        config?: TransformationConfig;
    };
}

interface FlowNode {
    id: string;
    type: string;
    position: Position;
    data: NodeData;
    width: number;
    height: number;
}

interface FlowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle: string;
    targetHandle: string;
    type: string;
    data?: {
        transformationType: string;
        connectionType: string;
        metadata?: any;
    };
}

// Enhanced layout manager with better positioning strategies
class LayoutManager {
    private readonly baseYPosition: number = 100;
    private readonly xGap: number = 200;
    private readonly yGap: number = 120;
    private levelWidths: Map<number, number>;

    constructor() {
        this.levelWidths = new Map();
    }

    public getPosition(level: number, nodesInLevel: number): Position {
        const levelWidth = this.levelWidths.get(level) || 0;
        this.levelWidths.set(level, levelWidth + 1);

        return {
            x: this.xGap * level,
            y: this.baseYPosition + (nodesInLevel * this.yGap)
        };
    }

    public optimizeLayout(nodes: FlowNode[]): void {
        // Center nodes vertically within their levels
        const levelGroups = new Map<number, FlowNode[]>();
        nodes.forEach(node => {
            const level = node.data.metadata.level;
            if (!levelGroups.has(level)) {
                levelGroups.set(level, []);
            }
            levelGroups.get(level)?.push(node);
        });

        levelGroups.forEach((levelNodes, level) => {
            const totalHeight = levelNodes.length * this.yGap;
            const startY = (this.baseYPosition - totalHeight / 2) + this.yGap;
            levelNodes.forEach((node, index) => {
                node.position.y = startY + (index * this.yGap);
            });
        });
    }
}

const getIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
        Reader: '/assets/buildPipeline/6.svg',
        Filter: '/assets/buildPipeline/display/filter.svg',
        Joiner: '/assets/buildPipeline/display/join.svg',
        Lookup: '/assets/buildPipeline/squre/3.svg',
        SchemaTransformation: '/assets/buildPipeline/28.svg',
        Sorter: '/assets/buildPipeline/squre/1.svg',
        Aggregator: '/assets/buildPipeline/squre/2.svg',
        Target: '/assets/buildPipeline/7.svg',
        // Add other mappings as needed
    };
    return iconMap[type] || '/assets/buildPipeline/default.svg';
};

export const parsePipelineToUIJson = (pipelineJson: any) => {
    const nodes: FlowNode[] = [];
    const edges: FlowEdge[] = [];
    const layoutManager = new LayoutManager();
    const transformationMap = new Map<string, string>();
    const levelMap = new Map<number, number>();

    // Enhanced node creation with better configuration handling
    const createNode = (
        id: string,
        type: string,
        label: string,
        level: number,
        config: any = {}
    ): FlowNode => {
        const nodesInLevel = levelMap.get(level) || 0;
        levelMap.set(level, nodesInLevel + 1);

        const position = layoutManager.getPosition(level, nodesInLevel);

        const ports = {
            inputs: calculateInputPorts(type, config),
            outputs: type === "Target" ? 0 : 1,
            maxInputs: type === "Joiner" ? 2 : 1
        };

        return {
            id,
            type: "custom",
            position,
            data: {
                label,
                icon: getIcon(type),
                ports,
                transformationType: type,
                transformationData: config,
                metadata: {
                    level,
                    description: config.description || "",
                    parameters: config.parameters || [],
                    config: extractTransformationConfig(type, config)
                }
            },
            width: 56,
            height: 72
        };
    };

    // Helper function to calculate input ports based on transformation type
    const calculateInputPorts = (type: string, config: any): number => {
        switch (type) {
            case "Joiner":
            case "Lookup":
                return 2;
            case "Reader":
                return 0;
            default:
                return 1;
        }
    };

    // Helper function to extract relevant configuration based on transformation type
    const extractTransformationConfig = (type: string, config: any): TransformationConfig => {
        const baseConfig: TransformationConfig = {};

        switch (type) {
            case "Filter":
                baseConfig.condition = config.condition;
                break;
            case "Joiner":
                baseConfig.conditions = config.conditions;
                baseConfig.expressions = config.expressions;
                baseConfig.advanced = config.advanced;
                break;
            case "SchemaTransformation":
                baseConfig.derived_fields = config.derived_fields;
                break;
            case "Sorter":
                baseConfig.sort_columns = config.sort_columns;
                break;
            case "Aggregator":
                baseConfig.group_by = config.group_by;
                baseConfig.aggregate = config.aggregate;
                baseConfig.pivot = config.pivot;
                break;
        }

        return baseConfig;
    };

    // Process transformations sequentially
    const processTransformations = () => {
        if (!pipelineJson.transformations) return;

        pipelineJson.transformations.forEach((transform: any, index: number) => {
            const nodeId = `${transform.transformation}_${transform.name}`;
            transformationMap.set(transform.name, nodeId);

            // Set level based on sequence (index)
            const level = index + 1;

            nodes.push(createNode(nodeId, transform.transformation, transform.name, level, transform));

            // Create edges to previous node
            if (index > 0) {
                const previousTransform = pipelineJson.transformations[index - 1];
                const sourceId = transformationMap.get(previousTransform.name);

                if (sourceId) {
                    const targetHandle = transform.transformation === "Joiner"
                        ? "input-0"  // First input for Joiner
                        : "input-0";

                    edges.push({
                        source: sourceId,
                        sourceHandle: "output-0",
                        target: nodeId,
                        targetHandle: targetHandle,
                        id: `edge-${sourceId}-${nodeId}-0`,
                        type: "smoothstep",
                        data: {
                            transformationType: transform.transformation,
                            connectionType: "default"
                        }
                    });

                    // For Joiner, add second connection if lookup_data is specified
                    if (transform.transformation === "Joiner" || transform.transformation === "Lookup") {
                        const lookupNodeId = transformationMap.get(transform.lookup_data);
                        if (lookupNodeId) {
                            edges.push({
                                source: lookupNodeId,
                                sourceHandle: "output-0",
                                target: nodeId,
                                targetHandle: "input-1",
                                id: `edge-${lookupNodeId}-${nodeId}-1`,
                                type: "smoothstep",
                                data: {
                                    transformationType: transform.transformation,
                                    connectionType: "lookup"
                                }
                            });
                        }
                    }
                }
            }
        });
    };

    // Process the transformations
    processTransformations();

    // Optimize final layout
    layoutManager.optimizeLayout(nodes);

    return { nodes, edges };
};

// Helper function to find appropriate source for target connection
const findAppropriateSourceForTarget = (nodes: FlowNode[], target: any): FlowNode | undefined => {
    const transformationNodes = nodes.filter(n =>
        n.data.transformationType !== "Target" &&
        n.data.ports.outputs > 0
    );

    return transformationNodes.reduce((prev, current) => {
        if (!prev) return current;
        return current.data.metadata.level > prev.data.metadata.level ? current : prev;
    }, undefined);
};
