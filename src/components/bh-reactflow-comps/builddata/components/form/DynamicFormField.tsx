import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, Plus, X, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { apiService } from '@/lib/api/api-service';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { toast } from 'sonner';

// Utility function to format field labels
const formatFieldLabel = (fieldKey: string, title?: string): string => {
  if (title) return title;
  
  // Extract the last part of nested field keys (e.g., "source.name" -> "name")
  const lastKey = fieldKey.split('.').pop() || fieldKey;
  
  // Convert snake_case and camelCase to Title Case
  return lastKey
    .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

interface DynamicFormFieldProps {
  fieldKey: string;
  fieldSchema: any;
  value: any;
  onChange: (key: string, value: any) => void;
  errors?: Record<string, string>;
  level?: number;
}

export const DynamicFormField: React.FC<DynamicFormFieldProps> = React.memo(({
  fieldKey,
  fieldSchema,
  value,
  onChange,
  errors,
  level = 0
}) => {
  const fieldError = errors?.[fieldKey];
  const isRequired = fieldSchema.required || false;
  const isSecret = fieldSchema.bh_secret || false;
  
  // Memoize the formatted label to prevent unnecessary recalculations
  const formattedLabel = useMemo(() => 
    formatFieldLabel(fieldKey, fieldSchema.title), 
    [fieldKey, fieldSchema.title]
  );
  
  // State for API endpoint data
  const [endpointOptions, setEndpointOptions] = useState<any[]>([]);
  const [isLoadingEndpoint, setIsLoadingEndpoint] = useState(false);

  // Memoize the endpoint URL to prevent unnecessary API calls
  const endpointUrl = useMemo(() => 
    fieldSchema.endpoint && fieldSchema['ui-hint'] === 'endpoint' ? fieldSchema.endpoint : null,
    [fieldSchema.endpoint, fieldSchema['ui-hint']]
  );

  // Memoize callback functions to prevent unnecessary re-renders
  const handleChange = useCallback((newValue: any) => {
    onChange(fieldKey, newValue);
  }, [onChange, fieldKey]);

  const handleNestedChange = useCallback((key: string, val: any) => {
    const keys = key.split('.');
    const lastKey = keys.pop()!;
    const newValue = { ...value, [lastKey]: val };
    onChange(fieldKey, newValue);
  }, [onChange, fieldKey, value]);

  // Load data from API endpoint if specified
  useEffect(() => {
    const loadEndpointData = async () => {
      if (endpointUrl) {
        setIsLoadingEndpoint(true);
        try {
          console.log('🔧 Loading endpoint data from:', endpointUrl);
          const response = await apiService.get({
            baseUrl: CATALOG_REMOTE_API_URL,
            url: endpointUrl,
            usePrefix: true,
            method: 'GET',
            params: { limit: 1000 }
          });
          
          console.log('🔧 Endpoint response:', response);
          
          // Handle different response structures
          let options = [];
          if (Array.isArray(response)) {
            options = response;
          } else if (response && Array.isArray(response.data)) {
            // Handle paginated response with data array
            options = response.data;
          } else if (response && response.results && Array.isArray(response.results)) {
            // Handle response with results array
            options = response.results;
          } else {
            options = [];
          }
          
          console.log('🔧 Processed options:', options);
          setEndpointOptions(options);
        } catch (error) {
          console.error('🔧 Error loading endpoint data:', error);
          toast.error(`Failed to load options for ${formattedLabel}`);
          setEndpointOptions([]);
        } finally {
          setIsLoadingEndpoint(false);
        }
      }
    };

    loadEndpointData();
  }, [endpointUrl, formattedLabel]);

  // Handle object fields with API endpoint (like connection dropdown)
  if (fieldSchema.type === 'object' && fieldSchema['ui-hint'] === 'endpoint' && fieldSchema.endpoint) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          {formattedLabel}
          {isRequired && <Badge variant="destructive" className="text-xs">Required</Badge>}
          {fieldSchema.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{fieldSchema.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </Label>
        <Select
          value={value?.id?.toString() || value?.connection_config_id?.toString() || ''}
          onValueChange={(selectedValue) => {
            const selectedOption = endpointOptions.find(option => 
              option.id?.toString() === selectedValue
            );
            if (selectedOption) {
              onChange(fieldKey, {
                id: selectedOption.id,
                connection_config_id: selectedOption.id,
                name: selectedOption.connection_config_name,
                connection_config_name: selectedOption.connection_config_name,
                connection_type: selectedOption.custom_metadata?.connection_type || selectedOption.connection_type,
                custom_metadata: selectedOption.custom_metadata,
                ...selectedOption
              });
            }
          }}
          disabled={isLoadingEndpoint}
        >
          <SelectTrigger className={fieldError ? 'border-red-500' : ''}>
            <SelectValue placeholder={
              isLoadingEndpoint ? 'Loading...' : `Select ${formattedLabel}`
            } />
            {isLoadingEndpoint && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
          </SelectTrigger>
          <SelectContent style={{zIndex:99999}}>
            {endpointOptions.map((option) => (
              <SelectItem 
                key={option.id} 
                value={option.id?.toString()}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{option.connection_config_name}</span>
                  <span className="text-xs text-gray-500">
                    {option.custom_metadata?.connection_type || option.connection_type} • {option.bh_env_name}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldError && <p className="text-sm text-red-500">{fieldError}</p>}
      </div>
    );
  }

  // Handle object fields with additionalProperties (key-value pairs)
  if (fieldSchema.type === 'object' && fieldSchema.additionalProperties && !fieldSchema.properties && !fieldSchema['ui-hint']) {
    const objectValue = value || {};
    const entries = Object.entries(objectValue);

    return (
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          {formattedLabel}
          {isRequired && <Badge variant="destructive" className="text-xs">Required</Badge>}
          {fieldSchema.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{fieldSchema.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </Label>

        {/* Key-Value Pairs */}
        <div className="space-y-2">
          {entries.map(([key, val], index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  {/* Key Input */}
                  <div>
                    <Label className="text-xs text-gray-500">Key</Label>
                    <Input
                      value={key}
                      onChange={(e) => {
                        const newKey = e.target.value;
                        const newValue = { ...objectValue };
                        
                        // Remove old key and add new key with same value
                        if (newKey !== key) {
                          delete newValue[key];
                          if (newKey.trim()) {
                            newValue[newKey] = val;
                          }
                        }
                        
                        onChange(fieldKey, newValue);
                      }}
                      placeholder="Enter key"
                      className="text-sm"
                    />
                  </div>
                  
                  {/* Value Input */}
                  <div>
                    <Label className="text-xs text-gray-500">Value</Label>
                    {fieldSchema.additionalProperties?.enum ? (
                      // Render select dropdown for enum values
                      <Select
                        value={val as string}
                        onValueChange={(selectedValue) => {
                          const newValue = { ...objectValue, [key]: selectedValue };
                          onChange(fieldKey, newValue);
                        }}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Select value" />
                        </SelectTrigger>
                        <SelectContent style={{zIndex:99999}}>
                          {fieldSchema.additionalProperties.enum.map((option: string) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      // Render regular input for string values
                      <Input
                        value={val as string}
                        onChange={(e) => {
                          const newValue = { ...objectValue, [key]: e.target.value };
                          onChange(fieldKey, newValue);
                        }}
                        placeholder="Enter value"
                        className="text-sm"
                      />
                    )}
                  </div>
                </div>
                
                {/* Remove Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newValue = { ...objectValue };
                    delete newValue[key];
                    onChange(fieldKey, newValue);
                  }}
                  className="px-2 self-end"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Add New Key-Value Pair Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const newKey = `key_${entries.length + 1}`;
            const defaultValue = fieldSchema.additionalProperties?.enum 
              ? fieldSchema.additionalProperties.enum[0] 
              : '';
            const newValue = { ...objectValue, [newKey]: defaultValue };
            onChange(fieldKey, newValue);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add {formattedLabel}
        </Button>

        {/* Bulk Input Option */}
        <div className="pt-2 border-t">
          <Label className="text-xs text-gray-500">Or paste JSON object:</Label>
          <Textarea
            value={JSON.stringify(objectValue, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
                  onChange(fieldKey, parsed);
                }
              } catch (error) {
                // Invalid JSON, ignore for now
                console.warn('Invalid JSON input:', error);
              }
            }}
            placeholder={`{"old_column": "new_column"}`}
            className="mt-1 h-20 font-mono text-sm"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter a valid JSON object with key-value pairs
          </p>
        </div>

        {fieldError && <p className="text-sm text-red-500">{fieldError}</p>}
      </div>
    );
  }

  // Handle nested object fields (regular objects with properties)
  if (fieldSchema.type === 'object' && fieldSchema.properties) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <h4 className="text-sm font-medium text-gray-700">
            {formattedLabel}
          </h4>
          {isRequired && <Badge variant="destructive" className="text-xs">Required</Badge>}
          {fieldSchema.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{fieldSchema.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(fieldSchema.properties).map(([nestedKey, nestedSchema]: [string, any]) => (
            <div key={nestedKey} className={nestedSchema.type === 'object' ? 'md:col-span-2' : ''}>
              <DynamicFormField
                fieldKey={`${fieldKey}.${nestedKey}`}
                fieldSchema={nestedSchema}
                value={value?.[nestedKey]}
                onChange={(key, val) => {
                  const keys = key.split('.');
                  const lastKey = keys.pop()!;
                  const newValue = { ...value, [lastKey]: val };
                  onChange(fieldKey, newValue);
                }}
                errors={errors}
                level={level + 1}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle array fields
  if (fieldSchema.type === 'array') {
    const arrayValue = Array.isArray(value) ? value : [];
    const itemSchema = fieldSchema.items || { type: 'string' };

    // For simple string arrays, use a more user-friendly interface
    if (itemSchema.type === 'string') {
      return (
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            {formattedLabel}
            {isRequired && <Badge variant="destructive" className="text-xs">Required</Badge>}
            {fieldSchema.description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{fieldSchema.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </Label>
          
          {/* Individual array items */}
          <div className="space-y-2">
            {arrayValue.map((item: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={item}
                  onChange={(e) => {
                    const newArray = [...arrayValue];
                    newArray[index] = e.target.value;
                    onChange(fieldKey, newArray);
                  }}
                  placeholder={`${formattedLabel} ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newArray = arrayValue.filter((_, i) => i !== index);
                    onChange(fieldKey, newArray);
                  }}
                  className="px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add new item button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newArray = [...arrayValue, ''];
              onChange(fieldKey, newArray);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add {formattedLabel}
          </Button>

          {/* Alternative: Textarea for bulk input */}
          <div className="pt-2 border-t">
            <Label className="text-xs text-gray-500">Or paste multiple values (one per line):</Label>
            <Textarea
              value={arrayValue.join('\n')}
              onChange={(e) => {
                const lines = e.target.value.split('\n').filter(line => line.trim());
                onChange(fieldKey, lines);
              }}
              placeholder={`Enter ${formattedLabel} (one per line)`}
              className="mt-1 h-20"
              rows={3}
            />
          </div>

          {fieldError && <p className="text-sm text-red-500">{fieldError}</p>}
        </div>
      );
    }

    // For complex array items, render each as a separate form
    return (
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          {formattedLabel}
          {isRequired && <Badge variant="destructive" className="text-xs">Required</Badge>}
          {fieldSchema.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{fieldSchema.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </Label>
        
        <div className="space-y-2">
          {arrayValue.map((item: any, index: number) => (
            <Card key={index} className="p-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <DynamicFormField
                    fieldKey={`${fieldKey}[${index}]`}
                    fieldSchema={itemSchema}
                    value={item}
                    onChange={(_, val) => {
                      const newArray = [...arrayValue];
                      newArray[index] = val;
                      onChange(fieldKey, newArray);
                    }}
                    errors={errors}
                    level={level + 1}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newArray = arrayValue.filter((_, i) => i !== index);
                    onChange(fieldKey, newArray);
                  }}
                  className="px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const newArray = [...arrayValue, itemSchema.type === 'object' ? {} : ''];
            onChange(fieldKey, newArray);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add {fieldSchema.title || fieldKey}
        </Button>

        {fieldError && <p className="text-sm text-red-500">{fieldError}</p>}
      </div>
    );
  }

  // Handle enum/select fields
  if (fieldSchema.enum) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          {formattedLabel}
          {isRequired && <Badge variant="destructive" className="text-xs">Required</Badge>}
          {fieldSchema.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{fieldSchema.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </Label>
        <Select
          value={value || fieldSchema.default || ''}
          onValueChange={(val) => onChange(fieldKey, val)}
        >
          <SelectTrigger className={fieldError ? 'border-red-500' : ''}>
            <SelectValue placeholder={`Select ${formattedLabel}`} />
          </SelectTrigger>
          <SelectContent style={{zIndex:99999}}>
            {fieldSchema.enum.map((option: string) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldError && <p className="text-sm text-red-500">{fieldError}</p>}
      </div>
    );
  }

  // Handle boolean fields
  if (fieldSchema.type === 'boolean') {
    return (
      <div className="flex items-center space-x-2">
        <Switch
          checked={value || fieldSchema.default || false}
          onCheckedChange={(checked) => onChange(fieldKey, checked)}
        />
        <Label className="flex items-center gap-2">
          {formattedLabel}
          {isRequired && <Badge variant="destructive" className="text-xs">Required</Badge>}
          {fieldSchema.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{fieldSchema.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </Label>
      </div>
    );
  }

  // Handle number fields
  if (fieldSchema.type === 'number' || fieldSchema.type === 'integer') {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          {formattedLabel}
          {isRequired && <Badge variant="destructive" className="text-xs">Required</Badge>}
          {fieldSchema.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{fieldSchema.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </Label>
        <Input
          type="number"
          value={value || fieldSchema.default || ''}
          onChange={(e) => {
            const val = fieldSchema.type === 'integer' 
              ? parseInt(e.target.value) || 0
              : parseFloat(e.target.value) || 0;
            onChange(fieldKey, val);
          }}
          placeholder={fieldSchema.description || `Enter ${formattedLabel}`}
          min={fieldSchema.minimum}
          max={fieldSchema.maximum}
          className={fieldError ? 'border-red-500' : ''}
        />
        {fieldError && <p className="text-sm text-red-500">{fieldError}</p>}
      </div>
    );
  }

  // Handle textarea for large text fields
  if (fieldSchema.format === 'textarea' || fieldSchema.type === 'string' && fieldSchema.minLength > 100) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          {formattedLabel}
          {isRequired && <Badge variant="destructive" className="text-xs">Required</Badge>}
          {isSecret && <Badge variant="secondary" className="text-xs">Secret</Badge>}
          {fieldSchema.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{fieldSchema.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </Label>
        <Textarea
          value={value || fieldSchema.default || ''}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          placeholder={fieldSchema.description || `Enter ${formattedLabel}`}
          className={fieldError ? 'border-red-500' : ''}
          rows={4}
        />
        {fieldError && <p className="text-sm text-red-500">{fieldError}</p>}
      </div>
    );
  }

  // Handle string fields (default)
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {formattedLabel}
        {isRequired && <Badge variant="destructive" className="text-xs">Required</Badge>}
        {isSecret && <Badge variant="secondary" className="text-xs">Secret</Badge>}
        {fieldSchema.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{fieldSchema.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </Label>
      <Input
        type={isSecret ? 'password' : 'text'}
        value={value || fieldSchema.default || ''}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        placeholder={fieldSchema.description || `Enter ${formattedLabel}`}
        className={fieldError ? 'border-red-500' : ''}
        minLength={fieldSchema.minLength}
        maxLength={fieldSchema.maxLength}
      />
      {fieldError && <p className="text-sm text-red-500">{fieldError}</p>}
    </div>
  );
});