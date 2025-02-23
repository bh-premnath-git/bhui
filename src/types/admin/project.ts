export interface Project {
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number | null;
  is_deleted: boolean;
  deleted_by: number | null;
  bh_project_id: number;
  bh_project_name: string;
  bh_github_provider: number;
  bh_github_username: string;
  bh_github_email: string;
  bh_default_branch: string;
  bh_github_url: string;
  bh_github_token_url: string;
  status: 'active' | 'inactive';
  ytd_cost: number;
  current_month_cost: number;
  total_storage: number;
  tags: {
    tagList: string; // JSON stringified array of { key: string, value: string }
  };
  repo_name: string | null;
  total_data_sources: number;
}

export interface ProjectPaginatedResponse {
  data: Project[];
  total: number;
  page: number;
}

export interface ProjectMutationData {
  bh_project_name: string;
  bh_github_username: string;
  bh_github_email: string;
  bh_default_branch: string;
  bh_github_url: string;
  bh_github_token_url: string;
  bh_github_provider: number;
  tags?: {
      tagList: string; // JSON stringified array of { key: string, value: string }
  };
  status?: 'active' | 'inactive';
  init_vector?: string;
}

export interface ProjectGitValidation {
    bh_github_token_url: string;
    bh_github_provider: string;
    bh_github_username: string;
    bh_github_url: string;
    init_vector : string;
}
