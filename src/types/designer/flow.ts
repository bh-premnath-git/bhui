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
  flow_json: any;
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
  recipient_email?: { emails?: string[] };
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
  bh_airflow_id?: number;
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
import { Node, Edge, ReactFlowInstance, NodeChange, EdgeChange } from "@xyflow/react";

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
    requiredFields: string[];
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
  parameters?: Property[];
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
  selectedData: any;
  position?: { x: number; y: number };
  tempSave: boolean;
  requiredFields: any;
  [key: string]: any;
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
  setNodes: React.Dispatch<React.SetStateAction<Node<CustomNodeData>[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  isPlaying: boolean;
  togglePlayback: () => void;
  updateNodeDimensions: (nodeId: string, dimensions: { width: number; height: number }) => void;
  reactFlowInstance: ReactFlowInstance | null;
  setReactFlowInstance: React.Dispatch<React.SetStateAction<ReactFlowInstance | null>>;
  isDataPreviewOpen: boolean;
  toggleDataPreview: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  deleteEdgeBySourceTarget: (source: string, target: string) => void;
  fitView: () => void;
  cloneNode: (nodeId: string) => void;
  deleteSelectedNodes: () => void;
  deleteNode: (nodeId: string) => void;
  renameNode: (nodeId: string, newName: string) => void;
  showNodeInfo: (nodeId: string) => void;
  selectedNode: Node<CustomNodeData> | null;
  selectNode: (nodeId: string) => void;
  nodeFormData: NodeFormData[];
  getNodeFormData: (nodeId: string) => any;
  prevNodeFn: (nodeId: string) => string[] | undefined;
  updateNodeFormData: (nodeId: string, data: any) => void;
  isSaving: boolean;
  isSaved: boolean;
  autoSave: boolean;
  editingNode: EditingNode | null;
  temporaryEdgeId: string | null;
  setEditingNode: React.Dispatch<React.SetStateAction<EditingNode | null>>;
  setTemporaryEdgeId: React.Dispatch<React.SetStateAction<string | null>>;
  toggleAutoSave: () => void;
  saveFlow: () => void;
  addNode: (data: { id: string; type: string; tempSave: boolean; data: CustomNodeData }) => void;
  updateNodeMeta: (nodeId: string, meta: any) => void;
  setSelectedFlowId: React.Dispatch<React.SetStateAction<string | null>>;
  revertOrSaveData: (nodeId: string, save: boolean) => void;
  selectedNodeConnection: (nodeId: string) => any;
  selectedNodeOptimized: (nodeId: string) => void;
  fullFlowOptimizzed: () => boolean;
  isDirty: boolean;
  formdataNum: number;
  setFormDataNum: React.Dispatch<React.SetStateAction<number>>;
  setAiflowStrructre: (data: string) => void;
  setConsequentTaskDetail: (task: any, detail: any) => void;
  aiMissingData: any;
  setAiMissingData: React.Dispatch<React.SetStateAction<any>>;
  updateNodeDependencies: () => void;
  clearFlow: () => void;
  hasFlowConfig: boolean;
  flowConfigMap: Record<string, any>;
  flowPipeline: any | null;
  setFlowPipeline: React.Dispatch<React.SetStateAction<any | null>>;
  getPipelineDetails: (pipelineName: string | null) => any;
  setSelectedNode: React.Dispatch<React.SetStateAction<Node<CustomNodeData> | null>>;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSaved: React.Dispatch<React.SetStateAction<boolean>>;
  setNodeFormData: React.Dispatch<React.SetStateAction<NodeFormData[]>>;
  addNodeToHistory: () => void;
  handleNodeClick: (node: any, source?: any) => void;
  setUnsavedChanges: () => void;
  history: Array<{ nodes: Node<CustomNodeData>[]; edges: Edge[] }>;
  redoStack: Array<{ nodes: Node<CustomNodeData>[]; edges: Edge[] }>;
  setHistory: React.Dispatch<React.SetStateAction<Array<{ nodes: Node<CustomNodeData>[]; edges: Edge[] }>>>;
  setRedoStack: React.Dispatch<React.SetStateAction<Array<{ nodes: Node<CustomNodeData>[]; edges: Edge[] }>>>;
}