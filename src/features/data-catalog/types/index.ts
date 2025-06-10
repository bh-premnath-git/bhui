export interface Owner {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
}

export interface Link {
  url: string;
  title: string;
}

export interface AboutData {
  description?: string;
  owners?: Owner[];
  links?: Link[];
  tags?: string[];
}


export interface ProfileReportResponse {
  data_profile_id: number;
  data_src_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  status: string;
}

export interface ProfileApiResponse {
  data_profile_id: number;
  data_src_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  report_json: {
    analysis: {
      title: string;
      date_start: string;
      date_end: string;
    };
    time_index_analysis: string;
    table: {
      n: number;
      n_var: number;
      memory_size: number;
      record_size: number;
      n_cells_missing: number;
      n_vars_with_missing: number;
      n_vars_all_missing: number;
      p_cells_missing: number;
      types: {
        Numeric: number;
        Text: number;
        DateTime: number;
        Categorical: number;
      };
      n_duplicates: number;
      p_duplicates: number;
    };
    variables: Record<string, {
      n_distinct: number;
      p_distinct: number;
      is_unique: boolean;
      n_unique: number;
      p_unique: number;
      type: string;
      hashable: boolean;
      value_counts_without_nan?: Record<string, number>;
      value_counts_index_sorted?: Record<string, number>;
      ordering?: boolean;
      n_missing: number;
      n: number;
      p_missing: number;
      count: number;
      memory_size: number;
      mean?: number;
      std?: number;
      min?: number | string;
      max?: number | string;
      median?: number;
      histogram?: {
        counts: number[];
        bin_edges: number[] | string[];
      };
      distribution?: Array<{ range: string, count: number }>;
      [key: string]: any;
    }>;
  };
}

// Transformed data for our UI
export interface ProfileData {
  metadata: {
    name: string;
    description: string;
    lastUpdated: string;
    owner: string;
  };
  summary: {
    totalRows: number;
    totalColumns: number;
    missingCells: number;
    duplicateRows: number;
    dataQualityScore: number;
    memorySize: number;
    recordSize: number;
    varsWithMissing: number;
    varsAllMissing: number;
  };
  columnStats: any[];
}

export interface DataProfileProps {
  dataSourceId?: number;
}
