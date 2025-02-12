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
