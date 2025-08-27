import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Save, Loader, Info } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { apiService } from '@/lib/api/api-service';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { Toaster } from "@/components/ui/sonner";
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {engineConfigs} from "@bh-ai/schemas"
import { useSelector } from 'react-redux';
import { useAppSelector } from '@/hooks/useRedux';
interface ParameterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Parameter {
  key: string;
  value: string;
  pipeline_parameter_id?: number;
}

const ParameterRow: React.FC<{
  parameter: Parameter;
  onDelete: () => void;
  onChange: (field: 'key' | 'value', value: string) => void;
  canDelete: boolean;
  // New: autocomplete sources and selected meta
  keyOptions?: any[];
}> = ({ parameter, onDelete, onChange, canDelete, keyOptions = [] }) => {
  // Find meta for current key if selected from options
  const selectedMeta = keyOptions.find((opt: any) => opt.property_name === parameter.key);
  const description = selectedMeta?.description as string | undefined;
  const defaultValue = selectedMeta?.default_value as string | undefined;

  // Local state for custom autocomplete dropdown
  const [open, setOpen] = React.useState(false);
  const [highlightIndex, setHighlightIndex] = React.useState(-1);

  // Filter options based on current input
  const filteredOptions = React.useMemo(() => {
    const q = (parameter.key || '').toLowerCase();
    const list = q
      ? keyOptions.filter((opt: any) => opt.property_name?.toLowerCase().includes(q))
      : keyOptions;
    return list.slice(0, 100); // limit size for performance
  }, [parameter.key, keyOptions]);

  return (
    <div className="flex gap-2 items-center px-1">
      <div className="w-1/2">
        <div className="relative">
          <Input
            placeholder="Key"
            value={parameter.key}
            onChange={(e) => {
              const nextKey = e.target.value;
              onChange('key', nextKey);
              setOpen(true);
              setHighlightIndex(-1);
            }}
            onFocus={() => setOpen(true)}
            onBlur={(e) => {
              // Small delay to allow click selection in dropdown
              setTimeout(() => setOpen(false), 100);
              const match = keyOptions.find((opt: any) => opt.property_name === e.target.value);
              if (match && match.default_value !== undefined) {
                onChange('value', String(match.default_value));
              }
            }}
            onKeyDown={(e) => {
              if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) setOpen(true);
              if (open) {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setHighlightIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setHighlightIndex((prev) => Math.max(prev - 1, 0));
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  const sel = filteredOptions[highlightIndex];
                  if (sel) {
                    onChange('key', sel.property_name);
                    if (sel.default_value !== undefined) {
                      onChange('value', String(sel.default_value));
                    }
                    setOpen(false);
                  }
                } else if (e.key === 'Escape') {
                  setOpen(false);
                }
              }
            }}
            className="w-full focus:ring-2 focus:ring-offset-0 focus:ring-blue-500 pr-8"
            required
            autoComplete="off"
          />

          {/* Inline dropdown under the input */}
          {open && filteredOptions.length > 0 && (
            <div className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border bg-white shadow-lg">
              {filteredOptions.map((opt: any, idx: number) => {
                const isActive = idx === highlightIndex;
                return (
                  <div
                    key={opt.property_name}
                    className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 ${isActive ? 'bg-gray-100' : ''}`}
                    onMouseEnter={() => setHighlightIndex(idx)}
                    onMouseDown={(e) => {
                      // prevent blur before click
                      e.preventDefault();
                    }}
                    onClick={() => {
                      onChange('key', opt.property_name);
                      if (opt.default_value !== undefined) {
                        onChange('value', String(opt.default_value));
                      }
                      setOpen(false);
                    }}
                    title={opt.description || ''}
                  >
                    {opt.property_name}
                  </div>
                );
              })}
            </div>
          )}

          {description && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm whitespace-pre-wrap">
                    {description}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>
      <div className="w-1/2">
        <Input
          placeholder="Value"
          value={parameter.value}
          onChange={(e) => onChange('value', e.target.value)}
          className="w-full focus:ring-2 focus:ring-offset-0 focus:ring-blue-500"
          required
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="text-gray-400 hover:text-red-500 flex-shrink-0"
        disabled={!canDelete}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const ParameterModal: React.FC<ParameterModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'spark'>('pipeline');
  const [pipelineParams, setPipelineParams] = useState<Parameter[]>([{ key: '', value: '' }]);
  const [sparkParams, setSparkParams] = useState<Parameter[]>([{ key: '', value: '' }]);
  const [isSaving, setIsSaving] = useState(false);
  const selectedEngineType = useAppSelector((state) => state.buildPipeline.selectedEngineType);
  const { id } = useParams();
let engineConfig = engineConfigs;

// Normalize engine type (UI may use 'flink' while config uses 'pyflink')
const normalizedEngineType = selectedEngineType === 'flink' ? 'pyflink' : selectedEngineType;

// Build keyconfig from engineConfig for the selected engine
const keyconfig = React.useMemo(() => {
  try {
    const cfg: any = (engineConfig as any)?.[normalizedEngineType as keyof typeof engineConfig];
    if (!cfg) return [] as any[];

    // Prefer explicit engine_config array if present
    if (Array.isArray((cfg as any).engine_config)) {
      return (cfg as any).engine_config as any[];
    }

    // Fallback: aggregate keys from any JSON schema objects with 'properties'
    const schemaObjects = Object.values(cfg).filter(
      (v: any) => v && typeof v === 'object' && (v as any).properties
    ) as any[];

    const flattened = schemaObjects.flatMap((schema: any) =>
      Object.entries(schema.properties || {}).map(([key, def]: [string, any]) => ({
        key,
        ...(def || {})
      }))
    );

    return flattened as any[];
  } catch (e) {
    console.error('Failed to build keyconfig:', e);
    return [] as any[];
  }
}, [engineConfig, normalizedEngineType]);
  React.useEffect(() => {
    const fetchParameters = async (type: 'pipeline' | 'spark') => {
      if (id) {
        try {
          const parameterType = type === 'pipeline' ? 'USER' : 'ENGINE_CONFIGURATION';
          const response: any = await apiService.get({
            baseUrl: CATALOG_REMOTE_API_URL,
            url: `/pipeline/pipeline-parameters/${id}/parameter_type/${parameterType}`,
            method: 'GET',
            usePrefix: true
          });
          const existingParams = (response as any[])
            .filter((param: any) => !param.is_deleted)
            .map((param: any) => ({
              key: param.parameter_name,
              value: param.parameter_value,
              pipeline_parameter_id: param.pipeline_parameter_id
            }));
            
          if (type === 'pipeline') {
            setPipelineParams(existingParams.length > 0 ? existingParams : [{ key: '', value: '' }]);
          } else {
            setSparkParams(existingParams.length > 0 ? existingParams : [{ key: '', value: '' }]);
          }
        } catch (error) {
          console.error(`Failed to fetch ${type} parameters:`, error);
        }
      }
    };

    if (isOpen) {
      fetchParameters('pipeline');
      fetchParameters('spark');
    }
  }, [isOpen, id]);

  const handleParamChange = (type: 'pipeline' | 'spark', index: number, field: 'key' | 'value', value: string) => {
    if (type === 'pipeline') {
      const newParams = [...pipelineParams];
      newParams[index][field] = value;
      setPipelineParams(newParams);
    } else {
      const newParams = [...sparkParams];
      newParams[index][field] = value;
      setSparkParams(newParams);
    }
  };

  const addParam = (type: 'pipeline' | 'spark') => {
    if (type === 'pipeline') {
      setPipelineParams([...pipelineParams, { key: '', value: '' }]);
    } else {
      setSparkParams([...sparkParams, { key: '', value: '' }]);
    }
  };

  const removeParam = async (type: 'pipeline' | 'spark', index: number) => {
    const params = type === 'pipeline' ? pipelineParams : sparkParams;
    const parameter = params[index];
    
    if (parameter.pipeline_parameter_id) {
      try {
        await apiService.delete({
          baseUrl: CATALOG_REMOTE_API_URL,
          url: `/pipeline/pipeline-parameter/${parameter.pipeline_parameter_id}`,
          method: 'DELETE',
          usePrefix: true
        });
      } catch (error) {
        console.error("Failed to delete parameter:", error);
        return;
      }
    }

    if (type === 'pipeline') {
      const newParams = params.filter((_, i) => i !== index);
      setPipelineParams(newParams.length > 0 ? newParams : [{ key: '', value: '' }]);
    } else {
      const newParams = params.filter((_, i) => i !== index);
      setSparkParams(newParams.length > 0 ? newParams : [{ key: '', value: '' }]);
    }
  };

  const handleSave = async () => {
    // Check for duplicate keys in the active tab
    const checkDuplicates = (params: Parameter[]) => {
      const keys = params.map(param => param.key);
      return keys.some((key, index) => keys.indexOf(key) !== index);
    };

    if (activeTab === 'pipeline' && checkDuplicates(pipelineParams)) {
      toast.error("Duplicate key in Pipeline Parameters");
      return;
    }

    if (activeTab === 'spark' && checkDuplicates(sparkParams)) {
      toast.error("Duplicate key in Spark Parameters");
      return;
    }

    setIsSaving(true);
    try {
      // Save pipeline parameters
      if (activeTab === 'pipeline') {
        for (const param of pipelineParams) {
          if (!param.key || !param.value) continue;
          
          const payload = {
            pipeline_id: Number(id),
            parameter_name: param.key,
            parameter_value: param.value,
            parameter_type: 'USER'
          };

          if (param.pipeline_parameter_id) {
            await apiService.put({
              baseUrl: CATALOG_REMOTE_API_URL,
              method: 'PUT',
              url: `/pipeline/pipeline-parameter/${param.pipeline_parameter_id}`,
              data: payload,
              usePrefix: true
            });
          } else {
            await apiService.post({
              baseUrl: CATALOG_REMOTE_API_URL,
              method: 'POST',
              url: '/pipeline/pipeline-parameter',
              data: payload,
              usePrefix: true
            });
          }
        }
      }

      // Save spark parameters
      if (activeTab === 'spark') {
        for (const param of sparkParams) {
          if (!param.key || !param.value) continue;
          
          const payload = {
            pipeline_id: Number(id),
            parameter_name: param.key,
            parameter_value: param.value,
            parameter_type: 'ENGINE_CONFIGURATION'
          };

          if (param.pipeline_parameter_id) {
            await apiService.put({
              baseUrl: CATALOG_REMOTE_API_URL,
              method: 'PUT',
              url: `/pipeline/pipeline-parameter/${param.pipeline_parameter_id}`,
              data: payload,
              usePrefix: true
            });
          } else {
            await apiService.post({
              baseUrl: CATALOG_REMOTE_API_URL,
              method: 'POST',
              url: '/pipeline/pipeline-parameter',
              data: payload,
              usePrefix: true
            });
          }
        }
      }
      
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderParamsSection = (type: 'pipeline' | 'spark') => {
    const params = type === 'pipeline' ? pipelineParams : sparkParams;
    const hasEmptyParams = params.some(param => !param.key || !param.value);

    return (
      <div className="space-y-3 px-3">
        <div className="flex text-sm font-medium text-gray-500 px-3">
          <div className="w-1/2">Key</div>
          <div className="w-1/2">Value</div>
        </div>
        <div className="space-y-2 overflow-visible">
          {params.map((param, index) => (
            <ParameterRow
              key={index}
              parameter={param}
              onDelete={() => removeParam(type, index)}
              onChange={(field, value) => handleParamChange(type, index, field, value)}
              canDelete={params.length > 1}
              keyOptions={type === 'spark' ? keyconfig : []}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={() => addParam(type)}
          className="w-full mt-4 border border-dashed border-gray-200 hover:border-gray-300 text-gray-600 h-9 mx-auto px-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Parameter
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[95vw] sm:max-w-[900px] max-h-[85vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-lg p-6"
        aria-describedby="parameterform"
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Pipeline Parameters
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Configure your pipeline and spark parameters
          </p>
        </DialogHeader>
        <Toaster />

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'pipeline' | 'spark')} className="w-full">
          <TabsList className="flex gap-6 mb-4 border-b border-gray-200 overflow-visible">
            <TabsTrigger
              value="pipeline"
              className="-mb-px border-b-2 border-transparent px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 data-[state=active]:border-black data-[state=active]:text-black focus:outline-none"
            >
              Pipeline
            </TabsTrigger>
            <TabsTrigger
              value="spark"
              className="-mb-px border-b-2 border-transparent px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 data-[state=active]:border-black data-[state=active]:text-black focus:outline-none"
            >
              Engine Config
            </TabsTrigger>
          </TabsList>

          <div className="min-h-[300px] max-h-[400px] overflow-y-auto overflow-x-visible px-1">
            <TabsContent value="pipeline" className="mt-0 h-full overflow-visible">
              {renderParamsSection('pipeline')}
            </TabsContent>
            <TabsContent value="spark" className="mt-0 h-full overflow-visible">
              {renderParamsSection('spark')}
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="px-2 pb-1 flex justify-end">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || 
              (activeTab === 'pipeline' && pipelineParams.some(p => !p.key || !p.value)) || 
              (activeTab === 'spark' && sparkParams.some(p => !p.key || !p.value))}
            aria-label={isSaving ? 'Saving' : 'Save'}
            className="bg-black hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-sm disabled:bg-gray-400"
          >
            {isSaving ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
