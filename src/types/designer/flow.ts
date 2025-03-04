import exp from "constants";

export interface FlowDeployment {
    flow_deployment_id: number;
    flow_id: number;
    bh_env_id: number;
    flow_version_id: number | null;
    schema_id: number;
    cron_expression: { cron: string } | string | null;
    flow_name: string | null;
    bh_env_name: string;
  }
  
  export interface FlowDefinition {
    created_at: string;
    updated_at: string;
    created_by: number;
    updated_by: number | null;
    is_deleted: boolean | null;
    deleted_by: number | null;
    flow_definition_id: number;
    flow_id: number;
    flow_json: string[];
  }
  
  export interface FlowConfig {
    flow_config_id: number;
    flow_id: number;
    flow_config: any[];
  }
  
  export interface Flow {
    flow_id: number;
    flow_name: string;
    flow_key: string;
    recipient_email: string[];
    notes: string;
    tags: {
      tagList: Record<string, string>[];
    };
    flow_deployment: FlowDeployment[];
    bh_project_name: string;
    created_by: number | null;
    updated_at: string;
    flow_config: FlowConfig[];
    flow_definition: FlowDefinition;
  }
  
export interface FlowPaginatedResponse {
    data: Flow[];
    total: number;
    page: number;
}   

export interface FlowMutationData {
    flow_name: string;
    flow_key?: string;
    recipient_email?: string[];
    notes?: string;
    tags?: {
      tagList: Record<string, string>[];
    };
    bh_project_id?: number;
    alert_settings?: {
      on_job_start?: boolean;
      on_job_failure?: boolean;
      on_job_success?: boolean;
      long_running?: boolean;
    };
    flow_json?: Record<string, any>;
    bh_env_id?: number;
}

export interface FlowAgentConversationResponse {
  thread_id: string;
  flow_id: string;
  request: string;
  response?: string;
  status?: 'success' | 'error' | 'missing';
  flow_definition?: string | Record<string, string[]>;
  operators?: string[];
  pipelines?: string[];
  created_at: string;
  updated_at: string;
} 

// playground
import { Node, Edge, ReactFlowInstance, NodeChange, EdgeChange } from "reactflow";

export type TriggerRule =
  | "all_success"
  | "all_failed"
  | "all_done"
  | "all_skipped"
  | "one_success"
  | "one_failed"
  | "one_done"
  | "none_failed"
  | "none_failed_min_one_success"
  | "none_skipped"
  | "always";

export interface BaseOperatorProperties {
  task_id: string;
  trigger_rule?: TriggerRule;
  depends_on?: string[];
}

export type OperatorType = "SimpleHttpOperator" | "HttpSensor" | "BashOperator" | "EmailOperator" | "S3KeySensor" | "SFTPToS3Operator" | any;

export interface ModuleType {
  id: number;
  label: string;
  color: string;
  icon: string;
  type: string;
  description: string;
  properties: any;
  operators: Array<{
    type: OperatorType;
    description: string;
    properties: BaseOperatorProperties;
  }>;
}

export interface SelectedOperator {
  type: OperatorType;
  description: string;
  moduleInfo: {
    icon: string;
    color: string;
    label: string;
  };
  properties: any;
}

export interface NodeToolBarRef {
  setEditing: (value: boolean) => void;
}

export interface Property {
  key: string;
  enum?: string[];
  description: string;
  ui_properties: {
    property_name: string;
    property_key: string;
    ui_type: string;
    group_key: string;
    language?: string;
    order?: number;
    default?: any;
    spancol?: number;
    mandatory: boolean;
    endpoint?: string;
  };
}

export interface GroupedProperties {
  property: Property[];
  settings: Property[];
  [key: string]: Property[];
}

export interface FormValues {
  [key: string]: any;
}
/**  */

export interface ModuleInfo {
  color: string;
  icon: string;
  label: string;
}

export interface MetaData {
  type: string;
  moduleInfo: ModuleInfo;
  properties: Record<string, any>;
  description: string;
  renameType?: string;
  fullyOptimized: boolean;
  [key: string]: any;
}

export interface CustomNodeData {
  label: string;
  type: string;
  status: string;
  meta: MetaData;
  selectedData: string | null;
  position?: { x: number; y: number };
  tempSave: boolean;
  requiredFields: any
}

export interface NodeFormData {
  nodeId: string;
  formData: Record<string, any>;
}

export interface EditingNode {
  id: string;
  label: string;
  content: string;
}

export interface FlowContextType {
  selectedFlowId: string | null;
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
  isPlaying: boolean;
  isDataPreviewOpen: boolean;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  selectedNode: Node<CustomNodeData> | null;
  nodeFormData: NodeFormData[];
  isSaving: boolean;
  isSaved: boolean;
  autoSave: boolean;
  editingNode: EditingNode | null;
  temporaryEdgeId: string | null;
  setNodes: React.Dispatch<React.SetStateAction<Node<CustomNodeData>[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  deleteEdgeBySourceTarget: (source: string, target: string) => void;
  togglePlayback: () => void;
  updateNodeDimensions: (nodeId: string, dimensions: { width: number; height: number }) => void;
  reactFlowInstance: ReactFlowInstance | null;
  setReactFlowInstance: (instance: ReactFlowInstance | null) => void;
  toggleDataPreview: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: () => void;
  deleteNode: (nodeId: string) => void;
  deleteSelectedNodes: () => void;
  cloneNode: (nodeId: string) => void;
  renameNode: (nodeId: string, newLabel: string) => void;
  showNodeInfo: (nodeId: string) => void;
  updatedSelectedNodeId: (newNodeId: string, data: string) => void;
  selectNode: (nodeId: string) => void;
  updateNodeFormData: (nodeId: string, formData: Record<string, any>) => void;
  getNodeFormData: (nodeId: string) => Record<string, any> | undefined;
  prevNodeFn: (nodeId: string) => string[] | undefined;
  setEditingNode: (node: EditingNode | null) => void;
  setTemporaryEdgeId: (id: string | null) => void;
  toggleAutoSave: () => void;
  saveFlow: () => Promise<void>;
  addNode: (data: {
    id: string;
    type: string;
    data: CustomNodeData;
  }) => void;
  updateNodeMeta: (nodeId: string, newMeta: Partial<MetaData>, newData?: any) => void;
  revertOrSaveData: (nodeId: string, save: boolean) => void;
  setSelectedFlowId: (flowId: string) => void;
  isDirty: boolean;
  selectedNodeConnection: (flowId: string) => {
    selected: {
      nodeData: any | null;
      nodeForm: any | null;
    };
    previous: {
      nodeData: any | null;
      nodeForm: any | null;
    }[];
    next: {
      nodeData: any | null;
      nodeForm: any | null;
    }[];
  }
  selectedNodeOptimized: (flowId: string) => void;
  fullFlowOptimizzed: () => boolean;
  formdataNum: number;
  setFormDataNum: React.Dispatch<React.SetStateAction<number>>;
  setAiflowStrructre: (data: any) => void;
  setConsequentTaskDetail: (task: any, detail: any) => void;
  aiMissingData?: any;
  setAiMissingData?: React.Dispatch<React.SetStateAction<any>>;
  updateNodeDependencies: () => void;
  clearFlow: () => void;
}