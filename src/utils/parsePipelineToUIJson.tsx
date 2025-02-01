// Type definitions for better type safety
interface Position {
    x: number;
    y: number;
}

interface NodePort {
    inputs: number;
    outputs: number;
    maxInputs: number | 'unlimited';
}

interface TransformationData {
    sql?: string;
    condition?: string;
    conditions?: any[];
    derived_fields?: any[];
    sort_columns?: any[];
    group_by?: string[];
    aggregations?: any[];
    pivot_by?: any[];
    expressions?: any[];
    advanced?: any;
    dq_rules?: any[];
    keep?: string;
    dedup_by?: string[];
    order_by?: any[];
    repartition_type?: string;
    repartition_value?: number;
    operation_type?: string;
    allow_missing_columns?: boolean;
}

interface NodeData {
    label: string;
    icon: string;
    ports: NodePort;
    transformationType: string;
    transformationData: TransformationData;
    color: string;
    metadata: {
        level: number;
        description: string;
        parameters: any[];
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
    };
}

// Layout manager with improved positioning strategies
class LayoutManager {
    private readonly baseYPosition: number = 100;
    private readonly xGap: number = 250;
    private readonly yGap: number = 150;
    private readonly levelNodes: Map<number, number>;

    constructor() {
        this.levelNodes = new Map();
    }

    public getPosition(level: number, index: number): Position {
        const nodesInLevel = this.levelNodes.get(level) || 0;
        this.levelNodes.set(level, nodesInLevel + 1);

        return {
            x: level * this.xGap,
            y: this.baseYPosition + (index * this.yGap) - ((nodesInLevel * this.yGap) / 2)
        };
    }

    public optimizeLayout(nodes: FlowNode[]): void {
        // Group nodes by level
        const levelGroups = new Map<number, FlowNode[]>();
        nodes.forEach(node => {
            const level = node.data.metadata.level;
            if (!levelGroups.has(level)) {
                levelGroups.set(level, []);
            }
            levelGroups.get(level)?.push(node);
        });

        // Adjust vertical positions within each level
        levelGroups.forEach((levelNodes, level) => {
            const totalHeight = levelNodes.length * this.yGap;
            const startY = this.baseYPosition - (totalHeight / 2);
            levelNodes.forEach((node, index) => {
                node.position.y = startY + (index * this.yGap);
            });
        });
    }
}

// Node configuration manager
class NodeConfigManager {
    private static readonly nodeConfigs: { [key: string]: any } = {
        Reader: {
            color: '#f7a01f',
            icon: '/assets/buildPipeline/6.svg',
            ports: { inputs: 0, outputs: 1, maxInputs: 0 }
        },
        Target: {
            color: '#07a260',
            icon: '/assets/buildPipeline/7.svg',
            ports: { inputs: 1, outputs: 0, maxInputs: 1 }
        },
        Filter: {
            color: '#f5bc2a',
            icon: '/assets/buildPipeline/display/filter.svg',
            ports: { inputs: 1, outputs: 1, maxInputs: 1 }
        },
        Joiner: {
            color: '#ff7396',
            icon: '/assets/buildPipeline/display/join.svg',
            ports: { inputs: 2, outputs: 1, maxInputs: 'unlimited' }
        },
        SchemaTransformation: {
            color: '#32D1A4',
            icon: '/assets/buildPipeline/28.svg',
            ports: { inputs: 1, outputs: 1, maxInputs: 1 }
        },
        Sorter: {
            color: '#219fe7',
            icon: '/assets/buildPipeline/squre/1.svg',
            ports: { inputs: 1, outputs: 1, maxInputs: 1 }
        },
        Aggregator: {
            color: '#d43faa',
            icon: '/assets/buildPipeline/squre/2.svg',
            ports: { inputs: 1, outputs: 1, maxInputs: 1 }
        },
        'DQ Check': {
            color: '#32D1A4',
            icon: '/assets/buildPipeline/squre/4.svg',
            ports: { inputs: 1, outputs: 1, maxInputs: 1 }
        },
        Dedup: {
            color: '#32D1A4',
            icon: '/assets/buildPipeline/squre/5.svg',
            ports: { inputs: 1, outputs: 1, maxInputs: 1 }
        },
        Repartition: {
            color: '#32D1A4',
            icon: '/assets/buildPipeline/squre/6.svg',
            ports: { inputs: 1, outputs: 1, maxInputs: 1 }
        },
        'SQL Transformation': {
            color: '#32D1A4',
            icon: '/assets/buildPipeline/squre/7.svg',
            ports: { inputs: 1, outputs: 1, maxInputs: 1 }
        },
        Union: {
            color: '#32D1A4',
            icon: '/assets/buildPipeline/squre/8.svg',
            ports: { inputs: 2, outputs: 1, maxInputs: 'unlimited' }
        }
    };

