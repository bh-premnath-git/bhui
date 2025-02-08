export interface DataSourceMetadata {
  data_src_mtd_id: number;
  data_src_mtd_name: string;
  data_src_mtd_value: string;
  data_src_mtd_datatype_cd: number;
  data_src_mtd_type_cd: number;
  data_src_id: number;
  data_src_mtd_key: string;
}

export interface DataSource {
  id: string | null;
  data_src_name: string;
  description: string | null;
  project: string | null;
  totalRecords: number;
  quality: number;
  lastUpdated: string;
  owner: string | null;
  data_src_id: number;
  data_src_desc: string;
  data_src_tags: Record<string, string>;
  lake_zone_id: number;
  data_src_key: string;
  connection_config_id: string | null;
  bh_project_id: string | null;
  data_src_quality: string;
  data_src_status_cd: number;
  file_name: string | null;
  connection_type: string | null;
  file_path_prefix: string | null;
  bh_project_name: string | null;
  total_customer: number;
  data_source_metadata: DataSourceMetadata[];
}
