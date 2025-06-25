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
  
  export interface DataOpsHubListResponse {
    data: DataOpsHub[];
    limit: number;
    next: boolean;
    offset: number;
    prev: boolean;
    total: number;
  }
  
  export interface TaskMetadata {
    priority: number;
    task_type: string;
    retry_count: number;
    task_log_url: string;
  }
  
  export interface TaskStatistics {
    memory_usage_mb: number;
    records_processed: number;
    processing_time_ms: number;
  }
  
  export interface JobMetadata {
    job_type: string;
    environment: string;
  }
  
  export interface TaskDetails {
    task_id: string;
    job_id: string;
    task_name: string;
    task_status: string;
    task_metadata: TaskMetadata;
    task_statistics: TaskStatistics;
    job_metadata: JobMetadata;
    input_data: string;
    output_data: string;
    trace_id: string;
    task_start_time: string; 
    task_end_time: string; 
    created_at: string; 
    created_by: string;
    updated_at: string; 
    updated_by: string;
  }

  export interface TaskDetailsListResponse {
    data: TaskDetails[];
    limit: number;
    next: boolean;
    offset: number;
    prev: boolean;
    total: number;
  }