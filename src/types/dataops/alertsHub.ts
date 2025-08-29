export interface MonitorTemplate {
    monitor_template_id: number;
    kpi_code_value: number;
    monitor_template_name: string;
    monitor_template_business_key: string;
    monitor_description: string;
    sql_template: string;
    input_parameters: string[];
    monitor_type: string;
    created_by: string;
    updated_by: string;
    created_on: string;
    updated_on: string;
  }
  
  export interface Monitor {
    monitor_id: string;
    monitor_template_id: number;
    input_parameters: string[];
    tags: string[];
    flow_id: number;
    flow_name: string;
    flow_key: string;
    flow_status: string;
    monitor_description: string;
    monitor_type: string;
    project_id: string;
    project_name: string;
    status: string;
    created_by: string;
    updated_by: string | null;
    created_on: string | null;
    updated_on: string | null;
    monitor_template_data: MonitorTemplate;
  }
  
  export interface AlertHub {
    alert_id: string;
    alert_key: string;
    monitor_id: string;
    alert_description: string;
    alter_status: string;
    flow_id: number;
    flow_name: string;
    flow_key: string;
    flow_status: string;
    project_id: number;
    project_name: string;
    assigned_to: string;
    resolution_reason: string[] | null;
    created_by: string;
    updated_by: string | null;
    created_on: string;
    updated_on: string | null;
    monitor: Monitor;
  }
  