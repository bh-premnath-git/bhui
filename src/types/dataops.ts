// types.ts
export interface DataOpItem {
    job_id: string;
    project_name: string;
    pipeline_name: string;
    zone_name: string;
    pipeline_status: 'Success' | 'Failed' | 'In Progress' | string;
    // Add other relevant fields here
  }
  
  export interface PipelineStatusCounts {
    Success: number;
    Failed: number;
    InProgress: number;
  }
  