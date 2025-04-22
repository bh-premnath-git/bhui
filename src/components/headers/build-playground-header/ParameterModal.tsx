import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Save, Loader } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { apiService } from '@/lib/api/api-service';
import { CATALOG_API_PORT } from '@/config/platformenv';
import { Toaster } from "@/components/ui/sonner";
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
}> = ({ parameter, onDelete, onChange, canDelete }) => (
  <div className="flex gap-2 items-center px-1">
    <div className="w-1/2">
      <Input
        placeholder="Key"
        value={parameter.key}
        onChange={(e) => onChange('key', e.target.value)}
        className="w-full focus:ring-2 focus:ring-offset-0 focus:ring-blue-500"
        required
      />
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

export const ParameterModal: React.FC<ParameterModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'spark'>('pipeline');
  const [pipelineParams, setPipelineParams] = useState<Parameter[]>([{ key: '', value: '' }]);
  const [sparkParams, setSparkParams] = useState<Parameter[]>([{ key: '', value: '' }]);
  const [isSaving, setIsSaving] = useState(false);
  const { id } = useParams();

  React.useEffect(() => {
    const fetchParameters = async (type: 'pipeline' | 'spark') => {
      if (id) {
        try {
          const parameterType = type === 'pipeline' ? 'USER' : 'SPARK_SESSION';
          const response: any = await apiService.get({
            portNumber: CATALOG_API_PORT,
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
          portNumber: CATALOG_API_PORT,
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
              portNumber: CATALOG_API_PORT,
              method: 'PUT',
              url: `/pipeline/pipeline-parameter/${param.pipeline_parameter_id}`,
              data: payload,
              usePrefix: true
            });
          } else {
            await apiService.post({
              portNumber: CATALOG_API_PORT,
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
            parameter_type: 'SPARK_SESSION'
          };

          if (param.pipeline_parameter_id) {
            await apiService.put({
              portNumber: CATALOG_API_PORT,
              method: 'PUT',
              url: `/pipeline/pipeline-parameter/${param.pipeline_parameter_id}`,
              data: payload,
              usePrefix: true
            });
          } else {
            await apiService.post({
              portNumber: CATALOG_API_PORT,
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
        className="sm:max-w-[550px] bg-white/95 backdrop-blur-sm border-0 shadow-lg p-6"
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
          <TabsList className="flex space-x-4 mb-6 p-1 rounded-lg overflow-visible">
            <TabsTrigger
              value="pipeline"
              className="px-4 py-2 rounded-md border border-gray-300 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Pipeline
            </TabsTrigger>
            <TabsTrigger
              value="spark"
              className="px-4 py-2 rounded-md border border-gray-300 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Spark
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
