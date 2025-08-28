export interface Schema {
  type: string;
  ui_type?: string;
  properties: Record<string, any>;
  items?: any;
  minItems?: number;
  required?: string[];
  enum?: string[];
  description?: string;
  title?: string;
  nodeId?: string;
  anyOf?: any[];
  [key: string]: any;
}

export interface FormValues {
  condition?: string;
  conditions: Array<{
    join_input: string;
    join_condition: string;
    join_type: string;
  }>;
  derived_fields?: Array<{
    name: string;
    expression: string;
  }>;
  sort_columns?: Array<{
    column: string;
    order: string;
  }>;
  expressions: Array<{
    name: string;
    expression: string;
  }>;
  advanced: {
    hints: Array<{
      join_input: string;
      hint_type: string;
      propagate_all_columns: boolean;
    }>;
  };
  aggregations?: Array<{
    target_column: string;
    expression: string;
  }>;
  aggregate?: Array<{
    target_column: string;
    expression: string;
  }>;
  group_by?: Array<{
    group_by: string;
  }>;
  pivot_by?: Array<{
    pivot_column: string;
    pivot_values: string[];
  }>;
  pivot?: Array<{
    pivot_column: string;
    pivot_values: string[];
  }>;
}

export interface CreateFormProps {
  schema: Schema;
  onSubmit: (data: FormValues) => void;
  initialValues?: Partial<FormValues>;
  enableReinitialize?: boolean;
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface Node {
  ui_properties: UIProperties;
  [key: string]: any;
}

export interface UIProperties {
  color: string;
  icon: string;
  module_name: string;
  ports: any;
}

export type ArraySchema = {
  type: string;
  items: Record<string, any>;
  minItems?: number;
};
