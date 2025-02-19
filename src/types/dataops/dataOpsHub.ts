export interface DataOpsHub {
    job_id: string;
    flow_name: string;
    flow_status: string;
    flow_id: number;
    batch_id: number;
    flow_type: string;
    input_data_path: string;
    output_data_path: string;
    project_name: string;
    project_id: string;
    tags: string[];
    trace_id: string;
    job_statistics: string[];
    job_start_time: string;
    job_end_time: string;
    created_at: string;
    created_by: string;
    updated_at: string;
    updated_by: string;
  }
  
  