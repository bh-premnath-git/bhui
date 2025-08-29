export interface ProjectGithub {
  bh_project_github_id: number;
  bh_project_id: number;
  bh_github_url: string;
  bh_github_username: string;
  bh_github_token_url: string;
  bh_default_branch: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string | null;
  is_deleted: boolean;
  deleted_by: string | null;
  tenant_key: string;
}

export interface Project {
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number | null;
  is_deleted: boolean;
  deleted_by: number | null;
  bh_project_id: number;
  bh_project_name: string;
  bh_project_key: string;
  bh_project_description: string | null;
  status: 'active' | 'inactive';
  bh_github_provider: number;
  tags: {
    tagList: string; // JSON stringified array of { key: string, value: string }
  };
  github: ProjectGithub;
  tenant_key: string;
  total_data_sources: number;
  init_vector: string | null;
  [key: string]: any;
}

export interface ProjectPaginatedResponse {
  data: Project[];
  total: number;
  offset: number;
  page: number;
  limit: number;
  prev: boolean;
  next: boolean;
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
