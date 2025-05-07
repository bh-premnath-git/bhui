export interface Pipeline {
    pipeline_id: number;
    pipeline_name: string;
    pipeline_key: string;
    notes: string;
    tags: string[];
    bh_project_name: string;
    created_by: number;
    updated_at: string;
    pipeline_json: string[];
  }

export interface PipelinePaginatedResponse {
    data: Pipeline[];
    total: number;
    page: number;
}

export interface PipelineMutationData {
    pipeline_name: string;
    pipeline_key: string;
    notes: string;
    tags: string[];
    bh_project_name: string;
    pipeline_json: string[];
}
  