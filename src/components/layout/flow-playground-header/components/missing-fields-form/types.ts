export interface MissingFieldsFormProps {
  flowDefinition: Record<string, string[]>;
  onSubmit: (values: Record<string, Record<string, string>>) => void;
  initialValues?: Record<string, Record<string, string>>;
}

export interface FieldTypeInfo {
  type: string;
  required: boolean;
  uiProperties?: {
    propertyName?: string;
    uiType?: string;
    order?: number;
    spanCol?: number;
    groupKey?: string;
    default?: string;
    endpoint?: string;
    selectOptions?: Array<string | number>;
  };
  options?: Array<{
    label: string;
    value: string | number;
    description?: string;
  }>;
  isLoading?: boolean;
}

export interface OperatorFieldPair {
  operator: string;
  fields: string[];
}

export interface FormState {
  values: Record<string, Record<string, string>>;
  errors: Record<string, Record<string, boolean>>;
}

export interface FieldProps {
  operator: string;
  field: string;
  value: string;
  hasError: boolean;
  fieldInfo: FieldTypeInfo;
  onChange: (operator: string, field: string, value: string) => void;
}

export interface FieldGroupProps {
  operator: string;
  groupKey: string;
  fields: string[];
  formValues: Record<string, Record<string, string>>;
  formErrors: Record<string, Record<string, boolean>>;
  fieldTypeMapping: Record<string, Record<string, FieldTypeInfo>>;
  onChange: (operator: string, field: string, value: string) => void;
}

export interface OperatorCardProps {
  operator: string;
  fields: string[];
  color: string;
  formValues: Record<string, Record<string, string>>;
  formErrors: Record<string, Record<string, boolean>>;
  fieldTypeMapping: Record<string, Record<string, FieldTypeInfo>>;
  onChange: (operator: string, field: string, value: string) => void;
}
