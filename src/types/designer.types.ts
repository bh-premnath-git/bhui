export interface Pipeline {
  pipeline_id: string | number;
  pipeline_name: string;
  description: string | null;
  status: 'active' | 'inactive' | 'draft';
  lastModified: string | null;
  pipeline_key: string;
  notes: string | null;
  tags: Record<string, string> | null;
  bh_project_name: string;
  created_by: string | null;
  updated_at: string | null;
  pipeline_json: Record<string, any> | null;
}


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
  flow_json: Record<string, any>;
}

export interface Flow {
  flow_id: number;
  flow_name: string;
  flow_key: string;
  recipient_email: {
    email: string[];
  };
  notes: string;
  tags: {
    tagList: Record<string, string>[];
  };
  flow_deployment: FlowDeployment[];
  bh_project_name: string;
  created_by: number | null;
  updated_at: string;
  flow_config: any[];
  flow_definition: FlowDefinition;
}
