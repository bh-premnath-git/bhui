import exp from "constants";

export interface FlowDeployment {
    flow_deployment_id: number;
    flow_id: number;
    bh_env_id: number;
    flow_version_id: number | null;
    schema_id: number;
    cron_expression: string | null;
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
  
  export interface Flow {
    flow_id: number;
    flow_name: string;
    flow_key: string;
    recipient_email: string[];
    notes: string;
    tags: {
      tagList: string[];
    };
    flow_deployment: FlowDeployment[];
    bh_project_name: string;
    created_by: number | null;
    updated_at: string;
    flow_config: string[];
    flow_definition: FlowDefinition;
  }
  
export interface FlowPaginatedResponse {
    data: Flow[];
    total: number;
    page: number;
}   

export interface FlowMutationData {
    flow_name: string;
    flow_key: string;
    recipient_email: string[];
    notes: string;
    tags: {
      tagList: string[];
    };
    bh_project_name: string;
    flow_config: string[];
    flow_definition: FlowDefinition;
}   
