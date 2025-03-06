import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Save, Loader } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { apiService } from '@/lib/api/api-service';
import { CATALOG_API_PORT } from '@/config/platformenv';

interface ParameterModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'pipeline' | 'spark';
}

interface Parameter {
  key: string;
  value: string;
  pipeline_parameter_id?: number;
}

export const ParameterModal: React.FC<ParameterModalProps> = ({ isOpen, onClose, type }) => {
  const [parameters, setParameters] = useState<Parameter[]>([{ key: '', value: '' }]);
  const [isSaving, setIsSaving] = useState(false);
  const { id } = useParams();

  React.useEffect(() => {
    const fetchParameters = async () => {
      if (id) {
        try {
          const parameterType = type === 'pipeline' ? 'USER' : 'SPARK_SESSION';
          const response:any = await apiService.get({
            portNumber: CATALOG_API_PORT,
            url: `/pipeline/pipeline-parameters/${id}/parameter_type/${parameterType}`,
            method:'GET',
            usePrefix:true
          });
          const existingParams = (response as any[])
            .filter((param: any) => !param.is_deleted)
            .map((param: any) => ({
              key: param.parameter_name,
              value: param.parameter_value,
              pipeline_parameter_id: param.pipeline_parameter_id
            }));
          setParameters(existingParams.length > 0 ? existingParams : [{ key: '', value: '' }]);
        } catch (error) {
          console.error("Failed to fetch parameters:", error);
        }
      }
    };

    if (isOpen) {
      fetchParameters();
    }
  }, [isOpen, id, type]);

  const handleParameterChange = (index: number, field: 'key' | 'value', value: string) => {
    const newParameters = [...parameters];
    newParameters[index][field] = value;
    setParameters(newParameters);
  };

  const addParameter = () => {
    setParameters([...parameters, { key: '', value: '' }]);
  };

  const removeParameter = async (index: number) => {
    const parameter = parameters[index];
    if (parameter.pipeline_parameter_id) {
      try {
        await apiService.delete({
          portNumber: CATALOG_API_PORT,
          url: `/pipeline/pipeline-parameter/${parameter.pipeline_parameter_id}`,
          method:'DELETE',
          usePrefix:true
        });
      } catch (error) {
        console.error("Failed to delete parameter:", error);
        return;
      }
    }
    
    const newParameters = parameters.filter((_, i) => i !== index);
    setParameters(newParameters.length > 0 ? newParameters : [{ key: '', value: '' }]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const param of parameters) {
        const payload = {
          pipeline_id: Number(id),
          parameter_name: param.key,
          parameter_value: param.value,
          parameter_type: type === 'pipeline' ? 'USER' : 'SPARK_SESSION'
        };

        if (param.pipeline_parameter_id) {
          await apiService.put({
            portNumber: CATALOG_API_PORT,
            method:'PUT',
            url: `/pipeline/pipeline-parameter/${param.pipeline_parameter_id}`,
            data: payload,
            usePrefix:true
          });
        } else {
          await apiService.post({
            portNumber: CATALOG_API_PORT,
            method:'POST',
            url: '/pipeline/pipeline-parameter',
            data: payload,
            usePrefix:true
          });
        }
      }
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] bg-white/95 backdrop-blur-sm border-0 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            {type === 'pipeline' ? 'Pipeline Parameters' : 'Spark Parameters'}
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Configure your {type} parameters
          </p>
        </DialogHeader>

        <div className="min-h-[300px] max-h-[400px] overflow-y-auto">
          <div className="space-y-4">
            <div className="flex text-sm font-medium text-gray-500 px-3">
              <div className="w-1/2">Key</div>
              <div className="w-1/2">Value</div>
            </div>

            {parameters.map((param, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  placeholder="Key"
                  value={param.key}
                  onChange={(e) => handleParameterChange(index, 'key', e.target.value)}
                  className="w-1/2"
                />
                <Input
                  placeholder="Value"
                  value={param.value}
                  onChange={(e) => handleParameterChange(index, 'value', e.target.value)}
                  className="w-1/2"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeParameter(index)}
                  className="text-gray-400 hover:text-red-500"
                  disabled={parameters.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="ghost"
              onClick={addParameter}
              className="w-full mt-4 border border-dashed border-gray-200 hover:border-gray-300 text-gray-600 h-9"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Parameter
            </Button>
          </div>
        </div>

        <DialogFooter className="px-2 pb-2 flex justify-end">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
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