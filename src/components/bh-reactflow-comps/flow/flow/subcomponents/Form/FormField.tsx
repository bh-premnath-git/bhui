import React from "react";
import { Property } from "@/types/designer/flow";
import { InputField } from "./UiElements/InputField";
import { JsonInput } from "./UiElements/JsonInput";
import { DropdownField } from "./UiElements/Dropdown";
import { EnumDropdown } from "./UiElements/EnumDropdown";
import { CheckboxField } from "./UiElements/CheckboxField";
import { MultiWordInput } from "./UiElements/MultiWordInput";
import { CodeEditor } from "./UiElements/MonocoEditor";
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { useAppSelector } from '@/hooks/useRedux';
import { RootState } from "@/store";
import { parseStringifiedJson } from "@/lib/object";

interface FormFieldProps {
  property: Property;
  value: any;
  onChange: (key: string, value: string) => void;
  dependsOn?: string[];
}

export const FormField: React.FC<FormFieldProps> = React.memo(
  ({ property, value, onChange }) => {
    const {
      property_name,
      property_key,
      ui_type,
      spancol,
      mandatory,
      endpoint,
      language,
    } = property.ui_properties;

    
    const { environment } = useAppSelector(
      (state: RootState) => state.flow
    );
    
    const columnSpan = spancol && spancol > 0 && spancol <= 2 ? spancol : 1;
    const { options, isLoading } = useDropdownOptions(
      endpoint ?? '',
      endpoint !== "{catalog_base_url}/api/v1/pipeline/list" ? `${environment?.bh_env_id}` : null
    );
    const defaultValue = property.ui_properties.default
    const description = property.description
    //defaultValue
    const renderField = () => {
      switch (ui_type) {
        case 'json':
          return (
            <JsonInput
              id={property_key}
              label={property_name}
              value={value || ''}
              onChange={(e) => onChange(property_key, e.target.value)}
              placeholder={property_name}
              mandatory={mandatory}
              default={defaultValue}
              description={description}
            />
          );
        case 'list[string]':
        case 'list[emailids]':
          let parsedValues: string[] = [];
          if (value) {
            const [isParsed, parsedResult] = parseStringifiedJson(value);
            if (isParsed && Array.isArray(parsedResult)) {
              parsedValues = parsedResult as string[];
            } else {
             parsedValues = value as string[];
            }
          }

          return (
            <MultiWordInput
              id={property_key}
              label={property_name}
              values={parsedValues}
              onChange={(newValues) => onChange(property_key, JSON.stringify(newValues))}
              placeholder={property_name}
              mandatory={mandatory}
              default={defaultValue}
              description={description}
            />
          );
        case 'checkbox':
          return (
            <CheckboxField
              id={property_key}
              label={property_name}
              property_key={property_key}
              property_name={property_name}
              value={value}
              onChange={onChange}
              mandatory={mandatory}
              default={defaultValue}
              description={description}
            />
          );
        case 'dropdown':
          return (
            <DropdownField
              id={property_key}
              label={property_name}
              property_key={property_key}
              property_name={property_name}
              options={options}
              isLoading={isLoading}
              value={value}
              onChange={onChange}
              mandatory={mandatory}
              default={defaultValue}
              description={description}
            />
          );
        case 'enum':
          return (
            <EnumDropdown
              id={property_key}
              label={property_name}
              property_key={property_key}
              property_name={property_name}
              value={value}
              onChange={onChange}
              enumValues={property.enum || []}
              mandatory={mandatory}
              default={defaultValue}
              description={description}
            />
          );
        case 'number':
          return (
            <InputField
              id={property_key}
              label={property_name}
              value={value || ""}
              onChange={(e) => onChange(property_key, e.target.value)}
              placeholder={property_name}
              mandatory={mandatory}
              type="number"
              default={defaultValue}
              description={description}
            />
          );
        case "textbox":
          return (
            <CodeEditor
              id={property_key}
              label={property_name}
              value={value || ''}
              language={language || 'javascript'}
              onChange={(newValue) => onChange(property_key, newValue)}
              placeholder={`Enter ${property_name} code`}
              readOnly={false}
              mandatory={mandatory}
              className={`col-span-${columnSpan}`}
              default={defaultValue}
              description={description}
            />
          );
        default:
          return (
            <InputField
              id={property_key}
              label={property_name}
              value={value || ""}
              onChange={(e) => onChange(property_key, e.target.value)}
              placeholder={property_name}
              mandatory={mandatory}
              default={defaultValue}
              description={description}
            />
          );
      }
    };

    return (
      <div className={`space-y-2 ${columnSpan > 1 ? 'col-span-2' : ''}`}>
        {renderField()}
      </div>
    );
  }
);

FormField.displayName = "FormField";
