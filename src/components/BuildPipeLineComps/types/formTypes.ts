export interface Schema {
  type: string;
  ui_type?: string;
  properties: Record<string, any>;
  items?: any;
  minItems?: number;
  required?: boolean;
  enum?: string[];
  description?: string;
}

export interface FormValues {
  conditions: Array<{
    join_input: string;
    join_condition: string;
    join_type: string;
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
}

export interface CreateFormProps {
  schema: Schema;
  onSubmit: (data: FormValues) => void;
  initialValues?: Partial<FormValues>;
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


export interface Schema {
  title: string;
  nodeId?: string;
  [key: string]: any;
}