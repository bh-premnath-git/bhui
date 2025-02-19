export interface DataSourceMetadata {
    data_src_mtd_id: number;
    data_src_mtd_name: string;
    data_src_mtd_value: string;
    data_src_mtd_datatype_cd: number;
    data_src_mtd_type_cd: number;
    data_src_id: number;
    data_src_mtd_key: string;
  }
  
  export interface DataSourceLayout {
    data_src_lyt_id: number;
    data_src_lyt_name: string;
    data_src_lyt_fmt_cd: number;
    data_src_lyt_delimiter_cd: number;
    data_src_lyt_cust_delimiter: string | null;
    data_src_lyt_header: boolean;
    data_src_lyt_encoding_cd: number;
    data_src_lyt_quote_chars_cd: number;
    data_src_lyt_escape_chars_cd: number;
    data_src_lyt_regex: string;
    data_src_lyt_pk: boolean;
    data_src_lyt_total_records: number | null;
    data_src_lyt_type_cd: number;
    data_src_lyt_is_mandatory: boolean;
  }
  
  export interface DataSource {
    created_at: string;
    updated_at: string;
    created_by: number | null;
    updated_by: number | null;
    is_deleted: boolean | null;
    deleted_by: number | null;
    data_src_id: number;
    data_src_name: string;
    data_src_desc: string;
    data_src_tags: Record<string, string>;
    lake_zone_id: number;
    data_src_key: string;
    connection_config_id: number | null;
    bh_project_id: number;
    data_src_quality: string;
    data_src_status_cd: number;
    file_name: string | null;
    connection_type: string | null;
    file_path_prefix: string | null;
    data_source_metadata: DataSourceMetadata[];
    bh_project_name: string;
    total_records: number;
    total_customer: number;
    data_source_layout: DataSourceLayout[];
  }
  
    export interface DataSourcePaginatedResponse {
        data: DataSource[];
        total: number;
        page: number;
    }

    export interface DataSourceMutationData {
        data_src_name: string;
        data_src_desc: string;
        bh_project_id: number;
        data_src_quality: string;
        total_records: number;
        total_customer: number;
    }
