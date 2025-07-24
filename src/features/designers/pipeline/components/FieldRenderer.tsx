import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { KeyValueEditor } from './KeyValueEditor';

interface FieldRendererProps {
  fieldKey: string;
  field: any;
  form: any;
  isRequired?: boolean;
  parentPath?: string;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  fieldKey,
  field,
  form,
  isRequired = false,
  parentPath = '',
}) => {
  const fullFieldKey = parentPath ? `${parentPath}.${fieldKey}` : fieldKey;
  const fieldTitle = field.title || fieldKey;
  const isFieldTitleNumeric = !isNaN(parseInt(fieldTitle)) && isFinite(parseInt(fieldTitle));

  // Handle anyOf patterns (like in SchemaTransformation derived_fields)
  if (field.anyOf) {
    // For anyOf, we'll render based on the first valid schema
    // This is a simplified approach - in a full implementation, you might want to let users choose
    const firstSchema = field.anyOf[0];
    return (
      <FieldRenderer
        fieldKey={fieldKey}
        field={firstSchema}
        form={form}
        isRequired={isRequired}
        parentPath={parentPath}
      />
    );
  }

  return (
    <FormField
      control={form.control}
      name={fullFieldKey}
      render={({ field: formField }) => (
        <FormItem>
          {!isFieldTitleNumeric && (
            <div className="flex items-center justify-between mb-2">
              <FormLabel className="text-sm font-medium">
                {fieldTitle}
                {isRequired && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
              {field.description && (
                <div className="group relative">
                  <div className="w-4 h-4 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs cursor-help">
                    ?
                  </div>
                  <div className="absolute right-0 top-6 w-64 p-2 bg-popover border rounded-md shadow-md text-xs text-popover-foreground opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {field.description}
                  </div>
                </div>
              )}
            </div>
          )}
          <FormControl>
            {field.type === 'boolean' ? (
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formField.value || false}
                  onCheckedChange={formField.onChange}
                />
                <span className="text-sm">
                  {field.description || `Enable ${fieldTitle}`}
                </span>
              </div>
            ) : field.enum ? (
              <Select
                value={formField.value?.toString() || ''}
                onValueChange={formField.onChange}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder={`Select ${fieldTitle.toLowerCase()}...`} />
                </SelectTrigger>
                <SelectContent style={{ zIndex: 99999 }} className="max-h-48">
                  {field.enum.map((option: string) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === 'string' && (field.format === 'textarea' || field.minLength > 100 || fieldKey === 'expression') ? (
              <Textarea
                {...formField}
                placeholder={field.examples?.[0] || field.default || (fieldKey === 'expression' ? 'Enter SQL expression...' : '')}
                rows={fieldKey === 'expression' ? 2 : (field.format === 'textarea' ? 4 : 3)}
                className={`text-sm resize-none ${fieldKey === 'expression' ? 'font-mono' : ''}`}
              />
            ) : field.type === 'array' ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Array field: {fieldTitle}
                </div>
                <Textarea
                  {...formField}
                  value={Array.isArray(formField.value) ? formField.value.join('\n') : formField.value || ''}
                  onChange={(e) => {
                    const arrayValue = e.target.value.split('\n').filter(line => line.trim() !== '');
                    formField.onChange(arrayValue);
                  }}
                  placeholder="Enter one item per line"
                  rows={3}
                />
              </div>
            ) : field.type === 'object' ? (
              // Handle object fields - check if it's a key-value object or structured object
              field.additionalProperties && !field.properties ? (
                // Key-value object (like parameters)
                <KeyValueEditor
                  value={formField.value || {}}
                  onChange={formField.onChange}
                  placeholder="Add parameter"
                />
              ) : (
                // Structured object or fallback to JSON editor
                <div className="p-3 border rounded-md bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-2">
                    Object field: {fieldTitle}
                  </div>
                  <Textarea
                    {...formField}
                    value={typeof formField.value === 'object' ? JSON.stringify(formField.value, null, 2) : formField.value || ''}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        formField.onChange(parsed);
                      } catch {
                        formField.onChange(e.target.value);
                      }
                    }}
                    placeholder="Enter JSON object"
                    rows={4}
                  />
                </div>
              )
            ) : (
              <Input
                {...formField}
                type={
                  field.type === 'number' || field.type === 'integer'
                    ? 'number'
                    : field.format === 'password'
                    ? 'password'
                    : 'text'
                }
                placeholder={field.examples?.[0] || field.default || ''}
                className="h-9"
              />
            )}
          </FormControl>
          {field.description && (
            <FormDescription>
              {field.description}
            </FormDescription>
          )}
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
};