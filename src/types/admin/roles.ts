export interface Role {
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  is_deleted: boolean;
  deleted_by: string | null;
  user_email: string;
  permissions: string[];
  bh_role_matrix_id: number;
  id: number;
  role_name: string;
}

export interface RoleMatrixEntry {
  id: number;
  role_name: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_deleted: boolean | null;
  deleted_by: string | null;
}