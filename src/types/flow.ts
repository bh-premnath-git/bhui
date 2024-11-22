export type TriggerRule =
  | "all_success"
  | "all_failed"
  | "all_done"
  | "all_skipped"
  | "one_success"
  | "one_failed"
  | "one_done"
  | "none_failed"
  | "none_failed_min_one_success"
  | "none_skipped"
  | "always";

export interface BaseOperatorProperties {
  task_id: string;
  trigger_rule?: TriggerRule;
  depends_on?: string[];
}

export type OperatorType = "SimpleHttpOperator" | "HttpSensor" | "BashOperator" | "EmailOperator" | "S3KeySensor" | "SFTPToS3Operator";

export interface ModuleType {
  id: number;
  label: string;
  color: string;
  icon: string;
  operators: Array<{
    type: OperatorType;
    description: string;
    properties: BaseOperatorProperties;
  }>;
}

export interface SelectedOperator {
  type: OperatorType;
  description: string;
  moduleInfo: {
    icon: string;
    color: string;
    label: string;
  };
  properties: BaseOperatorProperties;
}

export interface NodeToolBarRef {
  setEditing: (value: boolean) => void;
}

export interface Property {
  key: string;
  enum?: string[];
  ui_properties: {
    property_name: string;
    property_key: string;
    ui_type: string;
    group_key: string;
    language?: string;
    order?: number;
    spancol?:number;
    mandatory:boolean;
    endpoint?: string;
  };
}

export interface GroupedProperties {
  property: Property[];
  settings: Property[];
  [key: string]: Property[];
}

export interface FormValues {
  [key: string]: any;
}