    public static getNodeConfig(type: string) {
        return this.nodeConfigs[type] || this.nodeConfigs['Filter']; // Default to Filter config
    }
}

export const parsePipelineToUIJson = (pipelineJson: any) => {
    const nodes: FlowNode[] = [];
    const edges: FlowEdge[] = [];
    const layoutManager = new LayoutManager();
    const transformationMap = new Map<string, string>();

    // Create node with proper configuration
    const createNode = (
        id: string,
        type: string,
        label: string,
        level: number,
        transformationData: TransformationData = {}
    ): FlowNode => {
        const nodeConfig = NodeConfigManager.getNodeConfig(type);
        const position = layoutManager.getPosition(level, nodes.length);

        return {
            id,
            type: "custom",
            position,
            data: {
                label,
                icon: nodeConfig.icon,
                ports: nodeConfig.ports,
                color: nodeConfig.color,
                transformationType: type,
                transformationData,
                metadata: {
                    level,
                    description: "",
                    parameters: []
                }
            },
            width: 56,
            height: 72
        };
    };

    // Process sources first
    if (pipelineJson.sources) {
        pipelineJson.sources.forEach((source: any, index: number) => {
            const nodeId = `Reader_${index + 1}`;
            const node = createNode(nodeId, 'Reader', source.name, 0, source);
            nodes.push(node);
            transformationMap.set(`read_${source.name}`, nodeId);
        });
    }

    // Process transformations
    if (pipelineJson.transformations) {
        pipelineJson.transformations.forEach((transform: any, index: number) => {
            if (transform.transformation === 'Reader') return;

            const nodeId = `${transform.transformation}_${index + 1}`;
            transformationMap.set(transform.name, nodeId);

            const node = createNode(
                nodeId,
                transform.transformation,
                transform.name,
                index + 1,
                transform
            );
            nodes.push(node);

            // Create edges for dependencies
            transform.dependent_on.forEach((dependentName: string, inputIndex: number) => {
                const sourceId = transformationMap.get(dependentName);
                if (sourceId) {
                    edges.push({
                        id: `edge-${sourceId}-${nodeId}-${inputIndex}`,
                        source: sourceId,
                        target: nodeId,
                        sourceHandle: 'output-0',
                        targetHandle: `input-${inputIndex}`,
                        type: 'smoothstep',
                        data: {
                            transformationType: transform.transformation,
                            connectionType: 'default'
                        }
                    });
                }
            });
        });
    }

    // Process targets
    if (pipelineJson.targets) {
        pipelineJson.targets.forEach((target: any, index: number) => {
            const nodeId = `Target_${index + 1}`;
            const node = createNode(nodeId, 'Target', target.name, nodes.length, target);
            nodes.push(node);

            // Connect last transformation to target
            const lastTransformation = findLastTransformation(nodes);
            if (lastTransformation) {
                edges.push({
                    id: `edge-${lastTransformation.id}-${nodeId}`,
                    source: lastTransformation.id,
                    target: nodeId,
                    sourceHandle: 'output-0',
                    targetHandle: 'input-0',
                    type: 'smoothstep',
                    data: {
                        transformationType: 'Target',
                        connectionType: 'default'
                    }
                });
            }
        });
    }

    // Optimize final layout
    layoutManager.optimizeLayout(nodes);

    return { nodes, edges };
};

// Helper function to find the last transformation node
const findLastTransformation = (nodes: FlowNode[]): FlowNode | undefined => {
    return nodes
        .filter(node => node.data.transformationType !== 'Target')
        .reduce((prev, current) => {
            if (!prev) return current;
            return current.data.metadata.level > prev.data.metadata.level ? current : prev;
        }, undefined);
};
