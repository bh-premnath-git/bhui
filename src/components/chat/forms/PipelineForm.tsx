import React, { useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ChevronDown, ChevronUp, Wrench, FileText } from 'lucide-react';
import { insertPipeline, setBuildPipeLineDtl, setPipeLineType, setSelectedEngineType } from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';
import { Input } from '@/components/ui/input';
import { useProjects } from '@/features/admin/projects/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import { setSelectedPipeline } from '@/store/slices/designer/pipelineSlice';
import { useAppSelector } from '@/hooks/useRedux';
import { RootState } from '@/store';
import { useEngineTypes } from '@/hooks/useSchemaTypes';
import { ValidEngineTypes } from '@/types/pipeline';

interface PipelineFormProps {
  onClose: () => void;
}

interface FormValues {
  bh_project_id: string;
  pipeline_name: string;
  pipeline_type: string;
  notes: string;
}

export const PipelineForm: React.FC<PipelineFormProps> = ({ onClose }) => {
  const { projects } = useProjects();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { setPipeline_id, setPipeLineName, setProjectName, setPipelines, pipelines } =
    usePipelineContext();
  const { selectedEngineType } = useAppSelector((state: RootState) => state.buildPipeline);
  
  // Get dynamic engine types from schema
  const engineTypes = useEngineTypes();

  const [showNotes, setShowNotes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    defaultValues: {
      bh_project_id: '',
      pipeline_name: '',
      pipeline_type: '',
      notes: '',
    },
  });

  const selectedProjectId = watch('bh_project_id');
  const selectedPipelineType = watch('pipeline_type');

  const gitProjectList = useMemo(
    () =>
      Array.isArray(projects)
        ? projects.map(({ bh_project_id, bh_project_name }) => ({
            bh_project_id,
            bh_project_name,
          }))
        : [],
    [projects],
  );

  const handleProjectChange = useCallback(
    (projectId: string) => {
      setValue('bh_project_id', projectId, { shouldValidate: true });
      const selectedProject = gitProjectList.find(
        p => p.bh_project_id.toString() === projectId,
      );
      if (selectedProject) setProjectName?.(selectedProject.bh_project_name);
    },
    [gitProjectList, setProjectName, setValue],
  );

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);

      const response = await dispatch(
        insertPipeline({ ...values, tags: {}, engine_type: selectedEngineType }),
      ).unwrap();
      setPipelines([...pipelines, response]);
      if (!response?.error) {
        setPipeLineName?.(values.pipeline_name);
        setPipeline_id(response.pipeline_id);
        localStorage.setItem('pipeline_id', response.pipeline_id.toString());

        dispatch(setBuildPipeLineDtl(response));
        dispatch(setSelectedPipeline(response));
        dispatch(setPipeLineType(response.pipeline_type));
        reset();
        setShowNotes(false);
        dispatch(setSelectedEngineType(response.engine_type));
        
        // Close the form and let the chat workflow handle the success
        onClose();
        
        // Don't navigate away - let the chat workflow show the pipeline canvas
        // The workflow will automatically show the pipeline canvas in the right sidebar
      }
    } finally {
      setIsLoading(false);
    }
  };

  const pipelineTypes = [
    {
      value: 'design',
      icon: Wrench,
      label: 'Design Pipeline',
      description: 'Build data transformations',
      color: 'text-blue-600',
      gradient: 'from-blue-50 to-blue-100',
      border: 'border-blue-500',
      iconBg: 'bg-blue-100',
    },
    {
      value: 'requirement',
      icon: FileText,
      label: 'Requirement Pipeline',
      description: 'Define requirements',
      color: 'text-green-600',
      gradient: 'from-green-50 to-green-100',
      border: 'border-green-500',
      iconBg: 'bg-green-100',
    },
  ];

  const handleEngineSelect = (engineType: ValidEngineTypes) => {
    dispatch(setSelectedEngineType(engineType));
  };

  return (
    <div className="p-6 bg-white">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Create Pipeline</h2>
        <p className="text-sm text-gray-600 mt-1">
          Create a new pipeline by selecting a project and providing a name.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Project */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Project</label>
            <select
              value={selectedProjectId}
              onChange={e => handleProjectChange(e.target.value)}
              className="w-full border bg-white border-gray-200 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="" disabled>
                Select Project
              </option>
              {gitProjectList.map(project => (
                <option
                  key={project.bh_project_id}
                  value={project.bh_project_id}
                >
                  {project.bh_project_name}
                </option>
              ))}
            </select>
            {errors.bh_project_id && (
              <p className="text-red-500 text-sm">Project is required</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Name</label>
            <Input
              {...register('pipeline_name', { required: true })}
              placeholder="Enter pipeline name"
              className="text-sm"
            />
            {errors.pipeline_name && (
              <p className="text-red-500 text-sm">Name is required</p>
            )}
          </div>
        </div>

        {/* Pipeline Type */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Pipeline Type</label>
          <div className="grid grid-cols-2 gap-3">
            {pipelineTypes.map(({ value, icon: Icon, label, description, color, gradient, border, iconBg }, index) => (
              <label key={value} className="relative cursor-pointer group">
                <input
                  type="radio"
                  value={value}
                  {...register('pipeline_type', { required: true })}
                  className="absolute opacity-0"
                />
                <div
                  className={`flex items-center p-4 border-2 rounded-xl transition-all duration-200 ${
                    selectedPipelineType === value
                      ? `${border} bg-gradient-to-${index === 0 ? 'r' : 'l'} ${gradient} shadow-sm`
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          selectedPipelineType === value ? iconBg : 'bg-gray-100'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${
                          selectedPipelineType === value ? color : 'text-gray-600'
                        }`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {label}
                        </span>
                        {selectedPipelineType === value && (
                          <div className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')}`} />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {description}
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
          {errors.pipeline_type && (
            <p className="text-red-500 text-sm">Pipeline type is required</p>
          )}
        </div>

        {/* Engine Type */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Engine Type</label>
          <div className={`grid gap-3 ${engineTypes.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {engineTypes.map(({ id, icon: Icon, label, description, color, gradient, border, iconBg }, index) => (
              <label key={id} className="relative cursor-pointer group">
                <input
                  type="radio"
                  value={id}
                  checked={selectedEngineType === id}
                  onChange={() => handleEngineSelect(id as ValidEngineTypes)}
                  className="absolute opacity-0"
                />
                <div
                  className={`flex items-center p-4 border-2 rounded-xl transition-all duration-200 ${
                    selectedEngineType === id
                      ? `${border} bg-gradient-to-${index % 2 === 0 ? 'r' : 'l'} ${gradient} shadow-sm`
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          selectedEngineType === id ? iconBg : 'bg-gray-100'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${
                          selectedEngineType === id ? color : 'text-gray-600'
                        }`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {label}
                        </span>
                        {selectedEngineType === id && (
                          <div className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')}`} />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {description}
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <button
            type="button"
            className="text-blue-600 hover:text-blue-700 flex items-center text-sm font-medium transition-colors"
            onClick={() => setShowNotes(prev => !prev)}
          >
            Add Notes{' '}
            {showNotes ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-1 h-4 w-4" />
            )}
          </button>
          {showNotes && (
            <textarea
              {...register('notes')}
              className="mt-2 w-full p-3 border border-gray-200 rounded-md resize-none text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter notes here..."
              rows={3}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !isValid}>
            {isLoading ? 'Creating…' : 'Create Pipeline'}
          </Button>
        </div>
      </form>
    </div>
  );
};