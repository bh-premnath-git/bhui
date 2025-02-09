export interface Project {
  id: number;
  bh_project_name: string;
  ytd_cost: number;
  current_month_cost: number;
  total_storage: number;
  total_data_sources: number;
  status: 'active' | 'archived';
}

export interface ProjectTableProps {
  projects: Project[];
}